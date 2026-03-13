import { describe, it, expect } from 'vitest';
import { sanitizeExternalUrl } from '../url';

describe('sanitizeExternalUrl', () => {
  describe('valid URLs', () => {
    it('allows http URLs', () => {
      expect(sanitizeExternalUrl('http://example.com')).toBe('http://example.com');
    });

    it('allows https URLs', () => {
      expect(sanitizeExternalUrl('https://example.com')).toBe('https://example.com');
    });

    it('allows URLs with paths and query params', () => {
      const url = 'https://example.com/path?key=value&foo=bar';
      expect(sanitizeExternalUrl(url)).toBe(url);
    });

    it('allows URLs with fragments', () => {
      const url = 'https://example.com/page#section';
      expect(sanitizeExternalUrl(url)).toBe(url);
    });

    it('is case-insensitive for scheme', () => {
      expect(sanitizeExternalUrl('HTTPS://example.com')).toBe('HTTPS://example.com');
      expect(sanitizeExternalUrl('Http://example.com')).toBe('Http://example.com');
    });
  });

  describe('dangerous URLs', () => {
    it('blocks javascript: protocol', () => {
      expect(sanitizeExternalUrl('javascript:alert(1)')).toBeNull();
    });

    it('blocks data: protocol', () => {
      expect(sanitizeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    });

    it('blocks vbscript: protocol', () => {
      expect(sanitizeExternalUrl('vbscript:MsgBox("XSS")')).toBeNull();
    });

    it('blocks ftp: protocol', () => {
      expect(sanitizeExternalUrl('ftp://files.example.com')).toBeNull();
    });

    it('blocks relative URLs', () => {
      expect(sanitizeExternalUrl('/path/to/page')).toBeNull();
    });

    it('blocks protocol-relative URLs', () => {
      expect(sanitizeExternalUrl('//example.com')).toBeNull();
    });
  });

  describe('empty/null inputs', () => {
    it('returns null for null', () => {
      expect(sanitizeExternalUrl(null)).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(sanitizeExternalUrl(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(sanitizeExternalUrl('')).toBeNull();
    });
  });
});
