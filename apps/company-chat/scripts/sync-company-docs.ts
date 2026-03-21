/**
 * .company/ ディレクトリのMDファイルをSupabaseに同期するスクリプト。
 * Usage: npx tsx scripts/sync-company-docs.ts
 */
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, basename, dirname } from 'path';
import { createHash } from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('環境変数 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const COMPANY_DIR = join(process.cwd(), '..', '..', '.company');

// --- ファイル走査 ---

async function walkDir(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkDir(fullPath));
    } else if (entry.name.endsWith('.md') && !entry.name.includes('_template')) {
      files.push(fullPath);
    }
  }
  return files;
}

// --- メタデータ推定 ---

function inferMetadata(relPath: string, content: string) {
  const parts = relPath.replace(/\\/g, '/').split('/');
  const fileName = basename(relPath);

  // department推定
  let department = 'company';
  if (parts.length >= 2 && parts[0] !== 'protocols') {
    department = parts[0]; // e.g., 'ceo', 'apparel', 'research'
  }

  // doc_type推定
  let docType = 'general';
  if (fileName === 'CLAUDE.md') {
    docType = 'claude-md';
  } else if (parts.includes('decisions')) {
    docType = 'decision';
  } else if (parts.includes('projects')) {
    docType = 'project';
  } else if (parts.includes('topics')) {
    docType = 'research';
  } else if (parts.includes('todos')) {
    docType = 'todo';
  } else if (parts.includes('protocols')) {
    docType = 'protocol';
  } else if (parts.includes('brand')) {
    docType = 'brand';
  }

  // title推定: frontmatter or 最初のH1
  let title: string | null = null;
  let status: string | null = null;
  let docDate: string | null = null;

  // YAML frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const fm = fmMatch[1];
    const titleMatch = fm.match(/title:\s*(.+)/);
    if (titleMatch) title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
    const statusMatch = fm.match(/status:\s*(.+)/);
    if (statusMatch) status = statusMatch[1].trim();
    const dateMatch = fm.match(/date:\s*(.+)/);
    if (dateMatch) docDate = dateMatch[1].trim();
  }

  // H1見出しからtitle
  if (!title) {
    const h1Match = content.match(/^#\s+(.+)/m);
    if (h1Match) title = h1Match[1].trim();
  }

  // ファイル名から日付推定
  if (!docDate) {
    const dateFromName = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateFromName) docDate = dateFromName[1];
  }

  return { department, docType, title, status, docDate };
}

// --- メイン ---

async function main() {
  console.log(`[SYNC] .company/ ディレクトリ: ${COMPANY_DIR}`);

  // ファイル一覧取得
  const files = await walkDir(COMPANY_DIR);
  console.log(`[SYNC] MDファイル: ${files.length}件`);

  // 既存レコードのハッシュ取得
  const { data: existing } = await supabase
    .from('company_documents')
    .select('file_path, file_hash');

  const existingMap = new Map<string, string>();
  for (const row of existing || []) {
    existingMap.set(row.file_path, row.file_hash);
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let deleted = 0;

  const currentPaths = new Set<string>();

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const relPath = relative(COMPANY_DIR, filePath).replace(/\\/g, '/');
    const hash = createHash('sha256').update(content).digest('hex');

    currentPaths.add(relPath);

    // ハッシュが同じならスキップ
    if (existingMap.get(relPath) === hash) {
      skipped++;
      continue;
    }

    const meta = inferMetadata(relPath, content);

    const record = {
      file_path: relPath,
      file_name: basename(relPath),
      department: meta.department,
      doc_type: meta.docType,
      title: meta.title,
      status: meta.status,
      doc_date: meta.docDate,
      content,
      content_length: content.length,
      file_hash: hash,
      synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('company_documents')
      .upsert(record, { onConflict: 'file_path' });

    if (error) {
      console.error(`[ERROR] ${relPath}: ${error.message}`);
    } else if (existingMap.has(relPath)) {
      updated++;
    } else {
      inserted++;
    }
  }

  // 削除済みファイルのレコードを削除
  for (const [path] of existingMap) {
    if (!currentPaths.has(path)) {
      await supabase.from('company_documents').delete().eq('file_path', path);
      deleted++;
    }
  }

  console.log(`[SYNC] 完了: 新規${inserted} 更新${updated} スキップ${skipped} 削除${deleted}`);
}

main().catch((err) => {
  console.error('[SYNC] 失敗:', err);
  process.exit(1);
});
