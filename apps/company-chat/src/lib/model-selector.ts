import type { ModelKey } from './constants';

const SONNET_DEPARTMENTS = new Set(['engineering', 'research', 'legal', 'dx']);
const OPUS_DEPARTMENTS = new Set(['ceo']);

export function selectModel(departmentId: string, userOverride?: ModelKey): ModelKey {
  if (userOverride) return userOverride;
  if (OPUS_DEPARTMENTS.has(departmentId)) return 'sonnet'; // Opus only on manual
  if (SONNET_DEPARTMENTS.has(departmentId)) return 'sonnet';
  return 'haiku';
}
