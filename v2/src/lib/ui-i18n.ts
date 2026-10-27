export type Locale = 'zh' | 'en';
export const text = (locale: Locale, zh: string, en: string): string =>
  locale === 'en' ? en : zh;
