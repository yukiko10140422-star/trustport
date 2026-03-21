import { getSupabaseAdmin } from '@/lib/supabase';

const PREVIEW_LENGTH = 500;
const DEFAULT_LIMIT = 10;

export interface DocumentSearchResult {
  file_path: string;
  title: string | null;
  department: string;
  doc_type: string;
  status: string | null;
  doc_date: string | null;
  content_preview: string;
  content_length: number;
}

export interface DocumentDetail {
  file_path: string;
  title: string | null;
  department: string;
  doc_type: string;
  status: string | null;
  doc_date: string | null;
  content: string;
  content_length: number;
}

/**
 * 社内資料を全文検索（ILIKE + pg_trgm）
 */
export async function searchDocuments(
  query: string,
  options?: {
    department?: string;
    docType?: string;
    limit?: number;
  },
): Promise<DocumentSearchResult[]> {
  const supabase = getSupabaseAdmin();
  const limit = options?.limit || DEFAULT_LIMIT;

  // キーワード分割（スペース区切り）
  const keywords = query.split(/\s+/).filter(Boolean);
  if (keywords.length === 0) return [];

  // クエリ構築
  let q = supabase
    .from('company_documents')
    .select('file_path, title, department, doc_type, status, doc_date, content, content_length');

  // 各キーワードでILIKE AND条件
  for (const kw of keywords) {
    q = q.ilike('content', `%${kw}%`);
  }

  // フィルタ
  if (options?.department) {
    q = q.eq('department', options.department);
  }
  if (options?.docType) {
    q = q.eq('doc_type', options.docType);
  }

  const { data, error } = await q
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((doc: Record<string, unknown>) => ({
    file_path: doc.file_path as string,
    title: doc.title as string | null,
    department: doc.department as string,
    doc_type: doc.doc_type as string,
    status: doc.status as string | null,
    doc_date: doc.doc_date as string | null,
    content_preview: ((doc.content as string) || '').slice(0, PREVIEW_LENGTH),
    content_length: doc.content_length as number,
  }));
}

/**
 * 特定ドキュメントの全文を取得
 */
export async function getDocumentDetail(
  filePath: string,
): Promise<DocumentDetail | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('company_documents')
    .select('file_path, title, department, doc_type, status, doc_date, content, content_length')
    .eq('file_path', filePath)
    .single();

  if (error || !data) return null;

  return {
    file_path: data.file_path,
    title: data.title,
    department: data.department,
    doc_type: data.doc_type,
    status: data.status,
    doc_date: data.doc_date,
    content: data.content,
    content_length: data.content_length,
  };
}
