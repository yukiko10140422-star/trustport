import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
]);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `対応していないファイル形式です: ${file.type}` },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'ファイルサイズは10MB以下にしてください' },
      { status: 400 },
    );
  }

  const sb = getSupabaseAdmin();
  const ext = file.name.split('.').pop() || 'bin';
  const path = `chat-uploads/${session.user.email}/${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await sb.storage
    .from('company-chat')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `アップロード失敗: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const { data: urlData } = sb.storage
    .from('company-chat')
    .getPublicUrl(path);

  return NextResponse.json({
    url: urlData.publicUrl,
    type: file.type,
    name: file.name,
    size: file.size,
  });
}
