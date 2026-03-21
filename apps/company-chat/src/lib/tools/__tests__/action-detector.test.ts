import { describe, it, expect } from 'vitest';
import { classifyTask } from '../../action-detector';

describe('classifyTask', () => {
  // --- chat ---
  it('greetings → chat', () => {
    expect(classifyTask('こんにちは').weight).toBe('chat');
    expect(classifyTask('おはよう').weight).toBe('chat');
  });

  it('general questions → chat', () => {
    expect(classifyTask('今日の天気は？').weight).toBe('chat');
    expect(classifyTask('壁打ちしたい').weight).toBe('chat');
  });

  // --- heavy: 明示的な重作業 ---
  it('research keywords → heavy', () => {
    expect(classifyTask('競合を調べて').weight).toBe('heavy');
    expect(classifyTask('市場調査をお願い').weight).toBe('heavy');
  });

  it('slide keywords → heavy', () => {
    expect(classifyTask('スライドを作って').weight).toBe('heavy');
    expect(classifyTask('PPTXで資料作成して').weight).toBe('heavy');
  });

  it('code keywords → heavy', () => {
    expect(classifyTask('実装してください').weight).toBe('heavy');
    expect(classifyTask('コミットしてpushして').weight).toBe('heavy');
  });

  // --- heavy: 事業データが必要な質問 ---
  it('business + data query → heavy', () => {
    expect(classifyTask('アパレル事業の進捗教えて').weight).toBe('heavy');
    expect(classifyTask('DXプロジェクトの状況は？').weight).toBe('heavy');
    expect(classifyTask('eBayの売上確認して').weight).toBe('heavy');
    expect(classifyTask('YURAの計画どうなってる？').weight).toBe('heavy');
  });

  it('business without data query → chat', () => {
    // 事業名だけでデータクエリ動詞がない → chat
    expect(classifyTask('アパレルって何？').weight).toBe('chat');
  });

  it('data query without business → chat', () => {
    // データクエリ動詞だけで事業名がない → chat
    expect(classifyTask('進捗どう？').weight).toBe('chat');
  });

  // --- light: tool_useで処理可能 ---
  it('calendar/todo keywords → light', () => {
    expect(classifyTask('今月の予定教えて').weight).toBe('light');
    expect(classifyTask('TODO一覧見せて').weight).toBe('light');
    expect(classifyTask('カレンダー確認').weight).toBe('light');
  });
});
