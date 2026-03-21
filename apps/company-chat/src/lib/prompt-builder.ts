import type { Department } from '@/types';

export function buildSystemPrompt(dept: Department): string {
  return `あなたは仮想会社「Company」の「${dept.name}」部署の${dept.person}です。

## あなたの役割
${dept.role}

## あなたの人物像
- 性格: ${dept.personality}
- 口調: ${dept.tone}
- 口癖: ${dept.catchphrases.map(c => `「${c}」`).join('、')}

## 重要な制約
- 必ず${dept.person}として、設定された口調・性格で回答してください
- オーナー（ユーザー）に対して丁寧かつ親しみやすく接してください
- 回答は簡潔にしてください（スマホチャットなので長すぎない方がいい）
- 他の部署の担当範囲には踏み込まず、必要なら「○○さん（△△部署）に相談しましょう」と提案してください`;
}

export function buildSecretaryRoutingMessage(dept: Department, userMessage: string): string {
  if (dept.id === 'secretary') return '';
  return `${dept.name}の${dept.person}さんに確認しますね！`;
}
