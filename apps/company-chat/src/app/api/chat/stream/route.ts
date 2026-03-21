import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthSession } from '@/lib/api-auth';
import { routeMessage } from '@/lib/router';
import { buildCacheableSystemPrompt, buildSecretaryRoutingMessage } from '@/lib/prompt-builder';
import { selectModel } from '@/lib/model-selector';
import { MODELS } from '@/lib/constants';
import { TOOLS } from '@/lib/tools/definitions';
import { executeTool } from '@/lib/tools/handlers';
import { saveMessage, createConversation, generateTitle } from '@/lib/conversations';
import { extractPdfText } from '@/lib/pdf-extractor';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_TOOL_ROUNDS = 5;

export async function POST(req: NextRequest) {
  const auth = await getAuthSession();
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await req.json();
  const {
    message,
    model: userModel,
    history = [],
    departmentId,
    conversationId: existingConvId,
    images = [],
  } = body;

  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'Message required' }), { status: 400 });
  }

  const dept = routeMessage(message, departmentId);
  const modelKey = selectModel(userModel as string | undefined);
  const modelId = MODELS[modelKey].id;
  const systemPrompt = buildCacheableSystemPrompt(dept);
  const routingMessage = buildSecretaryRoutingMessage(dept, message);

  const { accessToken } = auth;

  // ユーザーメッセージを組み立て（画像/PDF あり/なし）
  let userContent: Anthropic.ContentBlockParam[] | string;
  const typedImages = images as Array<{ url: string; type: string }>;

  const pdfImages = typedImages.filter(img => img.type === 'application/pdf');
  const nonPdfImages = typedImages.filter(img => img.type !== 'application/pdf');

  let pdfContext = '';
  for (const pdf of pdfImages) {
    const result = await extractPdfText(pdf.url);
    if (result.success && result.text) {
      pdfContext += `\n\n--- 添付PDF (${result.pages}ページ${result.truncated ? '、一部抜粋' : ''}) ---\n${result.text}`;
    } else {
      pdfContext += `\n\n--- 添付PDF ---\n${result.error || 'テキスト抽出失敗'}`;
    }
  }

  const fullMessage = pdfContext ? message + pdfContext : message;

  if (nonPdfImages.length > 0) {
    const blocks: Anthropic.ContentBlockParam[] = [];
    for (const img of nonPdfImages) {
      blocks.push({
        type: 'image',
        source: {
          type: 'url',
          url: img.url,
        },
      });
    }
    blocks.push({ type: 'text', text: fullMessage });
    userContent = blocks;
  } else {
    userContent = fullMessage;
  }

  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userContent },
  ];

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        let conversationId = existingConvId;
        if (!conversationId) {
          try {
            const conv = await createConversation(auth.email, generateTitle(message));
            conversationId = conv.id;
          } catch (e) {
            console.error('会話作成失敗:', e);
            conversationId = null;
          }
        }

        if (conversationId) {
          try {
            await saveMessage({
              conversationId,
              role: 'user',
              content: message,
              imageUrl: images.length > 0 ? (images as Array<{ url: string }>)[0].url : undefined,
            });
          } catch (e) {
            console.error('ユーザーメッセージ保存失敗:', e);
          }
        }

        send('meta', {
          departmentId: dept.id,
          departmentName: dept.name,
          person: dept.person,
          model: modelKey,
          routingMessage,
          conversationId,
        });

        let fullText = '';
        let rounds = 0;
        let needsMore = true;

        while (needsMore && rounds <= MAX_TOOL_ROUNDS) {
          const apiStream = client.messages.stream({
            model: modelId,
            max_tokens: 4096,
            system: systemPrompt,
            messages,
            tools: TOOLS,
          });

          let currentToolUseBlocks: Array<{
            id: string;
            name: string;
            inputJson: string;
          }> = [];
          let hasToolUse = false;
          let currentInputJson = '';

          for await (const event of apiStream) {
            if (event.type === 'content_block_start') {
              if (event.content_block.type === 'tool_use') {
                hasToolUse = true;
                currentInputJson = '';
                currentToolUseBlocks.push({
                  id: event.content_block.id,
                  name: event.content_block.name,
                  inputJson: '',
                });
              }
            } else if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                fullText += event.delta.text;
                send('text', { text: event.delta.text });
              } else if (event.delta.type === 'input_json_delta') {
                currentInputJson += event.delta.partial_json;
                if (currentToolUseBlocks.length > 0) {
                  currentToolUseBlocks[currentToolUseBlocks.length - 1].inputJson = currentInputJson;
                }
              }
            }
          }

          if (hasToolUse && currentToolUseBlocks.length > 0 && rounds < MAX_TOOL_ROUNDS) {
            rounds++;
            send('tool_start', { tools: currentToolUseBlocks.map(t => t.name) });

            const finalMessage = await apiStream.finalMessage();
            messages.push({ role: 'assistant', content: finalMessage.content });

            const toolResults: Anthropic.ToolResultBlockParam[] = [];
            for (const toolBlock of currentToolUseBlocks) {
              let input: Record<string, unknown> = {};
              try {
                input = JSON.parse(toolBlock.inputJson || '{}');
              } catch {
                input = {};
              }

              const result = await executeTool(toolBlock.name, input, accessToken);
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolBlock.id,
                content: result,
              });
            }

            messages.push({ role: 'user', content: toolResults });
            send('tool_end', { tools: currentToolUseBlocks.map(t => t.name) });

            currentToolUseBlocks = [];
            hasToolUse = false;
            currentInputJson = '';
          } else {
            needsMore = false;
          }
        }

        if (conversationId && fullText) {
          try {
            await saveMessage({
              conversationId,
              role: 'assistant',
              content: fullText,
              departmentId: dept.id,
              departmentName: dept.name,
              person: dept.person,
              model: modelKey,
            });
          } catch (e) {
            console.error('アシスタントメッセージ保存失敗:', e);
          }
        }

        send('done', { conversationId });
      } catch (err: unknown) {
        console.error('Stream error:', err instanceof Error ? err.message : String(err));
        send('error', { error: 'AIの応答中にエラーが発生しました。もう一度お試しください。' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
