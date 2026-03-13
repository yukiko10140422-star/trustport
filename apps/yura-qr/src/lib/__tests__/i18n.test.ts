import { describe, it, expect } from 'vitest';
import { localized, localizedWithFallback } from '../i18n';
import type { Locale } from '../i18n';

describe('localized', () => {
  it('returns Japanese value for ja locale', () => {
    expect(localized('ja', '日本語', 'English')).toBe('日本語');
  });

  it('returns English value for en locale', () => {
    expect(localized('en', '日本語', 'English')).toBe('English');
  });

  it('works with non-string types', () => {
    expect(localized('ja', 100, 200)).toBe(100);
    expect(localized('en', 100, 200)).toBe(200);
  });

  it('works with null values', () => {
    expect(localized('ja', null, 'English')).toBeNull();
    expect(localized('en', '日本語', null)).toBeNull();
  });

  it('works with object values', () => {
    const ja = { key: 'ja' };
    const en = { key: 'en' };
    expect(localized('ja', ja, en)).toBe(ja);
    expect(localized('en', ja, en)).toBe(en);
  });

  it('defaults to ja for unknown locale cast as Locale', () => {
    // Any non-'en' value should fallback to ja
    expect(localized('ja' as Locale, 'A', 'B')).toBe('A');
  });
});

describe('localizedWithFallback', () => {
  it('returns ja value for ja locale', () => {
    expect(localizedWithFallback('ja', '日本語', 'English')).toBe('日本語');
  });

  it('returns en value for en locale when en is present', () => {
    expect(localizedWithFallback('en', '日本語', 'English')).toBe('English');
  });

  it('falls back to ja when en is null', () => {
    expect(localizedWithFallback('en', '日本語', null)).toBe('日本語');
  });

  it('falls back to ja when en is undefined', () => {
    expect(localizedWithFallback('en', '日本語', undefined)).toBe('日本語');
  });

  it('returns empty string en value without fallback', () => {
    // Empty string is truthy for ?? (not nullish), so it should return ''
    expect(localizedWithFallback('en', '日本語', '')).toBe('');
  });

  it('always returns ja for ja locale regardless of en value', () => {
    expect(localizedWithFallback('ja', '日本語', null)).toBe('日本語');
    expect(localizedWithFallback('ja', '日本語', undefined)).toBe('日本語');
    expect(localizedWithFallback('ja', '日本語', 'English')).toBe('日本語');
  });
});
