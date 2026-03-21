import { describe, it, expect } from 'vitest';
import { selectModel } from '../model-selector';

describe('selectModel', () => {
  it('ユーザー指定が有効なキーならそれを優先', () => {
    expect(selectModel('opus')).toBe('opus');
    expect(selectModel('haiku')).toBe('haiku');
    expect(selectModel('sonnet')).toBe('sonnet');
  });

  it('無効なキーは無視してデフォルト sonnet', () => {
    expect(selectModel('gpt-4')).toBe('sonnet');
    expect(selectModel('invalid')).toBe('sonnet');
    expect(selectModel('')).toBe('sonnet');
  });

  it('未指定はデフォルト sonnet', () => {
    expect(selectModel()).toBe('sonnet');
    expect(selectModel(undefined)).toBe('sonnet');
  });
});
