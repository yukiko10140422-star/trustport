import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase module with chainable query builder
const mockResult = { data: null as unknown, error: null as unknown };

const chainable: Record<string, unknown> = {};
const methods = ['select', 'ilike', 'eq', 'order', 'limit', 'single'];
for (const m of methods) {
  chainable[m] = vi.fn().mockImplementation(() => {
    // single() returns a promise directly
    if (m === 'single') return Promise.resolve(mockResult);
    // limit() returns a promise (terminal)
    if (m === 'limit') return Promise.resolve(mockResult);
    return chainable;
  });
}

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({
    from: () => chainable,
  }),
}));

import { searchDocuments, getDocumentDetail } from '../company-docs-service';

beforeEach(() => {
  vi.clearAllMocks();
  mockResult.data = null;
  mockResult.error = null;
});

describe('searchDocuments', () => {
  it('should return formatted results with preview', async () => {
    mockResult.data = [
      {
        file_path: 'ceo/decisions/2026-03-10-apparel-research.md',
        title: 'アパレル事業リサーチ決定',
        department: 'ceo',
        doc_type: 'decision',
        status: 'decided',
        doc_date: '2026-03-10',
        content: 'A'.repeat(1000),
        content_length: 1000,
      },
    ];

    const results = await searchDocuments('アパレル');

    expect(results).toHaveLength(1);
    expect(results[0].file_path).toBe('ceo/decisions/2026-03-10-apparel-research.md');
    expect(results[0].content_preview.length).toBeLessThanOrEqual(500);
  });

  it('should return empty array when no results', async () => {
    mockResult.data = [];
    const results = await searchDocuments('存在しない');
    expect(results).toEqual([]);
  });

  it('should return empty for empty query', async () => {
    const results = await searchDocuments('');
    expect(results).toEqual([]);
  });
});

describe('getDocumentDetail', () => {
  it('should return full document', async () => {
    mockResult.data = {
      file_path: 'pm/projects/dx.md',
      title: 'DX計画',
      department: 'pm',
      doc_type: 'project',
      status: null,
      doc_date: null,
      content: '# DX計画\n内容...',
      content_length: 20,
    };

    const doc = await getDocumentDetail('pm/projects/dx.md');
    expect(doc).not.toBeNull();
    expect(doc!.content).toContain('DX計画');
  });

  it('should return null for non-existent', async () => {
    mockResult.data = null;
    mockResult.error = { message: 'not found' };
    const doc = await getDocumentDetail('nonexistent.md');
    expect(doc).toBeNull();
  });
});
