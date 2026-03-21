import { getSupabaseAdmin } from './supabase';

// --- 会話永続化サービス ---
// テーブル: conversations (id, user_email, title, created_at, updated_at)
// テーブル: messages (id, conversation_id, role, content, department_id, department_name, person, model, image_url, created_at)

export interface ConversationRow {
  id: string;
  user_email: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  department_id: string | null;
  department_name: string | null;
  person: string | null;
  model: string | null;
  image_url: string | null;
  created_at: string;
}

/** 会話一覧を取得（最新順） */
export async function listConversations(userEmail: string, limit = 30): Promise<ConversationRow[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('conversations')
    .select('*')
    .eq('user_email', userEmail)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/** 新しい会話を作成 */
export async function createConversation(userEmail: string, title: string): Promise<ConversationRow> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('conversations')
    .insert({ user_email: userEmail, title })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** 会話のタイトルを更新 */
export async function updateConversationTitle(id: string, title: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

/** 会話を削除 */
export async function deleteConversation(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  // messagesはcascade deleteされる想定
  const { error } = await sb
    .from('conversations')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/** 会話内のメッセージ一覧を取得 */
export async function getMessages(conversationId: string): Promise<MessageRow[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

/** メッセージを保存 */
export async function saveMessage(msg: {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  departmentId?: string;
  departmentName?: string;
  person?: string;
  model?: string;
  imageUrl?: string;
}): Promise<MessageRow> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('messages')
    .insert({
      conversation_id: msg.conversationId,
      role: msg.role,
      content: msg.content,
      department_id: msg.departmentId || null,
      department_name: msg.departmentName || null,
      person: msg.person || null,
      model: msg.model || null,
      image_url: msg.imageUrl || null,
    })
    .select()
    .single();
  if (error) throw error;

  // 会話のupdated_atも更新
  await sb
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', msg.conversationId);

  return data;
}

/** 最初のユーザーメッセージから会話タイトルを自動生成 */
export function generateTitle(message: string): string {
  const clean = message.replace(/\n/g, ' ').trim();
  return clean.length > 40 ? clean.slice(0, 40) + '...' : clean;
}
