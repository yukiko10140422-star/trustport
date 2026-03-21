import { MODELS, type ModelKey } from './constants';

export function selectModel(userOverride?: string): ModelKey {
  if (userOverride && userOverride in MODELS) return userOverride as ModelKey;
  return 'sonnet';
}
