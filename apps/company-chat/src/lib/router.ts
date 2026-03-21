import type { Department } from '@/types';
import { DEPARTMENTS, getDepartment } from './departments';

const ROUTING_KEYWORDS: Record<string, string[]> = {
  secretary: ['TODO', 'メモ', '壁打ち', '雑談', '相談', '予定', 'カレンダー', 'スケジュール'],
  ceo: ['判断', '決定', '方針', '振り分け', '承認'],
  pm: ['プロジェクト', 'マイルストーン', '進捗', 'チケット', 'タスク'],
  research: ['調査', '調べ', '競合', '市場', 'トレンド', 'リサーチ'],
  marketing: ['コンテンツ', 'SNS', '集客', '広告', 'LP', 'キャンペーン', 'マーケ'],
  engineering: ['実装', '設計', 'アーキテクチャ', 'バグ', 'デバッグ', 'コード', '開発'],
  finance: ['請求', '経費', '売上', '確定申告', 'インボイス', '経理'],
  sales: ['クライアント', '提案', '見積', '案件', '商談', '営業'],
  creative: ['デザイン', 'ロゴ', 'バナー', 'ブランド', 'ビジュアル'],
  hr: ['採用', 'チーム', 'メンバー', '人事'],
  legal: ['契約', '規約', 'コンプライアンス', '法律', '許認可', '法務'],
  logistics: ['在庫', '配送', '仕入れ', '倉庫', '発送', '梱包'],
  ebay: ['eBay', 'リスティング', '出品', 'バイヤー'],
  apparel: ['アパレル', 'コレクション', '被災地', 'デジタルアーカイブ', '服'],
  dx: ['DXソフト', 'プロダクト', 'SaaS', 'ツール開発'],
};

// Person name → department mapping
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
  '織田': 'apparel', '美咲': 'apparel', '小田': 'apparel',
  '九条': 'dx', '翔': 'dx',
};

export function routeMessage(input: string, forceDeptId?: string): Department {
  if (forceDeptId) {
    return getDepartment(forceDeptId) ?? DEPARTMENTS.secretary;
  }

  if (!input.trim()) return DEPARTMENTS.secretary;

  // Check person names first
  for (const [name, deptId] of Object.entries(PERSON_ROUTING)) {
    if (input.includes(name)) {
      return DEPARTMENTS[deptId];
    }
  }

  // Then check keywords
  const lower = input.toLowerCase();
  for (const [deptId, keywords] of Object.entries(ROUTING_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return DEPARTMENTS[deptId];
      }
    }
  }

  return DEPARTMENTS.secretary;
}
