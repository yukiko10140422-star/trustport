const MAX_TEXT_LENGTH = 20000;

export interface PdfResult {
  success: boolean;
  text?: string;
  pages?: number;
  truncated?: boolean;
  error?: string;
}

// テスト時にモック差し替え可能にするためexport
export let _pdfParse: ((buf: Buffer) => Promise<{ text: string; numpages: number }>) | null = null;

export function setPdfParser(fn: typeof _pdfParse) {
  _pdfParse = fn;
}

async function getPdfParser() {
  if (_pdfParse) return _pdfParse;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
}

export async function extractPdfText(url: string): Promise<PdfResult> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return {
        success: false,
        error: `PDFの取得に失敗しました (${res.status} ${res.statusText})`,
      };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const parse = await getPdfParser();
    const data = await parse(buffer);

    const rawText = data.text.trim();
    if (!rawText) {
      return {
        success: false,
        error: 'PDFからテキストを抽出できませんでした（スキャンPDFの可能性があります）',
      };
    }

    const truncated = rawText.length > MAX_TEXT_LENGTH;
    const text = truncated
      ? rawText.slice(0, MAX_TEXT_LENGTH) + '...'
      : rawText;

    return {
      success: true,
      text,
      pages: data.numpages,
      truncated,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `PDF処理エラー: ${message}`,
    };
  }
}
