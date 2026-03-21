/**
 * Detect if a user message requires Claude Code execution,
 * and classify into chat / light / heavy tasks.
 *
 * chat:  通常の会話・相談・質問 → Claude API（即時）
 * light: データ参照が必要 → Claude API + tool_use（即時）
 * heavy: ファイル作成・実行が必要 → ワーカー（非同期）
 *
 * 重要な判定基準:
 * - 「〜したい」「〜どう思う？」「〜について」= 相談 → chat
 * - 「〜して」「〜やって」「〜お願い」= 実行依頼 → heavy or light
 */

import type { TaskType } from '@/types';

// --- 相談・質問パターン（chatに分類、heavyにしない）---
// 「〜したい」「〜考えてる」「〜どう思う」は相談であり実行依頼ではない

const CONSULTATION_PATTERNS = [
  /したい[んの]?(?:だけど|けど|が|です)?$/,
  /したいな[ぁー]?$/,
  /どう(?:思う|思います|かな|でしょう)/,
  /について(?:教えて|聞きたい)?$/,
  /検討|考えて(?:る|いる|みて)/,
  /(?:案|アイデア|意見).*(?:ある|ほしい|ください)/,
  /どうすれば/,
  /何が(?:いい|良い|必要)/,
];

// --- 明示的な実行依頼（heavyに分類）---

const HEAVY_EXECUTION_PATTERNS: { pattern: RegExp; taskType: TaskType }[] = [
  // 「〜して」「〜やって」「〜お願い」= 実行依頼
  { pattern: /(?:調べて|調査して|リサーチして)/, taskType: 'research' },
  { pattern: /(?:スライド|プレゼン|企画書|PPTX|パワポ|資料).*(?:作って|作成|お願い)/, taskType: 'slide' },
  { pattern: /(?:実装して|コード.*書いて|コミットして|pushして|デプロイして|ビルドして|テスト書いて)/, taskType: 'code' },
  { pattern: /(?:レポート|報告書).*(?:作って|作成|書いて|お願い)/, taskType: 'report' },
  { pattern: /(?:ファイル|ドキュメント).*(?:作成して|作って|更新して|修正して|削除して)/, taskType: 'file-op' },
];

// --- 事業データ参照（lightに分類、Supabase検索）---

const BUSINESS_KEYWORDS = [
  'アパレル', 'YURA', 'ゆら', 'DX', 'eBay', 'イーベイ',
  'プロダクト', 'スタートアップ', '被災地', 'QR', 'リバーシブル',
  'vkei', 'V系', 'EC', 'メモリアル', '仮想会社', 'company',
];

const DATA_QUERY_KEYWORDS = [
  '進捗', '状況', 'ステータス', '確認', '見せて',
  'プロジェクト', '計画', '決定事項', '振り返り',
  'どうなってる', 'どこまで',
];

const CHAT_ONLY_PATTERNS = [
  /^こんにちは[！!]?$/,
  /^おはよう/,
  /^お疲れ/,
  /^ありがとう/,
  /^了解/,
  /^はい$/,
  /^うん$/,
  /^おやすみ/,
  /^よろしく/,
];

const TOOL_KEYWORDS = [
  'TODO', '予定', 'カレンダー', 'スケジュール', 'タスク',
  '決定事項', '社内資料',
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

  // 1. Simple greetings → chat
  if (CHAT_ONLY_PATTERNS.some((p) => p.test(trimmed))) {
    return { weight: 'chat', taskType: null };
  }

  // 2. 相談パターン → chat（「〜したい」「〜どう思う」は実行ではない）
  if (CONSULTATION_PATTERNS.some((p) => p.test(trimmed))) {
    return { weight: 'chat', taskType: null };
  }

  const lower = message.toLowerCase();

  // 3. 明示的な実行依頼 → heavy
  for (const { pattern, taskType } of HEAVY_EXECUTION_PATTERNS) {
    if (pattern.test(lower)) {
      return { weight: 'heavy', taskType };
    }
  }

  // 4. 事業データ参照 → light（Supabase検索で即時回答）
  const hasBusiness = BUSINESS_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
  const hasDataQuery = DATA_QUERY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
  if (hasBusiness && hasDataQuery) {
    return { weight: 'light', taskType: null };
  }

  // 5. カレンダー・TODO関連 → light（tool_useで処理）
  if (TOOL_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))) {
    return { weight: 'light', taskType: null };
  }

  // 6. それ以外 → chat
  return { weight: 'chat', taskType: null };
}

/**
 * Legacy compatibility: returns true if message needs any kind of execution.
 */
export function needsExecution(message: string): boolean {
  const { weight } = classifyTask(message);
  return weight !== 'chat';
}
