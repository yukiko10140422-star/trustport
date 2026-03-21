import type { Department } from '@/types';
import { DEPARTMENTS, getDepartment } from './departments';

// 名前で直接指名された場合のみ部署ルーティング
const PERSON_ROUTING: Record<string, string> = {
  'ひなた': 'secretary', '藤崎': 'secretary',
  '黒田': 'ceo', '誠一郎': 'ceo',
  '白石': 'pm', '凛': 'pm',
  '深山': 'research', '蒼': 'research',
  '日向': 'marketing', '彩乃': 'marketing',
  '鉄井': 'engineering', '航': 'engineering',
  '堅田': 'finance', '数子': 'finance',
  '風間': 'sales', '拓也': 'sales',
  '彩川': 'creative', 'ルナ': 'creative',
  '温井': 'hr', 'さくら': 'hr',
  '石堂': 'legal', '正義': 'legal',
  '早川': 'logistics', '剛': 'logistics',
  '海野': 'ebay', 'マリカ': 'ebay',
  '織田': 'apparel', '美咲': 'apparel',
  '九条': 'dx', '翔': 'dx',
};

/**
 * メッセージのルーティング。
 *
 * 秘書がデフォルトの窓口。部署への転送は以下の場合のみ：
 * 1. ユーザーが部署ボタンで明示的に選択した場合（forceDeptId）
 * 2. ユーザーが担当者名を直接呼んだ場合（「鉄井さんに聞きたい」）
 *
 * キーワードベースの自動ルーティングは廃止。
 * 秘書が全部署の知識を持ち、一人で対応する。
 */
export function routeMessage(input: string, forceDeptId?: string): Department {
  // 1. 明示的に部署が選択されている場合
  if (forceDeptId) {
    return getDepartment(forceDeptId) ?? DEPARTMENTS.secretary;
  }

  if (!input.trim()) return DEPARTMENTS.secretary;

  // 2. 担当者名が直接呼ばれた場合のみルーティング
  for (const [name, deptId] of Object.entries(PERSON_ROUTING)) {
    if (input.includes(name) && deptId !== 'secretary') {
      return DEPARTMENTS[deptId];
    }
  }

  // 3. それ以外は全て秘書が対応
  return DEPARTMENTS.secretary;
}
