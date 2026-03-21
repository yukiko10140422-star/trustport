'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const libPath = path.join(__dirname, '..', 'lib', 'pipeline.js');

// ============================================================
// Phase 1: Pipeline definition
// ============================================================

describe('createStep', () => {
  const { createStep } = require(libPath);

  it('creates a step with required fields', () => {
    const step = createStep({
      id: 'research-market',
      departmentId: 'research',
      action: '市場調査を実施',
    });

    assert.equal(step.id, 'research-market');
    assert.equal(step.departmentId, 'research');
    assert.equal(step.action, '市場調査を実施');
    assert.deepEqual(step.dependsOn, []);
    assert.equal(step.status, 'pending');
  });

  it('accepts dependsOn array', () => {
    const step = createStep({
      id: 'plan',
      departmentId: 'pm',
      action: '計画策定',
      dependsOn: ['research-market'],
    });
    assert.deepEqual(step.dependsOn, ['research-market']);
  });

  it('returns frozen object', () => {
    const step = createStep({ id: 's', departmentId: 'd', action: 'a' });
    assert.ok(Object.isFrozen(step));
    assert.ok(Object.isFrozen(step.dependsOn));
  });

  it('throws on missing fields', () => {
    assert.throws(() => createStep({}), /id/i);
    assert.throws(() => createStep({ id: 'x' }), /departmentId/i);
    assert.throws(() => createStep({ id: 'x', departmentId: 'd' }), /action/i);
  });
});

describe('createPipeline', () => {
  const { createStep, createPipeline } = require(libPath);

  it('creates a pipeline with steps', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'research', action: '調査' }),
      createStep({ id: 'b', departmentId: 'pm', action: '計画', dependsOn: ['a'] }),
    ];
    const p = createPipeline({ name: 'テスト', steps });

    assert.equal(p.name, 'テスト');
    assert.equal(p.steps.length, 2);
    assert.equal(p.status, 'pending');
    assert.ok(typeof p.id === 'string');
  });

  it('returns frozen object', () => {
    const p = createPipeline({
      name: 'T',
      steps: [createStep({ id: 'a', departmentId: 'd', action: 'a' })],
    });
    assert.ok(Object.isFrozen(p));
    assert.ok(Object.isFrozen(p.steps));
  });

  it('throws on empty steps', () => {
    assert.throws(() => createPipeline({ name: 'T', steps: [] }), /steps/i);
  });

  it('throws on duplicate step IDs', () => {
    const steps = [
      createStep({ id: 'dup', departmentId: 'd', action: 'a' }),
      createStep({ id: 'dup', departmentId: 'd', action: 'b' }),
    ];
    assert.throws(() => createPipeline({ name: 'T', steps }), /duplicate/i);
  });
});

// ============================================================
// Phase 2: DAG validation
// ============================================================

describe('validateDAG', () => {
  const { createStep, createPipeline, validateDAG } = require(libPath);

  it('validates a valid DAG', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a' }),
      createStep({ id: 'b', departmentId: 'd', action: 'b', dependsOn: ['a'] }),
      createStep({ id: 'c', departmentId: 'd', action: 'c', dependsOn: ['a'] }),
      createStep({ id: 'd', departmentId: 'd', action: 'd', dependsOn: ['b', 'c'] }),
    ];
    const p = createPipeline({ name: 'DAG', steps });
    const result = validateDAG(p);
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
  });

  it('detects missing dependency references', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a', dependsOn: ['ghost'] }),
    ];
    const p = createPipeline({ name: 'T', steps });
    const result = validateDAG(p);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('ghost')));
  });

  it('detects self-dependency', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a', dependsOn: ['a'] }),
    ];
    const p = createPipeline({ name: 'T', steps });
    const result = validateDAG(p);
    assert.equal(result.valid, false);
  });

  it('detects circular dependencies', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a', dependsOn: ['b'] }),
      createStep({ id: 'b', departmentId: 'd', action: 'b', dependsOn: ['a'] }),
    ];
    const p = createPipeline({ name: 'T', steps });
    const result = validateDAG(p);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => /cycle|circular/i.test(e)));
  });

  it('detects longer cycles', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a', dependsOn: ['c'] }),
      createStep({ id: 'b', departmentId: 'd', action: 'b', dependsOn: ['a'] }),
      createStep({ id: 'c', departmentId: 'd', action: 'c', dependsOn: ['b'] }),
    ];
    const p = createPipeline({ name: 'T', steps });
    const result = validateDAG(p);
    assert.equal(result.valid, false);
  });

  it('returns frozen result', () => {
    const steps = [createStep({ id: 'a', departmentId: 'd', action: 'a' })];
    const p = createPipeline({ name: 'T', steps });
    const result = validateDAG(p);
    assert.ok(Object.isFrozen(result));
  });
});

// ============================================================
// Phase 3: Topological sort
// ============================================================

describe('topologicalSort', () => {
  const { createStep, createPipeline, topologicalSort } = require(libPath);

  it('returns steps in valid execution order', () => {
    const steps = [
      createStep({ id: 'c', departmentId: 'd', action: 'c', dependsOn: ['a', 'b'] }),
      createStep({ id: 'a', departmentId: 'd', action: 'a' }),
      createStep({ id: 'b', departmentId: 'd', action: 'b', dependsOn: ['a'] }),
    ];
    const p = createPipeline({ name: 'T', steps });
    const sorted = topologicalSort(p);
    const ids = sorted.map((s) => s.id);

    // a must come before b and c; b must come before c
    assert.ok(ids.indexOf('a') < ids.indexOf('b'));
    assert.ok(ids.indexOf('a') < ids.indexOf('c'));
    assert.ok(ids.indexOf('b') < ids.indexOf('c'));
  });

  it('returns frozen array', () => {
    const steps = [createStep({ id: 'a', departmentId: 'd', action: 'a' })];
    const p = createPipeline({ name: 'T', steps });
    assert.ok(Object.isFrozen(topologicalSort(p)));
  });

  it('throws on cycle', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a', dependsOn: ['b'] }),
      createStep({ id: 'b', departmentId: 'd', action: 'b', dependsOn: ['a'] }),
    ];
    const p = createPipeline({ name: 'T', steps });
    assert.throws(() => topologicalSort(p), /circular/i);
  });
});

// ============================================================
// Phase 4: Parallel groups
// ============================================================

describe('getParallelGroups', () => {
  const { createStep, createPipeline, getParallelGroups } = require(libPath);

  it('groups steps that can run in parallel', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a' }),
      createStep({ id: 'b', departmentId: 'd', action: 'b' }),
      createStep({ id: 'c', departmentId: 'd', action: 'c', dependsOn: ['a', 'b'] }),
      createStep({ id: 'd', departmentId: 'd', action: 'd', dependsOn: ['c'] }),
    ];
    const p = createPipeline({ name: 'T', steps });
    const groups = getParallelGroups(p);

    // Group 0: a, b (no deps)
    // Group 1: c (depends on a, b)
    // Group 2: d (depends on c)
    assert.equal(groups.length, 3);
    const g0ids = groups[0].map((s) => s.id).sort();
    assert.deepEqual(g0ids, ['a', 'b']);
    assert.deepEqual(groups[1].map((s) => s.id), ['c']);
    assert.deepEqual(groups[2].map((s) => s.id), ['d']);
  });

  it('handles single step', () => {
    const steps = [createStep({ id: 'a', departmentId: 'd', action: 'a' })];
    const p = createPipeline({ name: 'T', steps });
    const groups = getParallelGroups(p);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].length, 1);
  });

  it('returns frozen structure', () => {
    const steps = [createStep({ id: 'a', departmentId: 'd', action: 'a' })];
    const p = createPipeline({ name: 'T', steps });
    const groups = getParallelGroups(p);
    assert.ok(Object.isFrozen(groups));
    assert.ok(Object.isFrozen(groups[0]));
  });
});

// ============================================================
// Phase 5: Execution state management
// ============================================================

describe('createExecution', () => {
  const { createStep, createPipeline, createExecution } = require(libPath);

  it('creates execution state from a pipeline', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a' }),
      createStep({ id: 'b', departmentId: 'd', action: 'b', dependsOn: ['a'] }),
    ];
    const p = createPipeline({ name: 'T', steps });
    const exec = createExecution(p);

    assert.equal(exec.pipelineId, p.id);
    assert.equal(exec.status, 'pending');
    assert.equal(Object.keys(exec.stepStates).length, 2);
    assert.equal(exec.stepStates['a'], 'pending');
    assert.equal(exec.stepStates['b'], 'pending');
    assert.ok(Object.isFrozen(exec));
  });
});

describe('advanceStep', () => {
  const { createStep, createPipeline, createExecution, advanceStep } = require(libPath);

  const steps = [
    createStep({ id: 'a', departmentId: 'd', action: 'a' }),
    createStep({ id: 'b', departmentId: 'd', action: 'b', dependsOn: ['a'] }),
  ];
  const p = createPipeline({ name: 'T', steps });

  it('transitions a step to a new status', () => {
    const exec = createExecution(p);
    const next = advanceStep(exec, 'a', 'running');
    assert.equal(next.stepStates['a'], 'running');
    assert.equal(next.stepStates['b'], 'pending'); // unchanged
    assert.equal(exec.stepStates['a'], 'pending'); // original immutable
  });

  it('returns frozen state', () => {
    const exec = createExecution(p);
    assert.ok(Object.isFrozen(advanceStep(exec, 'a', 'running')));
  });

  it('throws for unknown step', () => {
    const exec = createExecution(p);
    assert.throws(() => advanceStep(exec, 'ghost', 'running'), /step/i);
  });
});

describe('getReadySteps', () => {
  const { createStep, createPipeline, createExecution, advanceStep, getReadySteps } = require(libPath);

  it('returns steps whose dependencies are all completed', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a' }),
      createStep({ id: 'b', departmentId: 'd', action: 'b' }),
      createStep({ id: 'c', departmentId: 'd', action: 'c', dependsOn: ['a', 'b'] }),
    ];
    const p = createPipeline({ name: 'T', steps });

    // Initially, a and b are ready (no deps)
    let exec = createExecution(p);
    let ready = getReadySteps(p, exec);
    assert.deepEqual(ready.map((s) => s.id).sort(), ['a', 'b']);

    // Complete a — c is still not ready (b pending)
    exec = advanceStep(exec, 'a', 'completed');
    ready = getReadySteps(p, exec);
    assert.deepEqual(ready.map((s) => s.id), ['b']);

    // Complete b — now c is ready
    exec = advanceStep(exec, 'b', 'completed');
    ready = getReadySteps(p, exec);
    assert.deepEqual(ready.map((s) => s.id), ['c']);
  });

  it('excludes already running or completed steps', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a' }),
      createStep({ id: 'b', departmentId: 'd', action: 'b' }),
    ];
    const p = createPipeline({ name: 'T', steps });
    let exec = createExecution(p);
    exec = advanceStep(exec, 'a', 'running');

    const ready = getReadySteps(p, exec);
    assert.deepEqual(ready.map((s) => s.id), ['b']);
  });

  it('returns frozen array', () => {
    const steps = [createStep({ id: 'a', departmentId: 'd', action: 'a' })];
    const p = createPipeline({ name: 'T', steps });
    const exec = createExecution(p);
    assert.ok(Object.isFrozen(getReadySteps(p, exec)));
  });
});

describe('isCompleted', () => {
  const { createStep, createPipeline, createExecution, advanceStep, isCompleted } = require(libPath);

  it('returns false when steps are pending', () => {
    const steps = [createStep({ id: 'a', departmentId: 'd', action: 'a' })];
    const p = createPipeline({ name: 'T', steps });
    assert.equal(isCompleted(createExecution(p)), false);
  });

  it('returns true when all steps are completed', () => {
    const steps = [
      createStep({ id: 'a', departmentId: 'd', action: 'a' }),
      createStep({ id: 'b', departmentId: 'd', action: 'b' }),
    ];
    const p = createPipeline({ name: 'T', steps });
    let exec = createExecution(p);
    exec = advanceStep(exec, 'a', 'completed');
    exec = advanceStep(exec, 'b', 'completed');
    assert.equal(isCompleted(exec), true);
  });

  it('returns false when some steps are running', () => {
    const steps = [createStep({ id: 'a', departmentId: 'd', action: 'a' })];
    const p = createPipeline({ name: 'T', steps });
    const exec = advanceStep(createExecution(p), 'a', 'running');
    assert.equal(isCompleted(exec), false);
  });
});
