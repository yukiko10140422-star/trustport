-- 会話永続化テーブル
-- Supabase SQL Editor で実行してください

-- 会話テーブル
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '新しい会話',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_email ON conversations(user_email);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL DEFAULT '',
  department_id TEXT,
  department_name TEXT,
  person TEXT,
  model TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Storageバケット（画像アップロード用）
-- NOTE: Supabase Dashboard > Storage から 'company-chat' バケットを
-- Public に設定して作成してください。
-- または以下のSQLで作成:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('company-chat', 'company-chat', true);

-- RLS ポリシー（service_role_key使用時は不要だが、将来的にanon keyに移行する場合に備えて）
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- service_role_keyでの操作を許可
CREATE POLICY "service_role_full_access_conversations" ON conversations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_access_messages" ON messages
  FOR ALL USING (true) WITH CHECK (true);
