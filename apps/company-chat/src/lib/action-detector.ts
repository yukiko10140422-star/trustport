/**
 * Heavy task detection for the task queue.
 *
 * chat/light の分類は廃止。LLM（Sonnet）が統一プロンプトで自ら判断する。
 * ここでは「ワーカーキューに送るべき重いタスク」のみ検出する。
 */

import type { TaskType } from '@/types';

const HEAVY_EXECUTION_PATTERNS: { pattern: RegExp; taskType: TaskType }[] = [
  { pattern: /(?:調べて|調査して|リサーチして)/, taskType: 'research' },
  { pattern: /(?:スライド|プレゼン|企画書|pptx|パワポ|資料).*(?:作って|作成|お願い)/, taskType: 'slide' },
  { pattern: /(?:実装して|コード.*書いて|コミットして|push.*して|デプロイして|ビルドして|テスト書いて)/, taskType: 'code' },
  { pattern: /(?:レポート|報告書).*(?:作って|作成|書いて|お願い)/, taskType: 'report' },
  { pattern: /(?:ファイル|ドキュメント).*(?:作成して|作って|更新して|修正して|削除して)/, taskType: 'file-op' },
];

export function isHeavyTask(message: string): { isHeavy: boolean; taskType: TaskType | null } {
  const lower = message.toLowerCase();
  for (const { pattern, taskType } of HEAVY_EXECUTION_PATTERNS) {
    if (pattern.test(lower)) {
      return { isHeavy: true, taskType };
    }
  }
  return { isHeavy: false, taskType: null };
}
