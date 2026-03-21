import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractPdfText, setPdfParser } from '../pdf-extractor';

// fetch モック
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// pdf-parse モック
const mockPdfParse = vi.fn();

describe('extractPdfText', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockPdfParse.mockReset();
    setPdfParser(mockPdfParse);
  });

  it('PDFからテキストを抽出する', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    });
    mockPdfParse.mockResolvedValue({ text: 'Hello PDF World', numpages: 1 });

    const result = await extractPdfText('https://example.com/test.pdf');

    expect(result.success).toBe(true);
    expect(result.text).toBe('Hello PDF World');
    expect(result.pages).toBe(1);
  });

  it('テキストが上限を超える場合は切り詰める', async () => {
    const longText = 'あ'.repeat(25000);
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    });
    mockPdfParse.mockResolvedValue({ text: longText, numpages: 50 });

    const result = await extractPdfText('https://example.com/big.pdf');

    expect(result.success).toBe(true);
    expect(result.text!.length).toBeLessThanOrEqual(20003);
    expect(result.truncated).toBe(true);
  });

  it('テキストが空の場合はエラーを返す', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    });
    mockPdfParse.mockResolvedValue({ text: '', numpages: 1 });

    const result = await extractPdfText('https://example.com/scan.pdf');

    expect(result.success).toBe(false);
    expect(result.error).toContain('テキスト');
  });

  it('fetch失敗時はエラーを返す', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' });

    const result = await extractPdfText('https://example.com/missing.pdf');

    expect(result.success).toBe(false);
    expect(result.error).toContain('404');
  });

  it('pdf-parse例外時はエラーを返す', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    });
    mockPdfParse.mockRejectedValue(new Error('Invalid PDF'));

    const result = await extractPdfText('https://example.com/corrupt.pdf');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid PDF');
  });
});
