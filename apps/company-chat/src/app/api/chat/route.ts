import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthSession } from '@/lib/api-auth';
import { routeMessage } from '@/lib/router';
import { buildSystemPrompt, buildSecretaryRoutingMessage } from '@/lib/prompt-builder';
import { selectModel } from '@/lib/model-selector';
import { MODELS, type ModelKey } from '@/lib/constants';
import { TOOLS } from '@/lib/tools/definitions';
import { executeTool } from '@/lib/tools/handlers';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_TOOL_ROUNDS = 5;

export async function POST(req: NextRequest) {
  const auth = await getAuthSession();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { message, model: userModel, history = [], departmentId } = body;

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  const dept = routeMessage(message, departmentId);
  const modelKey = selectModel(dept.id, userModel as ModelKey | undefined);
  const modelId = MODELS[modelKey].id;
  const systemPrompt = buildSystemPrompt(dept);
  const routingMessage = buildSecretaryRoutingMessage(dept, message);

  const { accessToken } = auth;

  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  try {
    let response = await client.messages.create({
      model: modelId,
      max_tokens: 2048,
      system: systemPrompt,
      messages,
      tools: TOOLS,
    });

    // tool_use ループ
    let rounds = 0;
    while (response.stop_reason === 'tool_use' && rounds < MAX_TOOL_ROUNDS) {
      rounds++;

      // assistantの応答をメッセージ履歴に追加
      messages.push({ role: 'assistant', content: response.content });

      // 全てのtool_useブロックを実行
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const result = await executeTool(
            block.name,
            block.input as Record<string, unknown>,
            accessToken,
          );
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      // tool_resultをメッセージ履歴に追加
      messages.push({ role: 'user', content: toolResults });

      // 再度Claude APIを呼ぶ
      response = await client.messages.create({
        model: modelId,
        max_tokens: 2048,
        system: systemPrompt,
        messages,
        tools: TOOLS,
      });
    }

    // 最終テキスト応答を抽出
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    return NextResponse.json({
      departmentId: dept.id,
      departmentName: dept.name,
      person: dept.person,
      model: modelKey,
      routingMessage,
      text,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Claude API error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage || 'API error' },
      { status: 500 },
    );
  }
}
