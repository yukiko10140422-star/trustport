import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listConversations, createConversation, generateTitle } from '@/lib/conversations';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversations = await listConversations(session.user.email);
  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const title = body.title || generateTitle(body.message || '新しい会話');
  const conv = await createConversation(session.user.email, title);
  return NextResponse.json(conv);
}
