import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Anthropic from '@anthropic-ai/sdk';
import { authOptions } from '@/lib/auth';
import { routeMessage } from '@/lib/router';
import { buildSystemPrompt, buildSecretaryRoutingMessage } from '@/lib/prompt-builder';
import { selectModel } from '@/lib/model-selector';
import { MODELS, type ModelKey } from '@/lib/constants';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
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

  const messages = [
    ...history.slice(-10).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  try {
    const response = await client.messages.create({
      model: modelId,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

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
  } catch (err: any) {
    console.error('Claude API error:', err.message);
    return NextResponse.json(
      { error: err.message || 'API error' },
      { status: 500 },
    );
  }
}
