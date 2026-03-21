'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================
// Constants
// ============================================================

const REQUIRED_FIELDS = Object.freeze(['id', 'name', 'person', 'role', 'group', 'dependencies', 'outputs']);

const META_RE = /<!--\s*META\s*\n([\s\S]*?)-->/;

// ============================================================
// META Block Parser
// ============================================================

/**
 * Parse a META block from markdown content.
 * Returns a frozen department metadata object or null.
 */
function parseMeta(content) {
  if (typeof content !== 'string') return null;

  const match = content.match(META_RE);
  if (!match) return null;

  const block = match[1];
  const meta = {};

  for (const line of block.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const rawValue = trimmed.slice(colonIdx + 1).trim();

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      const inner = rawValue.slice(1, -1).trim();
      meta[key] = inner.length === 0
        ? Object.freeze([])
        : Object.freeze(inner.split(',').map((s) => s.trim()));
    } else {
      meta[key] = rawValue;
    }
  }

  // Validate all required fields
  for (const field of REQUIRED_FIELDS) {
    if (meta[field] === undefined || meta[field] === null) return null;
  }

  return Object.freeze({ ...meta });
}

// ============================================================
// Registry
// ============================================================

/**
 * Create a registry (Map) from an array of department metadata objects.
 */
function createRegistry(departments) {
  const reg = new Map();

  for (const dept of departments) {
    if (reg.has(dept.id)) {
      throw new Error(`Duplicate department ID: "${dept.id}"`);
    }
    reg.set(dept.id, Object.isFrozen(dept) ? dept : Object.freeze({ ...dept }));
  }

  return reg;
}

/**
 * Get a department by ID from the registry.
 */
function getDepartment(registry, id) {
  if (typeof id !== 'string') return null;
  return registry.get(id) || null;
}

/**
 * List departments belonging to a given group.
 */
function listByGroup(registry, group) {
  const result = [];
  for (const dept of registry.values()) {
    if (dept.group === group) {
      result.push(dept);
    }
  }
  return Object.freeze(result);
}

/**
 * Find departments that produce a given output type.
 */
function findByOutput(registry, outputType) {
  const result = [];
  for (const dept of registry.values()) {
    if (dept.outputs.includes(outputType)) {
      result.push(dept);
    }
  }
  return Object.freeze(result);
}

/**
 * Validate that all dependencies reference existing departments.
 */
function validateDependencies(registry) {
  const errors = [];
  for (const dept of registry.values()) {
    for (const dep of dept.dependencies) {
      if (!registry.has(dep)) {
        errors.push(`Department "${dept.id}" depends on "${dep}" which does not exist`);
      }
    }
  }
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

/**
 * List all unique group names in the registry.
 */
function listGroups(registry) {
  const groups = new Set();
  for (const dept of registry.values()) {
    groups.add(dept.group);
  }
  return Object.freeze([...groups]);
}

/**
 * List all departments in the registry.
 */
function listAll(registry) {
  return Object.freeze([...registry.values()]);
}

// ============================================================
// File-based loading
// ============================================================

/**
 * Load departments from a directory containing subdirectories with CLAUDE.md files.
 * Each subdirectory is scanned for a CLAUDE.md file with a META block.
 */
function loadDepartmentsFromDir(dirPath) {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`Not a valid directory: "${dirPath}"`);
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const departments = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const claudePath = path.join(dirPath, entry.name, 'CLAUDE.md');
    if (!fs.existsSync(claudePath)) continue;

    const content = fs.readFileSync(claudePath, 'utf8');
    const meta = parseMeta(content);
    if (meta) {
      departments.push(meta);
    }
  }

  return createRegistry(departments);
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  parseMeta,
  createRegistry,
  getDepartment,
  listByGroup,
  findByOutput,
  validateDependencies,
  listGroups,
  listAll,
  loadDepartmentsFromDir,
};
