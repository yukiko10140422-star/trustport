export type Locale = 'ja' | 'en';

/** Pick the correct localized value based on locale */
export function localized<T>(locale: Locale, ja: T, en: T): T {
  return locale === 'en' ? en : ja;
}

/** Pick with fallback: prefer the target locale, fall back to the other */
export function localizedWithFallback(
  locale: Locale,
  ja: string,
  en: string | null | undefined,
): string {
  if (locale === 'en') return en ?? ja;
  return ja;
}
