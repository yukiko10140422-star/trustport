export type ThemeValue = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'company-chat-theme';
const VALID_VALUES = new Set<ThemeValue>(['system', 'light', 'dark']);

export const THEME_OPTIONS: Array<{ value: ThemeValue; label: string }> = [
  { value: 'system', label: 'システム' },
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
];

export function getTheme(): ThemeValue {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_VALUES.has(stored as ThemeValue)) {
      return stored as ThemeValue;
    }
  } catch {
    // SSRやlocalStorage未対応環境
  }
  return 'system';
}

export function setTheme(value: ThemeValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }

  if (value === 'system') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = value;
  }
}
