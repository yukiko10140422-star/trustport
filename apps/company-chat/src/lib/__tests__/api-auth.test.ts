import { describe, it, expect, vi, beforeEach } from 'vitest';

// getServerSession モック
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from 'next-auth';
const mockGetSession = vi.mocked(getServerSession);

describe('getAuthSession', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
  });

  it('認証済みセッションからemail・accessTokenを返す', async () => {
    mockGetSession.mockResolvedValue({
      user: { name: 'Test', email: 'test@test.com' },
      accessToken: 'google-token-123',
      expires: '2099-01-01',
    });

    const { getAuthSession } = await import('../api-auth');
    const result = await getAuthSession();

    expect(result).not.toBeNull();
    expect(result!.email).toBe('test@test.com');
    expect(result!.accessToken).toBe('google-token-123');
  });

  it('未認証の場合はnullを返す', async () => {
    mockGetSession.mockResolvedValue(null);

    const { getAuthSession } = await import('../api-auth');
    const result = await getAuthSession();

    expect(result).toBeNull();
  });

  it('emailが無い場合はnullを返す', async () => {
    mockGetSession.mockResolvedValue({
      user: { name: 'Test' },
      expires: '2099-01-01',
    });

    const { getAuthSession } = await import('../api-auth');
    const result = await getAuthSession();

    expect(result).toBeNull();
  });
});
