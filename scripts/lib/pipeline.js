'use strict';

const crypto = require('crypto');

// ============================================================
// Step creation
// ============================================================

/**
 * Create an immutable pipeline step.
 */
function createStep(opts) {
  if (!opts || typeof opts !== 'object') {
    throw new TypeError('createStep requires an object');
  }
  if (!opts.id || typeof opts.id !== 'string') {
    throw new Error('Missing required field: "id"');
  }
  if (!opts.departmentId || typeof opts.departmentId !== 'string') {
    throw new Error('Missing required field: "departmentId"');
  }
  if (!opts.action || typeof opts.action !== 'string') {
    throw new Error('Missing required field: "action"');
  }

  return Object.freeze({
    id: opts.id,
    departmentId: opts.departmentId,
    action: opts.action,
    dependsOn: Object.freeze(opts.dependsOn || []),
    status: opts.status || 'pending',
  });
}

// ============================================================
// Pipeline creation
// ============================================================

/**
 * Create an immutable pipeline from a set of steps.
 */
function createPipeline(opts) {
  if (!opts || typeof opts !== 'object') {
    throw new TypeError('createPipeline requires an object');
  }
  if (!Array.isArray(opts.steps) || opts.steps.length === 0) {
    throw new Error('Pipeline must have at least one steps entry');
  }

  const ids = new Set();
  for (const step of opts.steps) {
    if (ids.has(step.id)) {
      throw new Error(`Duplicate step ID: "${step.id}"`);
    }
    ids.add(step.id);
  }

  return Object.freeze({
    id: crypto.randomUUID(),
    name: opts.name || '',
    steps: Object.freeze([...opts.steps]),
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
}

// ============================================================
// DAG validation
// ============================================================

/**
 * Validate the pipeline's dependency graph is a valid DAG.
 */
function validateDAG(pipeline) {
  const errors = [];
  const stepIds = new Set(pipeline.steps.map((s) => s.id));

  // Check for missing references and self-dependencies
  for (const step of pipeline.steps) {
    for (const dep of step.dependsOn) {
      if (dep === step.id) {
        errors.push(`Step "${step.id}" depends on itself`);
      } else if (!stepIds.has(dep)) {
        errors.push(`Step "${step.id}" depends on "${dep}" which does not exist`);
      }
    }
  }

  // Check for cycles using DFS
  if (errors.length === 0) {
    const adj = new Map();
    for (const step of pipeline.steps) {
      adj.set(step.id, step.dependsOn);
    }

    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Map();
    for (const id of stepIds) color.set(id, WHITE);

    let hasCycle = false;

    function dfs(node) {
      color.set(node, GRAY);
      for (const dep of adj.get(node) || []) {
        if (color.get(dep) === GRAY) {
          hasCycle = true;
          return;
        }
        if (color.get(dep) === WHITE) {
          dfs(dep);
          if (hasCycle) return;
        }
      }
      color.set(node, BLACK);
    }

    for (const id of stepIds) {
      if (color.get(id) === WHITE) {
        dfs(id);
        if (hasCycle) break;
      }
    }

    if (hasCycle) {
      errors.push('Circular dependency detected in pipeline');
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

// ============================================================
// Topological sort (Kahn's algorithm)
// ============================================================

/**
 * Return steps in valid execution order.
 * Throws if the graph contains a cycle.
 */
function topologicalSort(pipeline) {
  const stepMap = new Map();
  for (const step of pipeline.steps) {
    stepMap.set(step.id, step);
  }

  // Build in-degree map and adjacency list (dependsOn → outgoing edges for Kahn)
  const inDegree = new Map();
  const outEdges = new Map(); // dep → [steps that depend on dep]

  for (const step of pipeline.steps) {
    inDegree.set(step.id, step.dependsOn.length);
    if (!outEdges.has(step.id)) outEdges.set(step.id, []);
    for (const dep of step.dependsOn) {
      if (!outEdges.has(dep)) outEdges.set(dep, []);
      outEdges.get(dep).push(step.id);
    }
  }

  const queue = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted = [];
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(stepMap.get(current));
    for (const neighbor of outEdges.get(current) || []) {
      const newDeg = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== pipeline.steps.length) {
    throw new Error('Circular dependency detected — cannot topologically sort');
  }

  return Object.freeze(sorted);
}

// ============================================================
// Parallel groups
// ============================================================

/**
 * Group steps into layers that can run in parallel.
 * Each group contains steps whose dependencies are all in previous groups.
 */
function getParallelGroups(pipeline) {
  const sorted = topologicalSort(pipeline);

  // Compute the "depth" of each step
  const depth = new Map();
  for (const step of sorted) {
    let maxDepth = -1;
    for (const dep of step.dependsOn) {
      const d = depth.get(dep);
      if (d > maxDepth) maxDepth = d;
    }
    depth.set(step.id, maxDepth + 1);
  }

  // Group by depth
  const groups = [];
  for (const step of sorted) {
    const d = depth.get(step.id);
    if (!groups[d]) groups[d] = [];
    groups[d].push(step);
  }

  return Object.freeze(groups.map((g) => Object.freeze(g)));
}

// ============================================================
// Execution state
// ============================================================

/**
 * Create an immutable execution state from a pipeline.
 */
function createExecution(pipeline) {
  const stepStates = {};
  for (const step of pipeline.steps) {
    stepStates[step.id] = 'pending';
  }
  return Object.freeze({
    pipelineId: pipeline.id,
    status: 'pending',
    stepStates: Object.freeze(stepStates),
    startedAt: new Date().toISOString(),
  });
}

/**
 * Advance a step's status immutably.
 */
function advanceStep(execution, stepId, newStatus) {
  if (!(stepId in execution.stepStates)) {
    throw new Error(`Unknown step: "${stepId}"`);
  }
  return Object.freeze({
    ...execution,
    stepStates: Object.freeze({
      ...execution.stepStates,
      [stepId]: newStatus,
    }),
  });
}

/**
 * Get steps that are ready to run (pending, with all dependencies completed).
 */
function getReadySteps(pipeline, execution) {
  const ready = [];
  for (const step of pipeline.steps) {
    if (execution.stepStates[step.id] !== 'pending') continue;
    const allDepsCompleted = step.dependsOn.every(
      (dep) => execution.stepStates[dep] === 'completed',
    );
    if (allDepsCompleted) {
      ready.push(step);
    }
  }
  return Object.freeze(ready);
}

/**
 * Check if all steps in the execution are completed.
 */
function isCompleted(execution) {
  return Object.values(execution.stepStates).every((s) => s === 'completed');
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  createStep,
  createPipeline,
  validateDAG,
  topologicalSort,
  getParallelGroups,
  createExecution,
  advanceStep,
  getReadySteps,
  isCompleted,
};
