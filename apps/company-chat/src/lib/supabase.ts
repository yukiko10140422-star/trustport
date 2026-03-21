import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// サーバーサイド用（API Routes） — 遅延初期化でビルド時のクラッシュを防ぐ
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL が未設定です');
    }
    _admin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
    );
  }
  return _admin;
}

/** @deprecated use getSupabaseAdmin() */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// クライアントサイド用（Realtime購読）
export function createSupabaseBrowser(): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL が未設定です');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}
