'use strict';

const fs = require('fs');
const crypto = require('crypto');
const { getDepartment } = require('./department-registry');

// ============================================================
// Constants
// ============================================================

const REQUIRED_FIELDS = Object.freeze(['departmentId', 'type', 'title', 'path']);

const VALID_STATUSES = new Set(['created', 'in-progress', 'completed', 'delivered', 'rejected']);

// ============================================================
// Artifact creation
// ============================================================

/**
 * Create an immutable artifact descriptor.
 */
function createArtifact(opts) {
  if (!opts || typeof opts !== 'object') {
    throw new TypeError('createArtifact requires an object');
  }

  for (const field of REQUIRED_FIELDS) {
    if (!opts[field] || typeof opts[field] !== 'string') {
      throw new Error(`Missing required field: "${field}"`);
    }
  }

  return Object.freeze({
    id: crypto.randomUUID(),
    departmentId: opts.departmentId,
    type: opts.type,
    title: opts.title,
    path: opts.path,
    status: opts.status || 'created',
    createdAt: new Date().toISOString(),
  });
}

/**
 * Return a new artifact with an updated status (immutable).
 */
function updateArtifactStatus(artifact, newStatus) {
  if (!newStatus || typeof newStatus !== 'string') {
    throw new Error('Invalid status: must be a non-empty string');
  }
  return Object.freeze({ ...artifact, status: newStatus });
}

// ============================================================
// Validation
// ============================================================

/**
 * Validate an artifact against a department registry.
 * Checks that the department exists and declares the output type.
 */
function validateArtifact(artifact, registry) {
  const errors = [];

  const dept = getDepartment(registry, artifact.departmentId);
  if (!dept) {
    errors.push(`Department "${artifact.departmentId}" does not exist in registry`);
  } else if (!dept.outputs.includes(artifact.type)) {
    errors.push(
      `Department "${artifact.departmentId}" does not produce output type "${artifact.type}" (declared outputs: ${dept.outputs.join(', ')})`,
    );
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

// ============================================================
// Downstream discovery
// ============================================================

/**
 * Find departments that list the given departmentId in their dependencies.
 * These are the "downstream" consumers of artifacts from that department.
 */
function findDownstream(registry, departmentId) {
  const result = [];
  for (const dept of registry.values()) {
    if (dept.dependencies.includes(departmentId)) {
      result.push(dept);
    }
  }
  return Object.freeze(result);
}

// ============================================================
// Propagation plan
// ============================================================

/**
 * Build a propagation plan: which departments should receive this artifact.
 */
function buildPropagationPlan(artifact, registry) {
  const source = getDepartment(registry, artifact.departmentId);
  const recipients = source ? findDownstream(registry, artifact.departmentId) : [];

  return Object.freeze({
    source: source || null,
    recipients: Object.isFrozen(recipients) ? recipients : Object.freeze(recipients),
    artifact,
  });
}

// ============================================================
// Manifest (artifact log)
// ============================================================

/**
 * Create an empty manifest.
 */
function createManifest() {
  return Object.freeze({ artifacts: Object.freeze([]) });
}

/**
 * Add an artifact to a manifest immutably.
 */
function addToManifest(manifest, artifact) {
  return Object.freeze({
    artifacts: Object.freeze([...manifest.artifacts, artifact]),
  });
}

/**
 * Filter manifest artifacts by department ID.
 */
function getArtifactsByDepartment(manifest, departmentId) {
  return Object.freeze(manifest.artifacts.filter((a) => a.departmentId === departmentId));
}

/**
 * Filter manifest artifacts by type.
 */
function getArtifactsByType(manifest, type) {
  return Object.freeze(manifest.artifacts.filter((a) => a.type === type));
}

// ============================================================
// Manifest persistence
// ============================================================

/**
 * Save a manifest to a JSON file.
 */
function saveManifest(filePath, manifest) {
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), 'utf8');
}

/**
 * Load a manifest from a JSON file. Returns empty manifest if file doesn't exist.
 */
function loadManifest(filePath) {
  if (!fs.existsSync(filePath)) {
    return createManifest();
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return Object.freeze({
    artifacts: Object.freeze((raw.artifacts || []).map((a) => Object.freeze(a))),
  });
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  createArtifact,
  updateArtifactStatus,
  validateArtifact,
  findDownstream,
  buildPropagationPlan,
  createManifest,
  addToManifest,
  getArtifactsByDepartment,
  getArtifactsByType,
  saveManifest,
  loadManifest,
};
