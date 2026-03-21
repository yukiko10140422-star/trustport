import { describe, it, expect } from 'vitest';
import { classifyTask } from '../../action-detector';

describe('classifyTask', () => {
  // --- chat: 挨拶 ---
  it('greetings → chat', () => {
    expect(classifyTask('こんにちは').weight).toBe('chat');
    expect(classifyTask('おはよう').weight).toBe('chat');
  });

  // --- chat: 相談・質問（実行依頼ではない） ---
  it('consultation (〜したい) → chat', () => {
    expect(classifyTask('音声機能追加したいんだけど').weight).toBe('chat');
    expect(classifyTask('UIを改善したい').weight).toBe('chat');
    expect(classifyTask('新しい機能を検討したい').weight).toBe('chat');
  });

  it('opinions (〜どう思う) → chat', () => {
    expect(classifyTask('この設計どう思う？').weight).toBe('chat');
    expect(classifyTask('アパレルの方向性どう思います？').weight).toBe('chat');
  });

  it('general questions → chat', () => {
    expect(classifyTask('今日の天気は？').weight).toBe('chat');
    expect(classifyTask('壁打ちしたい').weight).toBe('chat');
  });

  // --- heavy: 明示的な実行依頼（「〜して」） ---
  it('explicit execution → heavy', () => {
    expect(classifyTask('競合を調べて').weight).toBe('heavy');
    expect(classifyTask('スライドを作ってください').weight).toBe('heavy');
    expect(classifyTask('実装してください').weight).toBe('heavy');
    expect(classifyTask('コミットしてpushして').weight).toBe('heavy');
  });

  // --- light: 事業データの読み取り ---
  it('business + data query → light', () => {
    expect(classifyTask('アパレル事業の進捗教えて').weight).toBe('light');
    expect(classifyTask('DXプロジェクトの状況は？').weight).toBe('light');
    expect(classifyTask('YURAの計画どうなってる？').weight).toBe('light');
  });

  // --- light: ツール系 ---
  it('calendar/todo → light', () => {
    expect(classifyTask('今月の予定教えて').weight).toBe('light');
    expect(classifyTask('TODO一覧見せて').weight).toBe('light');
  });

  // --- 境界ケース ---
  it('consultation about heavy topic → chat (not heavy)', () => {
    // 「スライドについて相談したい」は相談であり作成依頼ではない
    expect(classifyTask('スライドについて相談したいんだけど').weight).toBe('chat');
  });
});
