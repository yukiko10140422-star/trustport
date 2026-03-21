'use strict';

const path = require('path');
const {
  createStep,
  createPipeline,
  validateDAG,
  topologicalSort,
  getParallelGroups,
  createExecution,
  advanceStep,
  getReadySteps,
  isCompleted,
} = require('./lib/pipeline');
const { loadDepartmentsFromDir, getDepartment } = require('./lib/department-registry');

const COMPANY_DIR = path.join(__dirname, '..', '.company');

// ============================================================
// Output helpers
// ============================================================

function printHeader(text) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ${text}`);
  console.log('='.repeat(50));
}

function printStep(step, status) {
  const icon = status === 'completed' ? '[done]'
    : status === 'running' ? '[run] '
    : '[wait]';
  console.log(`  ${icon} ${step.id} (${step.departmentId}) — ${step.action}`);
}

// ============================================================
// Commands
// ============================================================

function cmdValidate(pipelineDef) {
  const pipeline = buildPipeline(pipelineDef);
  const result = validateDAG(pipeline);

  printHeader('DAG Validation');
  if (result.valid) {
    console.log('  Valid DAG — no cycles or missing references');
  } else {
    console.log('  INVALID:');
    for (const err of result.errors) {
      console.log(`    - ${err}`);
    }
  }
  return result.valid ? 0 : 1;
}

function cmdPlan(pipelineDef) {
  const pipeline = buildPipeline(pipelineDef);
  const groups = getParallelGroups(pipeline);
  const registry = loadDepartmentsFromDir(COMPANY_DIR);

  printHeader(`Execution Plan: ${pipeline.name}`);
  for (let i = 0; i < groups.length; i++) {
    console.log(`\n  --- Wave ${i + 1} (parallel) ---`);
    for (const step of groups[i]) {
      const dept = getDepartment(registry, step.departmentId);
      const person = dept ? dept.person : '?';
      console.log(`  ${step.id}: ${step.action} → ${person} (${step.departmentId})`);
    }
  }
  console.log(`\n  Total steps: ${pipeline.steps.length}, waves: ${groups.length}`);
  return 0;
}

function cmdDryRun(pipelineDef) {
  const pipeline = buildPipeline(pipelineDef);
  const registry = loadDepartmentsFromDir(COMPANY_DIR);

  printHeader(`Dry Run: ${pipeline.name}`);

  let exec = createExecution(pipeline);
  let wave = 1;

  while (!isCompleted(exec)) {
    const ready = getReadySteps(pipeline, exec);
    if (ready.length === 0) {
      console.log('\n  [ERROR] No ready steps — possible deadlock');
      return 1;
    }

    console.log(`\n  --- Wave ${wave} ---`);
    for (const step of ready) {
      exec = advanceStep(exec, step.id, 'running');
      const dept = getDepartment(registry, step.departmentId);
      console.log(`  [start] ${step.id} → ${dept ? dept.person : '?'}: ${step.action}`);
    }

    // Simulate completion
    for (const step of ready) {
      exec = advanceStep(exec, step.id, 'completed');
      console.log(`  [done]  ${step.id}`);
    }

    wave++;
  }

  console.log(`\n  Pipeline completed in ${wave - 1} waves.`);
  return 0;
}

// ============================================================
// Pipeline builder (from JSON definition)
// ============================================================

function buildPipeline(def) {
  const steps = def.steps.map((s) => createStep(s));
  return createPipeline({ name: def.name, steps });
}

// ============================================================
// Example pipeline (for demo/testing)
// ============================================================

const EXAMPLE_PIPELINE = {
  name: 'DX事業ターゲット選定',
  steps: [
    { id: 'research', departmentId: 'research', action: '業種別の市場規模・DX需要を調査' },
    { id: 'analysis', departmentId: 'research', action: '調査結果を分析・スコアリング', dependsOn: ['research'] },
    { id: 'decision', departmentId: 'ceo', action: 'ターゲット業種を決定', dependsOn: ['analysis'] },
    { id: 'plan', departmentId: 'pm', action: 'プロジェクト計画を策定', dependsOn: ['decision'] },
    { id: 'arch', departmentId: 'engineering', action: 'アーキテクチャ設計', dependsOn: ['decision'] },
    { id: 'marketing', departmentId: 'marketing', action: 'マーケティング戦略策定', dependsOn: ['decision'] },
    { id: 'kickoff', departmentId: 'pm', action: 'キックオフ会議', dependsOn: ['plan', 'arch', 'marketing'] },
  ],
};

// ============================================================
// Main
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'plan';

  // For now, use example pipeline (future: load from JSON file)
  const def = EXAMPLE_PIPELINE;

  switch (cmd) {
    case 'validate':
      process.exitCode = cmdValidate(def);
      break;
    case 'plan':
      process.exitCode = cmdPlan(def);
      break;
    case 'dry-run':
      process.exitCode = cmdDryRun(def);
      break;
    default:
      console.log('Usage: pipeline-runner.js [validate|plan|dry-run]');
      process.exitCode = 1;
  }
}

main();
