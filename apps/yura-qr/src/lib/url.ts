/**
 * Sanitize an external URL to prevent javascript: and data: XSS attacks.
 * Only allows http:// and https:// schemes.
 * Returns null if the URL is invalid or uses a dangerous scheme.
 */
export function sanitizeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : null;
}
