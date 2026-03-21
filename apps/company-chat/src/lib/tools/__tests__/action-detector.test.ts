import { describe, it, expect } from 'vitest';
import { isHeavyTask } from '../../action-detector';

describe('isHeavyTask', () => {
  // --- heavy: 明示的な実行依頼 ---
  it('調査・リサーチ依頼 → heavy/research', () => {
    expect(isHeavyTask('競合を調べて')).toEqual({ isHeavy: true, taskType: 'research' });
    expect(isHeavyTask('リサーチしてください')).toEqual({ isHeavy: true, taskType: 'research' });
  });

  it('スライド作成依頼 → heavy/slide', () => {
    expect(isHeavyTask('スライドを作ってください')).toEqual({ isHeavy: true, taskType: 'slide' });
    expect(isHeavyTask('企画書を作成お願い')).toEqual({ isHeavy: true, taskType: 'slide' });
  });

  it('コード実行依頼 → heavy/code', () => {
    expect(isHeavyTask('実装してください')).toEqual({ isHeavy: true, taskType: 'code' });
    expect(isHeavyTask('コミットしてpushして')).toEqual({ isHeavy: true, taskType: 'code' });
  });

  it('レポート作成依頼 → heavy/report', () => {
    expect(isHeavyTask('レポートを作ってください')).toEqual({ isHeavy: true, taskType: 'report' });
  });

  it('ファイル操作依頼 → heavy/file-op', () => {
    expect(isHeavyTask('ドキュメントを作成してください')).toEqual({ isHeavy: true, taskType: 'file-op' });
  });

  // --- not heavy: LLMが判断するメッセージ ---
  it('挨拶 → not heavy', () => {
    expect(isHeavyTask('こんにちは').isHeavy).toBe(false);
    expect(isHeavyTask('おはよう').isHeavy).toBe(false);
  });

  it('相談・質問 → not heavy', () => {
    expect(isHeavyTask('ベースカラーを変えたい').isHeavy).toBe(false);
    expect(isHeavyTask('この設計どう思う？').isHeavy).toBe(false);
    expect(isHeavyTask('壁打ちしたい').isHeavy).toBe(false);
  });

  it('データ参照 → not heavy', () => {
    expect(isHeavyTask('今月の予定教えて').isHeavy).toBe(false);
    expect(isHeavyTask('TODO一覧見せて').isHeavy).toBe(false);
    expect(isHeavyTask('アパレル事業の進捗教えて').isHeavy).toBe(false);
  });
});
