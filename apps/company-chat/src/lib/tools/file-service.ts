import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, copyFileSync, mkdirSync } from 'fs';
import { join, resolve, relative, dirname } from 'path';

// プロジェクトルート（デフォルトはcompany-chatの親 = COMPANYディレクトリ）
let PROJECT_ROOT = resolve(__dirname, '../../../../');

export function setProjectRoot(root: string) {
  PROJECT_ROOT = resolve(root);
}

// アクセス禁止パターン
const BLOCKED_PATTERNS = [
  /^\.env/,
  /\.env$/,
  /node_modules/,
  /^\.git\b/,
  /\.bak$/,
  /\.pem$/,
  /credentials/i,
  /secrets?\.json/i,
];

function isBlocked(relativePath: string): boolean {
  const parts = relativePath.split(/[/\\]/);
  return parts.some(part =>
    BLOCKED_PATTERNS.some(pattern => pattern.test(part))
  ) || BLOCKED_PATTERNS.some(pattern => pattern.test(relativePath));
}

function safePath(inputPath: string): { fullPath: string; relPath: string } | { error: string } {
  const relPath = inputPath.startsWith('/') ? inputPath.slice(1) : inputPath;
  const fullPath = resolve(PROJECT_ROOT, relPath);

  // プロジェクトルート外へのアクセスを拒否
  if (!fullPath.startsWith(PROJECT_ROOT)) {
    return { error: 'アクセス禁止: プロジェクト外のパスです' };
  }

  if (isBlocked(relPath)) {
    return { error: `アクセス禁止: ${relPath} は保護されたパスです` };
  }

  return { fullPath, relPath };
}

// --- Public API ---

export async function listFiles(dirPath: string): Promise<{
  files?: string[];
  error?: string;
}> {
  const resolved = safePath(dirPath);
  if ('error' in resolved) return { error: resolved.error };

  try {
    const entries = readdirSync(resolved.fullPath);
    // .env等をフィルタリング
    const filtered = entries.filter(e => !isBlocked(e));
    return { files: filtered };
  } catch {
    return { error: `ディレクトリが見つかりません: ${dirPath}` };
  }
}

export async function readFile(filePath: string): Promise<{
  content?: string;
  error?: string;
}> {
  const resolved = safePath(filePath);
  if ('error' in resolved) return { error: resolved.error };

  try {
    const content = readFileSync(resolved.fullPath, 'utf-8');
    return { content };
  } catch {
    return { error: `ファイルが見つかりません: ${filePath}` };
  }
}

export async function writeFile(filePath: string, content: string): Promise<{
  success?: boolean;
  backupCreated?: boolean;
  error?: string;
}> {
  const resolved = safePath(filePath);
  if ('error' in resolved) return { error: resolved.error };

  try {
    // 親ディレクトリが存在しなければ作成
    const dir = dirname(resolved.fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // 既存ファイルがある場合はバックアップ
    let backupCreated = false;
    if (existsSync(resolved.fullPath)) {
      copyFileSync(resolved.fullPath, resolved.fullPath + '.bak');
      backupCreated = true;
    }

    writeFileSync(resolved.fullPath, content, 'utf-8');
    return { success: true, backupCreated };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `書き込み失敗: ${message}` };
  }
}

export async function searchFiles(
  query: string,
  dir?: string,
): Promise<{
  matches: Array<{ file: string; lineNum: number; line: string }>;
}> {
  const searchDir = dir || '.';
  const resolved = safePath(searchDir);
  if ('error' in resolved) return { matches: [] };

  const matches: Array<{ file: string; lineNum: number; line: string }> = [];

  function walkDir(currentDir: string) {
    let entries: string[];
    try {
      entries = readdirSync(currentDir);
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const relPath = relative(PROJECT_ROOT, fullPath);

      if (isBlocked(relPath) || isBlocked(entry)) continue;

      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (stat.isFile() && stat.size < 500_000) {
          // 500KB以上のファイルはスキップ
          const content = readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(query)) {
              matches.push({
                file: relPath.replace(/\\/g, '/'),
                lineNum: i + 1,
                line: lines[i].trim().slice(0, 200),
              });
              if (matches.length >= 50) return; // 上限
            }
          }
        }
      } catch {
        // permission errors etc
      }
    }
  }

  walkDir(resolved.fullPath);
  return { matches };
}
