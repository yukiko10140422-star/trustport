import { describe, it, expect } from 'vitest';

// These functions are defined inside ImmersiveOpening.tsx and not exported.
// We re-implement them here for testing, matching the exact source logic.
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url) || /^[a-zA-Z0-9_-]{11}$/.test(url);
}

function extractYouTubeId(url: string): string {
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const match = url.match(YOUTUBE_REGEX);
  return match?.[1] ?? '';
}

function useDaysSincePure(dateStr: string): number {
  const disaster = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - disaster.getTime()) / (1000 * 60 * 60 * 24));
}

describe('isYouTubeUrl', () => {
  it('recognizes standard youtube.com watch URL', () => {
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
  });

  it('recognizes youtube.com embed URL', () => {
    expect(isYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
  });

  it('recognizes youtu.be short URL', () => {
    expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
  });

  it('recognizes bare 11-char video ID', () => {
    expect(isYouTubeUrl('dQw4w9WgXcQ')).toBe(true);
  });

  it('rejects non-YouTube URLs', () => {
    expect(isYouTubeUrl('https://vimeo.com/123456')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isYouTubeUrl('')).toBe(false);
  });

  it('rejects strings shorter than 11 chars', () => {
    expect(isYouTubeUrl('abc')).toBe(false);
  });

  it('rejects strings longer than 11 chars that are not URLs', () => {
    expect(isYouTubeUrl('abcdefghijklm')).toBe(false);
  });

  it('handles URL with additional query params', () => {
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42')).toBe(true);
  });

  it('recognizes IDs with hyphens and underscores', () => {
    // Must be exactly 11 chars: a-b_cDe_f1X
    expect(isYouTubeUrl('a-b_cDe_f1X')).toBe(true);
  });
});

describe('extractYouTubeId', () => {
  it('extracts ID from standard watch URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from embed URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from youtu.be URL', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns bare ID as-is', () => {
    expect(extractYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns empty string for non-YouTube URL', () => {
    expect(extractYouTubeId('https://vimeo.com/123456')).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(extractYouTubeId('')).toBe('');
  });
});

describe('useDaysSince (pure logic)', () => {
  it('returns 0 for today', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(useDaysSincePure(today)).toBe(0);
  });

  it('returns positive number for past date', () => {
    const pastDate = '2020-01-01';
    const result = useDaysSincePure(pastDate);
    expect(result).toBeGreaterThan(0);
  });

  it('returns negative number for future date', () => {
    const futureDate = '2099-12-31';
    const result = useDaysSincePure(futureDate);
    expect(result).toBeLessThan(0);
  });

  it('calculates roughly correct days for known date', () => {
    // 2011-03-11 is the Tohoku earthquake
    const result = useDaysSincePure('2011-03-11');
    // Should be more than 5000 days since 2011
    expect(result).toBeGreaterThan(5000);
  });
});
