'use strict';

const { getDepartment } = require('./department-registry');

// ============================================================
// Routing keywords
// ============================================================

const ROUTING_KEYWORDS = Object.freeze({
  secretary: ['TODO', 'メモ', '壁打ち', '雑談', '相談'],
  ceo: ['判断', '決定', '方針', '振り分け', '承認'],
  pm: ['プロジェクト', 'マイルストーン', '進捗', 'スケジュール', 'チケット'],
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
});

// ============================================================
// Request routing
// ============================================================

/**
 * Route a user request to one or more departments based on keyword matching.
 * Falls back to secretary if no keywords match.
 */
function routeRequest(registry, input) {
  if (typeof input !== 'string' || input.trim().length === 0) {
    const sec = getDepartment(registry, 'secretary');
    return Object.freeze(sec ? [sec] : []);
  }

  const matched = new Set();
  const lowerInput = input.toLowerCase();

  for (const [deptId, keywords] of Object.entries(ROUTING_KEYWORDS)) {
    for (const kw of keywords) {
      if (lowerInput.includes(kw.toLowerCase())) {
        const dept = getDepartment(registry, deptId);
        if (dept) matched.add(dept);
        break;
      }
    }
  }

  // Fallback to secretary
  if (matched.size === 0) {
    const sec = getDepartment(registry, 'secretary');
    if (sec) matched.add(sec);
  }

  return Object.freeze([...matched]);
}

// ============================================================
// Parallel plan generation
// ============================================================

/**
 * Create a parallel execution plan for multiple departments.
 */
function planParallel(registry, departmentIds) {
  const departments = [];
  for (const id of departmentIds) {
    const dept = getDepartment(registry, id);
    if (dept) departments.push(dept);
  }

  return Object.freeze({
    departments: Object.freeze(departments),
    parallel: departments.length > 1,
  });
}

// ============================================================
// Prompt generation
// ============================================================

/**
 * Generate an agent prompt for a specific department.
 */
function generatePrompt(registry, departmentId, userRequest) {
  const dept = getDepartment(registry, departmentId);
  if (!dept) return '';

  return [
    `あなたは「${dept.name}」部署の${dept.person}です。`,
    `役割: ${dept.role}`,
    ``,
    `## ユーザーからの依頼`,
    userRequest,
    ``,
    `## 指示`,
    `上記の依頼に対して、${dept.name}の担当として対応してください。`,
    `成果物があれば明確に記録してください。`,
  ].join('\n');
}

// ============================================================
// Team composition
// ============================================================

/**
 * Compose a team from a list of department IDs.
 */
function composeTeam(registry, departmentIds) {
  const members = [];
  for (const id of departmentIds) {
    const dept = getDepartment(registry, id);
    if (dept) members.push(dept);
  }

  const summary = members.length === 0
    ? 'チームメンバーなし'
    : members.map((m) => `${m.name}（${m.person}）`).join('、');

  return Object.freeze({
    members: Object.freeze(members),
    summary,
  });
}

// ============================================================
// Full orchestration
// ============================================================

/**
 * Full orchestration: route → plan → generate prompts → compose team.
 */
function orchestrate(registry, userRequest) {
  const routed = routeRequest(registry, userRequest);
  const ids = routed.map((d) => d.id);
  const plan = planParallel(registry, ids);
  const prompts = Object.freeze(
    routed.map((d) => Object.freeze({
      departmentId: d.id,
      prompt: generatePrompt(registry, d.id, userRequest),
    })),
  );
  const team = composeTeam(registry, ids);

  return Object.freeze({
    routed,
    plan,
    prompts,
    team,
  });
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  routeRequest,
  planParallel,
  generatePrompt,
  composeTeam,
  orchestrate,
  ROUTING_KEYWORDS,
};
