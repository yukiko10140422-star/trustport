/**
 * Detect if a user message requires Claude Code execution.
 *
 * Claude Code is used for:
 * - File operations (create, update, delete)
 * - Data queries that need .company/ file access (status, progress, reports)
 *
 * Haiku is used for:
 * - Simple greetings, casual chat
 */

const ACTION_KEYWORDS = [
  // Write actions
  '作成して', '作って', '追加して', '更新して', '修正して', '削除して',
  '保存して', '記録して', '書いて', '設計して', '実装して',
  'コミットして', 'pushして', 'デプロイして',
  'ファイル', 'コードを', 'メモして', 'TODO',
  '入れて', '変更して', '直して', '消して',
  // Read/query actions (need file access)
  '進捗', '状況', 'ステータス', '確認して', '教えて', '見せて',
  '調べて', '調査', 'レポート', '報告', 'まとめて',
  'プロジェクト', '計画', 'スケジュール', '売上', '在庫',
  'リスティング', '決定事項', '振り返り',
  '聞いて', 'きいて',
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

export function needsExecution(message: string): boolean {
  // Simple greetings → Haiku
  if (CHAT_ONLY_PATTERNS.some((p) => p.test(message.trim()))) {
    return false;
  }
  const lower = message.toLowerCase();
  return ACTION_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}
