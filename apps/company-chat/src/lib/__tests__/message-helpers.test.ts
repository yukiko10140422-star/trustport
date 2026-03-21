import { describe, it, expect } from 'vitest';

describe('message-helpers', () => {
  it('genId は一意な文字列を返す', async () => {
    const { genId } = await import('../message-helpers');
    const id1 = genId();
    const id2 = genId();
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(5);
    expect(id1).not.toBe(id2);
  });

  it('createSecretaryMessage は秘書のメッセージを生成する', async () => {
    const { createSecretaryMessage } = await import('../message-helpers');
    const msg = createSecretaryMessage('テスト');
    expect(msg.role).toBe('assistant');
    expect(msg.content).toBe('テスト');
    expect(msg.departmentId).toBe('secretary');
    expect(msg.person).toBe('藤崎 ひなた');
    expect(msg.departmentName).toBe('秘書室');
    expect(msg.id).toBeTruthy();
    expect(msg.timestamp).toBeGreaterThan(0);
  });

  it('WELCOME_MESSAGE は秘書の挨拶メッセージ', async () => {
    const { WELCOME_MESSAGE } = await import('../message-helpers');
    expect(WELCOME_MESSAGE.role).toBe('assistant');
    expect(WELCOME_MESSAGE.departmentId).toBe('secretary');
    expect(WELCOME_MESSAGE.content).toContain('ひなた');
  });
});
