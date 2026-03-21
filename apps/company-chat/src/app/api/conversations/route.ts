import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';
import { listConversations, createConversation, generateTitle } from '@/lib/conversations';

export async function GET() {
  const auth = await getAuthSession();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversations = await listConversations(auth.email);
  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthSession();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const title = body.title || generateTitle(body.message || '新しい会話');
  const conv = await createConversation(auth.email, title);
  return NextResponse.json(conv);
}
