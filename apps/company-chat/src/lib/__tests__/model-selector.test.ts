import { describe, it, expect } from 'vitest';
import { selectModel } from '../model-selector';

describe('selectModel', () => {
  it('ユーザー指定があればそれを優先', () => {
    expect(selectModel('secretary', 'opus')).toBe('opus');
    expect(selectModel('engineering', 'haiku')).toBe('haiku');
  });

  it('CEO部署はsonnet', () => {
    expect(selectModel('ceo')).toBe('sonnet');
  });

  it('技術系部署はsonnet', () => {
    expect(selectModel('engineering')).toBe('sonnet');
    expect(selectModel('research')).toBe('sonnet');
    expect(selectModel('legal')).toBe('sonnet');
    expect(selectModel('dx')).toBe('sonnet');
  });

  it('その他の部署はhaiku', () => {
    expect(selectModel('secretary')).toBe('haiku');
    expect(selectModel('marketing')).toBe('haiku');
    expect(selectModel('sales')).toBe('haiku');
  });

  it('未知の部署IDはhaiku', () => {
    expect(selectModel('unknown')).toBe('haiku');
  });
});
