import { describe, it, expect, vi, beforeEach } from 'vitest';

// fetch をモック
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('searchWeb', () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
  });

  it('正常なレスポンスから結果を返す', async () => {
    vi.stubEnv('BRAVE_SEARCH_API_KEY', 'test-key');
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        web: {
          results: [
            { title: 'Test Result', url: 'https://example.com', description: 'A test result' },
            { title: 'Another', url: 'https://example.org', description: 'Another one' },
          ],
        },
      }),
    });

    const { searchWeb } = await import('../web-search-service');
    const results = await searchWeb('test query');

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      title: 'Test Result',
      url: 'https://example.com',
      snippet: 'A test result',
    });
    expect(mockFetch).toHaveBeenCalledOnce();
    // URLにクエリが含まれる
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('q=test+query');
  });

  it('APIキー未設定時はエラーメッセージを返す', async () => {
    vi.stubEnv('BRAVE_SEARCH_API_KEY', '');
    const { searchWeb } = await import('../web-search-service');
    const results = await searchWeb('test');

    expect(results).toHaveLength(1);
    expect(results[0].title).toContain('未設定');
  });

  it('count パラメータで件数を制限できる', async () => {
    vi.stubEnv('BRAVE_SEARCH_API_KEY', 'test-key');
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ web: { results: [] } }),
    });

    const { searchWeb } = await import('../web-search-service');
    await searchWeb('test', 3);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('count=3');
  });

  it('API エラー時はエラーメッセージを返す', async () => {
    vi.stubEnv('BRAVE_SEARCH_API_KEY', 'test-key');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });

    const { searchWeb } = await import('../web-search-service');
    const results = await searchWeb('test');

    expect(results).toHaveLength(1);
    expect(results[0].title).toContain('エラー');
  });

  it('ネットワークエラー時はエラーメッセージを返す', async () => {
    vi.stubEnv('BRAVE_SEARCH_API_KEY', 'test-key');
    mockFetch.mockRejectedValue(new Error('Network failure'));

    const { searchWeb } = await import('../web-search-service');
    const results = await searchWeb('test');

    expect(results).toHaveLength(1);
    expect(results[0].title).toContain('エラー');
    expect(results[0].snippet).toContain('Network failure');
  });

  it('結果が0件の場合は空配列を返す', async () => {
    vi.stubEnv('BRAVE_SEARCH_API_KEY', 'test-key');
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ web: { results: [] } }),
    });

    const { searchWeb } = await import('../web-search-service');
    const results = await searchWeb('nonexistent');

    expect(results).toEqual([]);
  });
});
