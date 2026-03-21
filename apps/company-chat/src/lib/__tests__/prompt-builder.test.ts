import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildCacheableSystemPrompt } from '../prompt-builder';
import type { Department } from '@/types';

const secretaryDept: Department = {
  id: 'secretary', name: '秘書室', person: '藤崎 ひなた',
  role: '秘書', group: 'staff',
  personality: '明るい', tone: '丁寧', catchphrases: ['おまかせください'],
};

const engDept: Department = {
  id: 'engineering', name: '開発部', person: '鉄井 航',
  role: 'エンジニア', group: 'tech',
  personality: '真面目', tone: 'カジュアル', catchphrases: ['コード書きます'],
};

describe('buildSystemPrompt — 統一プロンプト', () => {
  it('秘書プロンプトに人物像が含まれる', () => {
    const prompt = buildSystemPrompt(secretaryDept);
    expect(prompt).toContain('藤崎 ひなた');
    expect(prompt).toContain('おまかせください');
    expect(prompt).toContain('明るい');
  });

  it('秘書プロンプトに部署一覧が含まれる', () => {
    const prompt = buildSystemPrompt(secretaryDept);
    expect(prompt).toContain('部署');
  });

  it('部署プロンプトに担当者情報が含まれる', () => {
    const prompt = buildSystemPrompt(engDept);
    expect(prompt).toContain('鉄井 航');
    expect(prompt).toContain('開発部');
  });

  it('判断基準セクションが含まれる', () => {
    const prompt = buildSystemPrompt(secretaryDept);
    expect(prompt).toContain('判断基準');
    expect(prompt).toContain('ツールを使うとき');
    expect(prompt).toContain('会話で応答');
  });

  it('ツール利用指示が含まれる', () => {
    const prompt = buildSystemPrompt(secretaryDept);
    expect(prompt).toContain('search_company_docs');
    expect(prompt).toContain('get_calendar_events');
    expect(prompt).toContain('web_search');
    expect(prompt).toContain('read_file');
    expect(prompt).toContain('write_file');
  });

  it('リッチコンテンツ指示が含まれる', () => {
    const prompt = buildSystemPrompt(secretaryDept);
    expect(prompt).toContain('artifact');
    expect(prompt).toContain('TailwindCSS');
  });

  it('日付が含まれる', () => {
    const prompt = buildSystemPrompt(secretaryDept);
    expect(prompt).toContain('今日の日付');
  });

  it('mode 引数を受け取らない（単一プロンプト）', () => {
    // buildSystemPrompt は Department のみ受け取る
    expect(buildSystemPrompt.length).toBe(1);
  });
});

describe('buildCacheableSystemPrompt — キャッシュ対応', () => {
  it('配列を返す', () => {
    const result = buildCacheableSystemPrompt(secretaryDept);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('最初のブロックに cache_control がある', () => {
    const result = buildCacheableSystemPrompt(secretaryDept);
    expect(result[0].type).toBe('text');
    expect((result[0] as Record<string, unknown>).cache_control).toEqual({ type: 'ephemeral' });
  });

  it('2番目のブロックに日付が含まれる', () => {
    const result = buildCacheableSystemPrompt(secretaryDept);
    expect((result[1] as { text: string }).text).toContain('今日の日付');
  });

  it('静的ブロックにはプロンプト本体が含まれる', () => {
    const result = buildCacheableSystemPrompt(secretaryDept);
    const staticText = (result[0] as { text: string }).text;
    expect(staticText).toContain('藤崎 ひなた');
    expect(staticText).toContain('判断基準');
    expect(staticText).toContain('search_company_docs');
  });
});
