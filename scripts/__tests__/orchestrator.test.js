'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const libPath = path.join(__dirname, '..', 'lib', 'orchestrator.js');
const registryPath = path.join(__dirname, '..', 'lib', 'department-registry.js');

const { createRegistry } = require(registryPath);

function makeRegistry() {
  return createRegistry([
    { id: 'secretary', name: '秘書室', person: '藤崎 ひなた', role: '窓口', group: '常設', dependencies: [], outputs: ['todos', 'notes'] },
    { id: 'ceo', name: 'CEO', person: '黒田 誠一郎', role: '意思決定', group: '常設', dependencies: ['secretary'], outputs: ['decisions'] },
    { id: 'pm', name: 'PM', person: '白石 凛', role: 'プロジェクト管理', group: '常設', dependencies: ['ceo'], outputs: ['projects', 'tickets'] },
    { id: 'research', name: 'リサーチ', person: '深山 蒼', role: '市場調査', group: '常設', dependencies: ['secretary'], outputs: ['topics'] },
    { id: 'engineering', name: '開発', person: '鉄井 航', role: '実装', group: '事業共通', dependencies: ['ceo'], outputs: ['debug-log'] },
    { id: 'marketing', name: 'マーケティング', person: '日向 彩乃', role: 'コンテンツ', group: '事業共通', dependencies: ['research'], outputs: ['campaigns'] },
    { id: 'sales', name: '営業', person: '風間 拓也', role: 'クライアント', group: '事業共通', dependencies: ['pm'], outputs: ['clients'] },
    { id: 'finance', name: '経理', person: '堅田 数子', role: '経理', group: '常設', dependencies: ['secretary'], outputs: ['invoices'] },
  ]);
}

// ============================================================
// Phase 1: Request routing
// ============================================================

describe('routeRequest', () => {
  const { routeRequest } = require(libPath);

  const reg = makeRegistry();

  it('routes to correct department based on keywords', () => {
    const result = routeRequest(reg, '市場調査をお願い');
    assert.ok(result.some((d) => d.id === 'research'));
  });

  it('routes multiple departments for multi-keyword input', () => {
    const result = routeRequest(reg, '設計して実装もお願い');
    assert.ok(result.some((d) => d.id === 'engineering'));
  });

  it('routes to secretary as fallback', () => {
    const result = routeRequest(reg, 'なんかよくわからないけど');
    assert.ok(result.some((d) => d.id === 'secretary'));
  });

  it('returns frozen array', () => {
    assert.ok(Object.isFrozen(routeRequest(reg, 'テスト')));
  });

  it('handles empty input', () => {
    const result = routeRequest(reg, '');
    assert.ok(result.some((d) => d.id === 'secretary'));
  });
});

// ============================================================
// Phase 2: Parallel plan generation
// ============================================================

describe('planParallel', () => {
  const { planParallel } = require(libPath);

  const reg = makeRegistry();

  it('creates a parallel execution plan for multiple departments', () => {
    const plan = planParallel(reg, ['research', 'engineering']);

    assert.equal(plan.departments.length, 2);
    assert.ok(plan.departments.some((d) => d.id === 'research'));
    assert.ok(plan.departments.some((d) => d.id === 'engineering'));
    assert.equal(plan.parallel, true);
  });

  it('handles single department', () => {
    const plan = planParallel(reg, ['ceo']);
    assert.equal(plan.departments.length, 1);
    assert.equal(plan.parallel, false);
  });

  it('skips unknown department IDs', () => {
    const plan = planParallel(reg, ['research', 'ghost']);
    assert.equal(plan.departments.length, 1);
  });

  it('returns frozen plan', () => {
    const plan = planParallel(reg, ['ceo']);
    assert.ok(Object.isFrozen(plan));
    assert.ok(Object.isFrozen(plan.departments));
  });
});

// ============================================================
// Phase 3: Prompt generation
// ============================================================

describe('generatePrompt', () => {
  const { generatePrompt } = require(libPath);

  const reg = makeRegistry();

  it('generates a prompt for a department with context', () => {
    const prompt = generatePrompt(reg, 'research', '市場調査をお願い');

    assert.ok(prompt.includes('深山 蒼'));
    assert.ok(prompt.includes('リサーチ'));
    assert.ok(prompt.includes('市場調査'));
    assert.ok(typeof prompt === 'string');
  });

  it('includes role information', () => {
    const prompt = generatePrompt(reg, 'ceo', '方針を決めて');
    assert.ok(prompt.includes('意思決定'));
    assert.ok(prompt.includes('黒田 誠一郎'));
  });

  it('returns empty string for unknown department', () => {
    assert.equal(generatePrompt(reg, 'ghost', 'hello'), '');
  });
});

// ============================================================
// Phase 4: Team composition
// ============================================================

describe('composeTeam', () => {
  const { composeTeam } = require(libPath);

  const reg = makeRegistry();

  it('composes a team from department IDs', () => {
    const team = composeTeam(reg, ['ceo', 'pm', 'engineering']);
    assert.equal(team.members.length, 3);
    assert.ok(team.members.some((m) => m.id === 'ceo'));
  });

  it('includes team summary', () => {
    const team = composeTeam(reg, ['ceo', 'research']);
    assert.ok(typeof team.summary === 'string');
    assert.ok(team.summary.includes('CEO'));
    assert.ok(team.summary.includes('リサーチ'));
  });

  it('returns frozen object', () => {
    const team = composeTeam(reg, ['ceo']);
    assert.ok(Object.isFrozen(team));
    assert.ok(Object.isFrozen(team.members));
  });

  it('handles empty input', () => {
    const team = composeTeam(reg, []);
    assert.equal(team.members.length, 0);
  });
});

// ============================================================
// Phase 5: Full orchestration flow
// ============================================================

describe('orchestrate', () => {
  const { orchestrate } = require(libPath);

  const reg = makeRegistry();

  it('produces a full orchestration result', () => {
    const result = orchestrate(reg, '市場を調査して報告書を作って');

    assert.ok(Array.isArray(result.routed));
    assert.ok(result.routed.length > 0);
    assert.ok(typeof result.plan === 'object');
    assert.ok(Array.isArray(result.prompts));
    assert.ok(result.prompts.length > 0);
    assert.ok(typeof result.team === 'object');
  });

  it('returns frozen result', () => {
    const result = orchestrate(reg, 'テスト');
    assert.ok(Object.isFrozen(result));
  });
});
