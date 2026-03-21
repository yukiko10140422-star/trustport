'use strict';

const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');

const libPath = path.join(__dirname, '..', 'lib', 'department-registry.js');

// ============================================================
// Phase 1: META Block Parser
// ============================================================

describe('parseMeta', () => {
  const { parseMeta } = require(libPath);

  it('parses a valid META block from markdown', () => {
    const md = `<!-- META
id: ceo
name: CEO
person: 黒田 誠一郎
role: 意思決定・振り分け
group: 常設
dependencies: [secretary]
outputs: [decisions]
-->

# CEO

Some content here.`;

    const result = parseMeta(md);
    assert.deepEqual(result, {
      id: 'ceo',
      name: 'CEO',
      person: '黒田 誠一郎',
      role: '意思決定・振り分け',
      group: '常設',
      dependencies: ['secretary'],
      outputs: ['decisions'],
    });
  });

  it('parses empty arrays', () => {
    const md = `<!-- META
id: secretary
name: 秘書室
person: 藤崎 ひなた
role: 窓口・TODO管理
group: 常設
dependencies: []
outputs: []
-->`;

    const result = parseMeta(md);
    assert.deepEqual(result.dependencies, []);
    assert.deepEqual(result.outputs, []);
  });

  it('parses multiple items in arrays', () => {
    const md = `<!-- META
id: sales
name: 営業
person: 風間 拓也
role: クライアント管理
group: 事業共通
dependencies: [pm, finance]
outputs: [clients, proposals]
-->`;

    const result = parseMeta(md);
    assert.deepEqual(result.dependencies, ['pm', 'finance']);
    assert.deepEqual(result.outputs, ['clients', 'proposals']);
  });

  it('returns null when no META block exists', () => {
    const md = `# Some Title\n\nNo meta block here.`;
    assert.equal(parseMeta(md), null);
  });

  it('returns null for empty string', () => {
    assert.equal(parseMeta(''), null);
  });

  it('returns null for non-string input', () => {
    assert.equal(parseMeta(null), null);
    assert.equal(parseMeta(undefined), null);
    assert.equal(parseMeta(123), null);
  });

  it('ignores regular HTML comments that are not META', () => {
    const md = `<!-- This is just a comment -->\n# Title`;
    assert.equal(parseMeta(md), null);
  });

  it('handles whitespace variations in META block', () => {
    const md = `<!--  META
id:   engineering
name:   開発
person:   鉄井 航
role:   Claude Codeナレッジベース管理
group:   事業共通
dependencies:   [ceo]
outputs:   [debug-log]
-->`;

    const result = parseMeta(md);
    assert.equal(result.id, 'engineering');
    assert.equal(result.person, '鉄井 航');
    assert.deepEqual(result.dependencies, ['ceo']);
  });

  it('returns frozen (immutable) objects', () => {
    const md = `<!-- META
id: test
name: テスト
person: テスト太郎
role: テスト
group: 常設
dependencies: []
outputs: []
-->`;

    const result = parseMeta(md);
    assert.ok(Object.isFrozen(result));
    assert.ok(Object.isFrozen(result.dependencies));
    assert.ok(Object.isFrozen(result.outputs));
  });

  it('requires all mandatory fields', () => {
    const md = `<!-- META
id: incomplete
name: 不完全
-->`;

    assert.equal(parseMeta(md), null);
  });
});

// ============================================================
// Phase 2: Department Registry (in-memory)
// ============================================================

describe('createRegistry', () => {
  const { createRegistry } = require(libPath);

  it('creates an empty registry', () => {
    const reg = createRegistry([]);
    assert.equal(reg.size, 0);
  });

  it('creates a registry from department metadata array', () => {
    const deps = [
      { id: 'ceo', name: 'CEO', person: 'A', role: 'R', group: '常設', dependencies: [], outputs: [] },
      { id: 'pm', name: 'PM', person: 'B', role: 'R', group: '常設', dependencies: ['ceo'], outputs: ['tickets'] },
    ];
    const reg = createRegistry(deps);
    assert.equal(reg.size, 2);
  });

  it('throws on duplicate department IDs', () => {
    const deps = [
      { id: 'ceo', name: 'CEO', person: 'A', role: 'R', group: '常設', dependencies: [], outputs: [] },
      { id: 'ceo', name: 'CEO2', person: 'B', role: 'R', group: '常設', dependencies: [], outputs: [] },
    ];
    assert.throws(() => createRegistry(deps), /duplicate/i);
  });
});

describe('getDepartment', () => {
  const { createRegistry, getDepartment } = require(libPath);

  const reg = createRegistry([
    { id: 'ceo', name: 'CEO', person: 'A', role: 'R', group: '常設', dependencies: [], outputs: ['decisions'] },
    { id: 'pm', name: 'PM', person: 'B', role: 'R', group: '常設', dependencies: ['ceo'], outputs: ['tickets'] },
  ]);

  it('returns a department by ID', () => {
    const dept = getDepartment(reg, 'ceo');
    assert.equal(dept.id, 'ceo');
    assert.equal(dept.name, 'CEO');
  });

  it('returns null for unknown ID', () => {
    assert.equal(getDepartment(reg, 'nonexistent'), null);
  });

  it('returns null for non-string ID', () => {
    assert.equal(getDepartment(reg, null), null);
    assert.equal(getDepartment(reg, 123), null);
  });
});

describe('listByGroup', () => {
  const { createRegistry, listByGroup } = require(libPath);

  const reg = createRegistry([
    { id: 'ceo', name: 'CEO', person: 'A', role: 'R', group: '常設', dependencies: [], outputs: [] },
    { id: 'pm', name: 'PM', person: 'B', role: 'R', group: '常設', dependencies: [], outputs: [] },
    { id: 'sales', name: '営業', person: 'C', role: 'R', group: '事業共通', dependencies: [], outputs: [] },
  ]);

  it('returns departments in a group', () => {
    const result = listByGroup(reg, '常設');
    assert.equal(result.length, 2);
    assert.ok(result.some((d) => d.id === 'ceo'));
    assert.ok(result.some((d) => d.id === 'pm'));
  });

  it('returns empty array for unknown group', () => {
    assert.deepEqual(listByGroup(reg, 'nonexistent'), []);
  });

  it('returns a frozen array', () => {
    const result = listByGroup(reg, '常設');
    assert.ok(Object.isFrozen(result));
  });
});

describe('findByOutput', () => {
  const { createRegistry, findByOutput } = require(libPath);

  const reg = createRegistry([
    { id: 'ceo', name: 'CEO', person: 'A', role: 'R', group: '常設', dependencies: [], outputs: ['decisions'] },
    { id: 'pm', name: 'PM', person: 'B', role: 'R', group: '常設', dependencies: [], outputs: ['tickets', 'projects'] },
    { id: 'finance', name: '経理', person: 'C', role: 'R', group: '常設', dependencies: [], outputs: ['invoices'] },
  ]);

  it('finds departments that produce a given output', () => {
    const result = findByOutput(reg, 'decisions');
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'ceo');
  });

  it('returns empty for unknown output', () => {
    assert.deepEqual(findByOutput(reg, 'unknown'), []);
  });
});

describe('validateDependencies', () => {
  const { createRegistry, validateDependencies } = require(libPath);

  it('validates when all dependencies exist', () => {
    const reg = createRegistry([
      { id: 'ceo', name: 'CEO', person: 'A', role: 'R', group: '常設', dependencies: [], outputs: [] },
      { id: 'pm', name: 'PM', person: 'B', role: 'R', group: '常設', dependencies: ['ceo'], outputs: [] },
    ]);
    const result = validateDependencies(reg);
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
  });

  it('reports missing dependencies', () => {
    const reg = createRegistry([
      { id: 'pm', name: 'PM', person: 'B', role: 'R', group: '常設', dependencies: ['ceo', 'finance'], outputs: [] },
    ]);
    const result = validateDependencies(reg);
    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 2);
    assert.ok(result.errors[0].includes('ceo'));
    assert.ok(result.errors[1].includes('finance'));
  });

  it('returns frozen result', () => {
    const reg = createRegistry([]);
    const result = validateDependencies(reg);
    assert.ok(Object.isFrozen(result));
    assert.ok(Object.isFrozen(result.errors));
  });
});

// ============================================================
// Phase 3: File-based loading
// ============================================================

describe('loadDepartmentsFromDir', () => {
  const { loadDepartmentsFromDir } = require(libPath);

  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dept-reg-'));

    // Create department directories with CLAUDE.md files
    const depts = [
      {
        dir: 'ceo',
        content: `<!-- META
id: ceo
name: CEO
person: 黒田 誠一郎
role: 意思決定・振り分け
group: 常設
dependencies: [secretary]
outputs: [decisions]
-->

# CEO
`,
      },
      {
        dir: 'secretary',
        content: `<!-- META
id: secretary
name: 秘書室
person: 藤崎 ひなた
role: 窓口・TODO管理
group: 常設
dependencies: []
outputs: [todos, notes, inbox]
-->

# 秘書室
`,
      },
      {
        dir: 'nodept',
        content: `# No META block here\nJust a plain file.`,
      },
    ];

    for (const dept of depts) {
      const dir = path.join(tmpDir, dept.dir);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'CLAUDE.md'), dept.content, 'utf8');
    }

    // A directory without CLAUDE.md
    fs.mkdirSync(path.join(tmpDir, 'empty-dept'), { recursive: true });
  });

  it('loads departments from a directory', () => {
    const reg = loadDepartmentsFromDir(tmpDir);
    assert.equal(reg.size, 2); // Only ceo and secretary have META blocks
  });

  it('skips directories without META blocks', () => {
    const reg = loadDepartmentsFromDir(tmpDir);
    assert.equal(reg.size, 2);
  });

  it('throws for non-existent directory', () => {
    assert.throws(() => loadDepartmentsFromDir('/nonexistent/path'), /directory/i);
  });

  it('returns a usable registry', () => {
    const { getDepartment } = require(libPath);
    const reg = loadDepartmentsFromDir(tmpDir);
    const dept = getDepartment(reg, 'ceo');
    assert.equal(dept.name, 'CEO');
    assert.equal(dept.person, '黒田 誠一郎');
  });
});

// ============================================================
// Phase 4: listGroups / listAll
// ============================================================

describe('listGroups', () => {
  const { createRegistry, listGroups } = require(libPath);

  it('returns unique group names', () => {
    const reg = createRegistry([
      { id: 'a', name: 'A', person: 'P', role: 'R', group: '常設', dependencies: [], outputs: [] },
      { id: 'b', name: 'B', person: 'P', role: 'R', group: '事業共通', dependencies: [], outputs: [] },
      { id: 'c', name: 'C', person: 'P', role: 'R', group: '常設', dependencies: [], outputs: [] },
    ]);
    const groups = listGroups(reg);
    assert.deepEqual([...groups].sort(), ['事業共通', '常設']);
  });

  it('returns frozen array', () => {
    const reg = createRegistry([]);
    assert.ok(Object.isFrozen(listGroups(reg)));
  });
});

describe('listAll', () => {
  const { createRegistry, listAll } = require(libPath);

  it('returns all departments', () => {
    const reg = createRegistry([
      { id: 'a', name: 'A', person: 'P', role: 'R', group: 'G', dependencies: [], outputs: [] },
      { id: 'b', name: 'B', person: 'P', role: 'R', group: 'G', dependencies: [], outputs: [] },
    ]);
    const all = listAll(reg);
    assert.equal(all.length, 2);
  });

  it('returns frozen array', () => {
    const reg = createRegistry([]);
    assert.ok(Object.isFrozen(listAll(reg)));
  });
});
