import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('PWA manifest.json', () => {
  const manifestPath = resolve(__dirname, '../../../public/manifest.json');

  it('manifest.jsonが存在する', () => {
    const content = readFileSync(manifestPath, 'utf-8');
    expect(content).toBeTruthy();
  });

  it('必須フィールドが揃っている', () => {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe('/chat');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
  });

  it('アイコンが192と512の2サイズある', () => {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    expect(manifest.icons).toBeDefined();
    expect(Array.isArray(manifest.icons)).toBe(true);

    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('日本語のlangが設定されている', () => {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    expect(manifest.lang).toBe('ja');
  });
});

describe('Service Worker', () => {
  const swPath = resolve(__dirname, '../../../public/sw.js');

  it('sw.jsが存在する', () => {
    const content = readFileSync(swPath, 'utf-8');
    expect(content).toBeTruthy();
  });

  it('CACHE_VERSIONが定義されている', () => {
    const content = readFileSync(swPath, 'utf-8');
    expect(content).toContain('CACHE_VERSION');
  });

  it('offlineフォールバックがある', () => {
    const content = readFileSync(swPath, 'utf-8');
    expect(content).toContain('offline.html');
  });
});

describe('offline.html', () => {
  const offlinePath = resolve(__dirname, '../../../public/offline.html');

  it('offline.htmlが存在する', () => {
    const content = readFileSync(offlinePath, 'utf-8');
    expect(content).toBeTruthy();
  });

  it('日本語のオフラインメッセージが含まれる', () => {
    const content = readFileSync(offlinePath, 'utf-8');
    expect(content).toContain('オフライン');
  });
});
