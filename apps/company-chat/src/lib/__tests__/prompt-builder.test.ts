import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '../prompt-builder';
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

describe('buildSystemPrompt', () => {
  it('秘書プロンプトにツール利用セクションが含まれる', () => {
    const prompt = buildSystemPrompt(secretaryDept);
    expect(prompt).toContain('search_company_docs');
    expect(prompt).toContain('get_calendar_events');
    expect(prompt).toContain('web_search');
  });

  it('部署プロンプトにもツール利用セクションが含まれる', () => {
    const prompt = buildSystemPrompt(engDept);
    expect(prompt).toContain('search_company_docs');
    expect(prompt).toContain('get_calendar_events');
    expect(prompt).toContain('web_search');
  });

  it('秘書プロンプトにリッチコンテンツ指示が含まれる', () => {
    const prompt = buildSystemPrompt(secretaryDept);
    expect(prompt).toContain('artifact');
    expect(prompt).toContain('TailwindCSS');
  });

  it('部署プロンプトにもリッチコンテンツ指示が含まれる', () => {
    const prompt = buildSystemPrompt(engDept);
    expect(prompt).toContain('artifact');
    expect(prompt).toContain('TailwindCSS');
  });

  it('秘書プロンプトに人物像が含まれる', () => {
    const prompt = buildSystemPrompt(secretaryDept);
    expect(prompt).toContain('藤崎 ひなた');
    expect(prompt).toContain('おまかせください');
  });

  it('部署プロンプトに部署名・担当者が含まれる', () => {
    const prompt = buildSystemPrompt(engDept);
    expect(prompt).toContain('開発部');
    expect(prompt).toContain('鉄井 航');
  });

  it('今日の日付が含まれる', () => {
    const prompt = buildSystemPrompt(secretaryDept);
    expect(prompt).toContain('今日の日付');
  });
});
