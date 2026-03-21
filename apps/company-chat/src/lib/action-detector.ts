/**
 * Detect if a user message requires Claude Code execution,
 * and classify into light (軽作業) vs heavy (重作業) tasks.
 *
 * Light tasks: handled by Claude API on Vercel (instant)
 * Heavy tasks: dispatched to local worker via Supabase queue (async)
 */

import type { TaskType } from '@/types';

// --- Heavy task keywords (require Claude Code CLI) ---

const HEAVY_KEYWORDS: Record<TaskType, string[]> = {
  research: [
    '調べて', '調査', 'リサーチ', '競合分析', '市場調査',
    'トレンド', '比較して', '検索して', '深掘り',
  ],
  slide: [
    'スライド', 'プレゼン', '企画書', 'ピッチデッキ', 'PPTX',
    'パワポ', '資料作成', 'デッキ',
  ],
  code: [
    '実装して', '設計して', 'コードを', 'コミットして', 'pushして',
    'デプロイして', 'ビルド', 'テスト書いて', 'リファクタ',
  ],
  report: [
    'レポート', '報告書', 'まとめて', '分析して', '集計',
  ],
  'file-op': [
    '作成して', '作って', '追加して', '更新して', '修正して',
    '削除して', '保存して', '記録して', '書いて', 'メモして',
    'ファイル', '変更して', '直して', '消して',
  ],
  heavy: [],
};

// --- 事業・プロジェクト名のキーワード（これらが含まれる「進捗」質問は重作業） ---

const BUSINESS_KEYWORDS = [
  'アパレル', 'YURA', 'ゆら', 'DX', 'eBay', 'イーベイ',
  'プロダクト', 'スタートアップ', '被災地', 'QR', 'リバーシブル',
  'vkei', 'V系', 'EC', 'メモリアル', '仮想会社', 'company',
];

// --- ファイルアクセスが必要な動詞（事業名と組み合わさると重作業） ---

const DATA_QUERY_KEYWORDS = [
  '進捗', '状況', 'ステータス', '確認して', '見せて',
  'プロジェクト', '計画', '決定事項', '振り返り',
  'どうなってる', 'どこまで', '教えて',
];

const CHAT_ONLY_PATTERNS = [
  /^こんにちは[！!]?$/,
  /^おはよう/,
  /^お疲れ/,
  /^ありがとう/,
  /^了解/,
  /^はい$/,
  /^うん$/,
];

export type TaskClassification = {
  weight: 'chat' | 'light' | 'heavy';
  taskType: TaskType | null;
};

/**
 * Classify a message into chat / light / heavy.
 */
export function classifyTask(message: string): TaskClassification {
  const trimmed = message.trim();

  // Simple greetings → chat
  if (CHAT_ONLY_PATTERNS.some((p) => p.test(trimmed))) {
    return { weight: 'chat', taskType: null };
  }

  const lower = message.toLowerCase();

  // Check heavy keywords first (most specific)
  for (const [type, keywords] of Object.entries(HEAVY_KEYWORDS) as [TaskType, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return { weight: 'heavy', taskType: type };
    }
  }

  // 事業データが必要な質問 → 重作業
  // （事業名 + データクエリ動詞の組み合わせ）
  const hasBusiness = BUSINESS_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
  const hasDataQuery = DATA_QUERY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
  if (hasBusiness && hasDataQuery) {
    return { weight: 'heavy', taskType: 'report' };
  }

  // カレンダー・TODO関連 → 軽作業（tool_useで処理可能）
  const TOOL_KEYWORDS = ['TODO', '予定', 'カレンダー', 'スケジュール', 'タスク'];
  if (TOOL_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))) {
    return { weight: 'light', taskType: null };
  }

  // その他の質問・雑談 → chat（軽作業）
  return { weight: 'chat', taskType: null };
}

/**
 * Legacy compatibility: returns true if message needs any kind of execution.
 */
export function needsExecution(message: string): boolean {
  const { weight } = classifyTask(message);
  return weight !== 'chat';
}
