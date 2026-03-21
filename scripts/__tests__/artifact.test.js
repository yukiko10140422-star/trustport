'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');

const libPath = path.join(__dirname, '..', 'lib', 'artifact.js');
const registryPath = path.join(__dirname, '..', 'lib', 'department-registry.js');

// ============================================================
// Helpers: shared registry for tests
// ============================================================

const { createRegistry } = require(registryPath);

function makeRegistry() {
  return createRegistry([
    { id: 'secretary', name: '秘書室', person: 'A', role: 'R', group: '常設', dependencies: [], outputs: ['todos', 'notes'] },
    { id: 'ceo', name: 'CEO', person: 'B', role: 'R', group: '常設', dependencies: ['secretary'], outputs: ['decisions'] },
    { id: 'pm', name: 'PM', person: 'C', role: 'R', group: '常設', dependencies: ['ceo'], outputs: ['projects', 'tickets'] },
    { id: 'research', name: 'リサーチ', person: 'D', role: 'R', group: '常設', dependencies: ['secretary'], outputs: ['topics'] },
    { id: 'engineering', name: '開発', person: 'E', role: 'R', group: '事業共通', dependencies: ['ceo'], outputs: ['debug-log'] },
    { id: 'sales', name: '営業', person: 'F', role: 'R', group: '事業共通', dependencies: ['pm', 'finance'], outputs: ['clients'] },
    { id: 'finance', name: '経理', person: 'G', role: 'R', group: '常設', dependencies: ['secretary'], outputs: ['invoices'] },
  ]);
}

// ============================================================
// Phase 1: Artifact creation
// ============================================================

describe('createArtifact', () => {
  const { createArtifact } = require(libPath);

  it('creates an artifact with required fields', () => {
    const a = createArtifact({
      departmentId: 'ceo',
      type: 'decisions',
      title: '業種選定の決定',
      path: 'ceo/decisions/2026-03-20-industry-selection.md',
    });

    assert.equal(a.departmentId, 'ceo');
    assert.equal(a.type, 'decisions');
    assert.equal(a.title, '業種選定の決定');
    assert.equal(a.path, 'ceo/decisions/2026-03-20-industry-selection.md');
    assert.equal(a.status, 'created');
    assert.ok(typeof a.id === 'string');
    assert.ok(typeof a.createdAt === 'string');
  });

  it('generates unique IDs', () => {
    const a1 = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'A', path: 'a.md' });
    const a2 = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'B', path: 'b.md' });
    assert.notEqual(a1.id, a2.id);
  });

  it('returns frozen objects', () => {
    const a = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'T', path: 'p.md' });
    assert.ok(Object.isFrozen(a));
  });

  it('accepts optional status', () => {
    const a = createArtifact({
      departmentId: 'pm',
      type: 'tickets',
      title: 'チケット',
      path: 'pm/tickets/t.md',
      status: 'completed',
    });
    assert.equal(a.status, 'completed');
  });

  it('throws on missing required fields', () => {
    assert.throws(() => createArtifact({}), /departmentId/i);
    assert.throws(() => createArtifact({ departmentId: 'ceo' }), /type/i);
    assert.throws(() => createArtifact({ departmentId: 'ceo', type: 't' }), /title/i);
    assert.throws(
      () => createArtifact({ departmentId: 'ceo', type: 't', title: 'T' }),
      /path/i,
    );
  });

  it('throws on non-object input', () => {
    assert.throws(() => createArtifact(null));
    assert.throws(() => createArtifact('string'));
  });
});

// ============================================================
// Phase 2: Artifact validation
// ============================================================

describe('validateArtifact', () => {
  const { createArtifact, validateArtifact } = require(libPath);

  const reg = makeRegistry();

  it('validates artifact against registry — department exists and produces the type', () => {
    const a = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'T', path: 'p.md' });
    const result = validateArtifact(a, reg);
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
  });

  it('fails if department does not exist', () => {
    const a = createArtifact({ departmentId: 'nonexistent', type: 'x', title: 'T', path: 'p.md' });
    const result = validateArtifact(a, reg);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('nonexistent')));
  });

  it('fails if department does not produce the output type', () => {
    const a = createArtifact({ departmentId: 'ceo', type: 'invoices', title: 'T', path: 'p.md' });
    const result = validateArtifact(a, reg);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('invoices')));
  });

  it('returns frozen result', () => {
    const a = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'T', path: 'p.md' });
    const result = validateArtifact(a, reg);
    assert.ok(Object.isFrozen(result));
    assert.ok(Object.isFrozen(result.errors));
  });
});

// ============================================================
// Phase 3: Downstream discovery
// ============================================================

describe('findDownstream', () => {
  const { findDownstream } = require(libPath);

  const reg = makeRegistry();

  it('finds departments that depend on a given department', () => {
    // ceo depends on secretary, so secretary→downstream includes ceo
    const result = findDownstream(reg, 'secretary');
    const ids = result.map((d) => d.id);
    assert.ok(ids.includes('ceo'));
    assert.ok(ids.includes('research'));
    assert.ok(ids.includes('finance'));
  });

  it('returns empty array if no one depends on the department', () => {
    // sales has no downstream (no one lists sales as a dependency)
    const result = findDownstream(reg, 'sales');
    assert.deepEqual(result, []);
  });

  it('returns empty for unknown department', () => {
    assert.deepEqual(findDownstream(reg, 'nonexistent'), []);
  });

  it('returns frozen array', () => {
    const result = findDownstream(reg, 'ceo');
    assert.ok(Object.isFrozen(result));
  });
});

// ============================================================
// Phase 4: Propagation plan
// ============================================================

describe('buildPropagationPlan', () => {
  const { createArtifact, buildPropagationPlan } = require(libPath);

  const reg = makeRegistry();

  it('builds a plan with source and recipients', () => {
    const a = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'T', path: 'p.md' });
    const plan = buildPropagationPlan(a, reg);

    assert.equal(plan.source.id, 'ceo');
    assert.ok(Array.isArray(plan.recipients));
    // pm and engineering depend on ceo
    const ids = plan.recipients.map((r) => r.id);
    assert.ok(ids.includes('pm'));
    assert.ok(ids.includes('engineering'));
    assert.equal(plan.artifact.id, a.id);
  });

  it('returns empty recipients when no downstream exists', () => {
    const a = createArtifact({ departmentId: 'sales', type: 'clients', title: 'T', path: 'p.md' });
    const plan = buildPropagationPlan(a, reg);
    assert.deepEqual(plan.recipients, []);
  });

  it('returns null source for unknown department', () => {
    const a = createArtifact({ departmentId: 'ghost', type: 'x', title: 'T', path: 'p.md' });
    const plan = buildPropagationPlan(a, reg);
    assert.equal(plan.source, null);
    assert.deepEqual(plan.recipients, []);
  });

  it('returns frozen plan', () => {
    const a = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'T', path: 'p.md' });
    const plan = buildPropagationPlan(a, reg);
    assert.ok(Object.isFrozen(plan));
    assert.ok(Object.isFrozen(plan.recipients));
  });
});

// ============================================================
// Phase 5: Manifest (artifact log)
// ============================================================

describe('createManifest / addToManifest', () => {
  const { createArtifact, createManifest, addToManifest } = require(libPath);

  it('creates an empty manifest', () => {
    const m = createManifest();
    assert.deepEqual(m.artifacts, []);
    assert.ok(Object.isFrozen(m));
  });

  it('adds artifacts immutably', () => {
    const m1 = createManifest();
    const a = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'T', path: 'p.md' });
    const m2 = addToManifest(m1, a);

    assert.equal(m1.artifacts.length, 0); // original unchanged
    assert.equal(m2.artifacts.length, 1);
    assert.equal(m2.artifacts[0].id, a.id);
    assert.ok(Object.isFrozen(m2));
  });

  it('preserves existing artifacts when adding', () => {
    const a1 = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'A', path: 'a.md' });
    const a2 = createArtifact({ departmentId: 'pm', type: 'tickets', title: 'B', path: 'b.md' });
    const m = addToManifest(addToManifest(createManifest(), a1), a2);
    assert.equal(m.artifacts.length, 2);
  });
});

describe('getArtifactsByDepartment', () => {
  const { createArtifact, createManifest, addToManifest, getArtifactsByDepartment } = require(libPath);

  it('filters artifacts by department ID', () => {
    const a1 = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'A', path: 'a.md' });
    const a2 = createArtifact({ departmentId: 'pm', type: 'tickets', title: 'B', path: 'b.md' });
    const a3 = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'C', path: 'c.md' });
    const m = addToManifest(addToManifest(addToManifest(createManifest(), a1), a2), a3);

    const result = getArtifactsByDepartment(m, 'ceo');
    assert.equal(result.length, 2);
    assert.ok(result.every((a) => a.departmentId === 'ceo'));
  });

  it('returns empty for unknown department', () => {
    assert.deepEqual(getArtifactsByDepartment(createManifest(), 'ghost'), []);
  });

  it('returns frozen array', () => {
    assert.ok(Object.isFrozen(getArtifactsByDepartment(createManifest(), 'x')));
  });
});

describe('getArtifactsByType', () => {
  const { createArtifact, createManifest, addToManifest, getArtifactsByType } = require(libPath);

  it('filters artifacts by type', () => {
    const a1 = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'A', path: 'a.md' });
    const a2 = createArtifact({ departmentId: 'pm', type: 'tickets', title: 'B', path: 'b.md' });
    const m = addToManifest(addToManifest(createManifest(), a1), a2);

    const result = getArtifactsByType(m, 'decisions');
    assert.equal(result.length, 1);
    assert.equal(result[0].departmentId, 'ceo');
  });

  it('returns frozen array', () => {
    assert.ok(Object.isFrozen(getArtifactsByType(createManifest(), 'x')));
  });
});

// ============================================================
// Phase 6: Manifest persistence (file I/O)
// ============================================================

describe('saveManifest / loadManifest', () => {
  const { createArtifact, createManifest, addToManifest, saveManifest, loadManifest } = require(libPath);

  let tmpFile;

  before(() => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'artifact-'));
    tmpFile = path.join(tmpDir, 'manifest.json');
  });

  it('round-trips a manifest through save and load', () => {
    const a = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'T', path: 'p.md' });
    const m = addToManifest(createManifest(), a);

    saveManifest(tmpFile, m);
    const loaded = loadManifest(tmpFile);

    assert.equal(loaded.artifacts.length, 1);
    assert.equal(loaded.artifacts[0].id, a.id);
    assert.equal(loaded.artifacts[0].departmentId, 'ceo');
    assert.ok(Object.isFrozen(loaded));
  });

  it('returns empty manifest for non-existent file', () => {
    const loaded = loadManifest('/nonexistent/manifest.json');
    assert.deepEqual(loaded.artifacts, []);
  });
});

// ============================================================
// Phase 7: updateArtifactStatus
// ============================================================

describe('updateArtifactStatus', () => {
  const { createArtifact, updateArtifactStatus } = require(libPath);

  it('returns a new artifact with updated status', () => {
    const a = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'T', path: 'p.md' });
    const updated = updateArtifactStatus(a, 'delivered');

    assert.equal(updated.status, 'delivered');
    assert.equal(updated.id, a.id); // same ID
    assert.equal(a.status, 'created'); // original unchanged
  });

  it('returns frozen object', () => {
    const a = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'T', path: 'p.md' });
    assert.ok(Object.isFrozen(updateArtifactStatus(a, 'delivered')));
  });

  it('throws on invalid status', () => {
    const a = createArtifact({ departmentId: 'ceo', type: 'decisions', title: 'T', path: 'p.md' });
    assert.throws(() => updateArtifactStatus(a, ''), /status/i);
    assert.throws(() => updateArtifactStatus(a, null), /status/i);
  });
});
