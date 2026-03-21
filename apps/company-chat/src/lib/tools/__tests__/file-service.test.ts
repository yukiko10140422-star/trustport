import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { listFiles, readFile, writeFile, searchFiles, setProjectRoot } from '../file-service';

// テスト用の一時ディレクトリ
const TEST_ROOT = join(__dirname, '__test_project__');

beforeEach(() => {
  mkdirSync(join(TEST_ROOT, 'src'), { recursive: true });
  mkdirSync(join(TEST_ROOT, 'docs'), { recursive: true });
  writeFileSync(join(TEST_ROOT, 'src', 'index.ts'), 'export const hello = "world";');
  writeFileSync(join(TEST_ROOT, 'src', 'utils.ts'), 'export function add(a: number, b: number) { return a + b; }');
  writeFileSync(join(TEST_ROOT, 'docs', 'readme.md'), '# Test Project');
  writeFileSync(join(TEST_ROOT, '.env'), 'SECRET=hidden');
  setProjectRoot(TEST_ROOT);
});

afterEach(() => {
  rmSync(TEST_ROOT, { recursive: true, force: true });
});

describe('listFiles', () => {
  it('ディレクトリのファイル一覧を返す', async () => {
    const result = await listFiles('src');
    expect(result.files).toContain('index.ts');
    expect(result.files).toContain('utils.ts');
  });

  it('ルートディレクトリの一覧を返す', async () => {
    const result = await listFiles('.');
    expect(result.files).toContain('src');
    expect(result.files).toContain('docs');
  });

  it('存在しないディレクトリはエラーを返す', async () => {
    const result = await listFiles('nonexistent');
    expect(result.error).toBeTruthy();
  });
});

describe('readFile', () => {
  it('ファイル内容を読み取る', async () => {
    const result = await readFile('src/index.ts');
    expect(result.content).toBe('export const hello = "world";');
  });

  it('.envファイルはアクセス拒否', async () => {
    const result = await readFile('.env');
    expect(result.error).toContain('アクセス禁止');
  });

  it('パストラバーサルを拒否', async () => {
    const result = await readFile('../../../etc/passwd');
    expect(result.error).toContain('アクセス禁止');
  });

  it('存在しないファイルはエラー', async () => {
    const result = await readFile('nonexistent.ts');
    expect(result.error).toBeTruthy();
  });
});

describe('writeFile', () => {
  it('ファイルを書き込む', async () => {
    const result = await writeFile('src/new.ts', 'export const x = 1;');
    expect(result.success).toBe(true);

    const read = await readFile('src/new.ts');
    expect(read.content).toBe('export const x = 1;');
  });

  it('既存ファイルの上書き時にバックアップを作成', async () => {
    await writeFile('src/index.ts', 'changed content');
    expect(existsSync(join(TEST_ROOT, 'src', 'index.ts.bak'))).toBe(true);
  });

  it('.envへの書き込みは拒否', async () => {
    const result = await writeFile('.env', 'HACK=true');
    expect(result.error).toContain('アクセス禁止');
  });

  it('node_modulesへの書き込みは拒否', async () => {
    const result = await writeFile('node_modules/pkg/index.js', 'hacked');
    expect(result.error).toContain('アクセス禁止');
  });

  it('パストラバーサルを拒否', async () => {
    const result = await writeFile('../../outside.txt', 'escape');
    expect(result.error).toContain('アクセス禁止');
  });
});

describe('searchFiles', () => {
  it('テキストを検索してマッチするファイルと行を返す', async () => {
    const result = await searchFiles('hello');
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].file).toContain('index.ts');
    expect(result.matches[0].line).toContain('hello');
  });

  it('マッチしない場合は空配列', async () => {
    const result = await searchFiles('zzz_nonexistent_zzz');
    expect(result.matches).toEqual([]);
  });

  it('特定ディレクトリに絞って検索できる', async () => {
    const result = await searchFiles('Test', 'docs');
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].file).toContain('readme.md');
  });
});
