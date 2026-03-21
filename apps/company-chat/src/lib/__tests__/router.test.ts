import { describe, it, expect } from 'vitest';
import { routeMessage } from '../router';

describe('routeMessage', () => {
  it('デフォルトは秘書にルーティング', () => {
    const dept = routeMessage('今日の天気は？');
    expect(dept.id).toBe('secretary');
  });

  it('空文字列は秘書にルーティング', () => {
    const dept = routeMessage('');
    expect(dept.id).toBe('secretary');
  });

  it('forceDeptIdがあればその部署に直接ルーティング', () => {
    const dept = routeMessage('何でもいい', 'engineering');
    expect(dept.id).toBe('engineering');
  });

  it('不正なforceDeptIdは秘書にフォールバック', () => {
    const dept = routeMessage('テスト', 'nonexistent');
    expect(dept.id).toBe('secretary');
  });

  it('担当者名で直接指名するとその部署にルーティング', () => {
    const dept = routeMessage('鉄井さんに聞きたい');
    expect(dept.id).toBe('engineering');
  });

  it('秘書の名前を呼んでも秘書のまま（ルーティング不要）', () => {
    const dept = routeMessage('ひなたさん教えて');
    expect(dept.id).toBe('secretary');
  });

  it('担当者名が含まれない一般的な質問は秘書', () => {
    const dept = routeMessage('売上レポートを見せて');
    expect(dept.id).toBe('secretary');
  });
});
