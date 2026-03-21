'use strict';

const path = require('path');
const { loadDepartmentsFromDir } = require('./lib/department-registry');
const { orchestrate, routeRequest, composeTeam, generatePrompt } = require('./lib/orchestrator');

const COMPANY_DIR = path.join(__dirname, '..', '.company');

// ============================================================
// Output helpers
// ============================================================

function printHeader(text) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ${text}`);
  console.log('='.repeat(50));
}

// ============================================================
// Commands
// ============================================================

function cmdRoute(registry, input) {
  const routed = routeRequest(registry, input);
  printHeader('ルーティング結果');
  console.log(`  入力: "${input}"`);
  console.log(`  担当部署:`);
  for (const dept of routed) {
    console.log(`    - ${dept.name} (${dept.person})`);
  }
}

function cmdOrchestrate(registry, input) {
  const result = orchestrate(registry, input);

  printHeader('オーケストレーション結果');
  console.log(`  入力: "${input}"`);

  console.log(`\n  [ルーティング]`);
  for (const dept of result.routed) {
    console.log(`    → ${dept.name} (${dept.person})`);
  }

  console.log(`\n  [チーム編成]`);
  console.log(`    ${result.team.summary}`);
  console.log(`    並列実行: ${result.plan.parallel ? 'はい' : 'いいえ'}`);

  console.log(`\n  [生成プロンプト]`);
  for (const p of result.prompts) {
    console.log(`    --- ${p.departmentId} ---`);
    console.log(`    ${p.prompt.split('\n')[0]}`);
  }
}

function cmdTeam(registry, deptIds) {
  const team = composeTeam(registry, deptIds);
  printHeader('チーム編成');
  console.log(`  ${team.summary}`);
  for (const m of team.members) {
    console.log(`    - ${m.name}: ${m.person} (${m.role})`);
  }
}

// ============================================================
// Main
// ============================================================

function main() {
  const registry = loadDepartmentsFromDir(COMPANY_DIR);
  const args = process.argv.slice(2);
  const cmd = args[0] || 'help';
  const input = args.slice(1).join(' ');

  switch (cmd) {
    case 'route':
      cmdRoute(registry, input);
      break;
    case 'run':
      cmdOrchestrate(registry, input);
      break;
    case 'team':
      cmdTeam(registry, input.split(',').map((s) => s.trim()));
      break;
    default:
      console.log('Usage:');
      console.log('  orchestrate.js route <テキスト>     — 入力テキストのルーティング先を表示');
      console.log('  orchestrate.js run <テキスト>       — フルオーケストレーション');
      console.log('  orchestrate.js team <id1,id2,...>  — チーム編成');
      break;
  }
}

main();
