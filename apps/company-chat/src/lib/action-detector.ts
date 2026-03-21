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

// --- Light task keywords (Claude API on Vercel) ---

const LIGHT_ACTION_KEYWORDS = [
  '進捗', '状況', 'ステータス', '確認して', '教えて', '見せて',
  'プロジェクト', '計画', 'スケジュール', '売上', '在庫',
  'リスティング', '決定事項', '振り返り',
  '聞いて', 'きいて', 'TODO', '予定',
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

  // Check heavy keywords first (more specific)
  for (const [type, keywords] of Object.entries(HEAVY_KEYWORDS) as [TaskType, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return { weight: 'heavy', taskType: type };
    }
  }

  // Check light action keywords
  if (LIGHT_ACTION_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))) {
    return { weight: 'light', taskType: null };
  }

  // Default: chat
  return { weight: 'chat', taskType: null };
}

/**
 * Legacy compatibility: returns true if message needs any kind of execution.
 */
export function needsExecution(message: string): boolean {
  const { weight } = classifyTask(message);
  return weight !== 'chat';
}
