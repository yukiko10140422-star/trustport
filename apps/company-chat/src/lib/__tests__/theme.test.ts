import { describe, it, expect, beforeEach, vi } from 'vitest';

// localStorageのモック
const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, val: string) => { storage[key] = val; }),
  removeItem: vi.fn((key: string) => { delete storage[key]; }),
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

// document.documentElement.dataset のモック
const mockDataset: Record<string, string> = {};
Object.defineProperty(document.documentElement, 'dataset', {
  value: mockDataset,
  writable: true,
});

describe('theme', () => {
  beforeEach(async () => {
    vi.resetModules();
    Object.keys(storage).forEach(k => delete storage[k]);
    Object.keys(mockDataset).forEach(k => delete mockDataset[k]);
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });

  it('getTheme: デフォルトは "system"', async () => {
    const { getTheme } = await import('../theme');
    expect(getTheme()).toBe('system');
  });

  it('getTheme: localStorageに保存された値を返す', async () => {
    storage['company-chat-theme'] = 'dark';
    const { getTheme } = await import('../theme');
    expect(getTheme()).toBe('dark');
  });

  it('getTheme: 不正な値の場合は "system" を返す', async () => {
    storage['company-chat-theme'] = 'invalid';
    const { getTheme } = await import('../theme');
    expect(getTheme()).toBe('system');
  });

  it('setTheme: localStorageに保存しdata-themeを設定する', async () => {
    const { setTheme } = await import('../theme');
    setTheme('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('company-chat-theme', 'dark');
    expect(mockDataset.theme).toBe('dark');
  });

  it('setTheme: "system"の場合はdata-themeを削除する', async () => {
    mockDataset.theme = 'dark';
    const { setTheme } = await import('../theme');
    setTheme('system');
    expect(mockDataset.theme).toBeUndefined();
  });

  it('THEME_OPTIONS: 3つの選択肢がある', async () => {
    const { THEME_OPTIONS } = await import('../theme');
    expect(THEME_OPTIONS).toHaveLength(3);
    expect(THEME_OPTIONS.map(o => o.value)).toEqual(['system', 'light', 'dark']);
  });
});
