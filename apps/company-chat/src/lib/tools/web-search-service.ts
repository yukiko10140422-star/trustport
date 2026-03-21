export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

export async function searchWeb(query: string, count = 5): Promise<SearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return [{
      title: 'Web検索APIキー未設定',
      url: '',
      snippet: 'BRAVE_SEARCH_API_KEY 環境変数を設定してください。https://brave.com/search/api/ で無料取得できます。',
    }];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      count: String(count),
      search_lang: 'ja',
    });

    const res = await fetch(`${BRAVE_API_URL}?${params}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
    });

    if (!res.ok) {
      return [{
        title: `Web検索エラー (${res.status})`,
        url: '',
        snippet: `検索APIがエラーを返しました: ${res.statusText}`,
      }];
    }

    const data = await res.json();
    const results = data?.web?.results;

    if (!Array.isArray(results) || results.length === 0) {
      return [];
    }

    return results.map((r: { title?: string; url?: string; description?: string }) => ({
      title: r.title || '',
      url: r.url || '',
      snippet: r.description || '',
    }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return [{
      title: 'Web検索エラー',
      url: '',
      snippet: `検索に失敗しました: ${message}`,
    }];
  }
}
