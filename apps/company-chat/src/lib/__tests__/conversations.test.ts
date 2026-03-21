import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTitle } from '../conversations';

// Supabase をモック
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();

vi.mock('../supabase', () => ({
  getSupabaseAdmin: () => ({
    from: mockFrom,
  }),
}));

// チェインモック構築ヘルパー
function setupChain(finalResult: { data: unknown; error: unknown }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockResolvedValue(finalResult);
  chain.single = vi.fn().mockResolvedValue(finalResult);
  mockFrom.mockReturnValue(chain);
  return chain;
}

describe('generateTitle', () => {
  it('短いメッセージはそのまま返す', () => {
    expect(generateTitle('今日の予定を教えて')).toBe('今日の予定を教えて');
  });

  it('40文字を超えるメッセージは切り詰める', () => {
    const long = 'あ'.repeat(50);
    const result = generateTitle(long);
    expect(result).toBe('あ'.repeat(40) + '...');
    expect(result.length).toBe(43);
  });

  it('改行をスペースに変換する', () => {
    expect(generateTitle('line1\nline2\nline3')).toBe('line1 line2 line3');
  });

  it('前後の空白をトリムする', () => {
    expect(generateTitle('  hello  ')).toBe('hello');
  });

  it('空文字列は空文字列を返す', () => {
    expect(generateTitle('')).toBe('');
  });
});

describe('listConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ユーザーの会話一覧を取得する', async () => {
    const mockData = [
      { id: '1', user_email: 'test@test.com', title: 'テスト', updated_at: '2026-01-01' },
    ];
    setupChain({ data: mockData, error: null });

    const { listConversations } = await import('../conversations');
    const result = await listConversations('test@test.com');

    expect(result).toEqual(mockData);
    expect(mockFrom).toHaveBeenCalledWith('conversations');
  });

  it('エラー時にthrowする', async () => {
    setupChain({ data: null, error: new Error('DB error') });

    const { listConversations } = await import('../conversations');
    await expect(listConversations('test@test.com')).rejects.toThrow('DB error');
  });
});

describe('createConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('新しい会話を作成する', async () => {
    const mockConv = { id: 'new-id', user_email: 'test@test.com', title: 'テスト' };
    const chain = setupChain({ data: mockConv, error: null });
    // single がチェインの最後
    chain.single = vi.fn().mockResolvedValue({ data: mockConv, error: null });
    chain.select = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);

    const { createConversation } = await import('../conversations');
    const result = await createConversation('test@test.com', 'テスト');

    expect(result).toEqual(mockConv);
  });
});

describe('saveMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('メッセージを保存しupdated_atを更新する', async () => {
    const mockMsg = { id: 'msg-1', conversation_id: 'conv-1', role: 'user', content: 'test' };
    const chain = setupChain({ data: mockMsg, error: null });
    chain.single = vi.fn().mockResolvedValue({ data: mockMsg, error: null });
    chain.select = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue({ data: null, error: null });

    const { saveMessage } = await import('../conversations');
    const result = await saveMessage({
      conversationId: 'conv-1',
      role: 'user',
      content: 'test',
    });

    expect(result).toEqual(mockMsg);
    // from が2回呼ばれる（insert + update）
    expect(mockFrom).toHaveBeenCalledTimes(2);
  });
});
