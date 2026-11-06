export type { Locale, Messages } from './messages';
export { getMessages } from './messages';

export const text = (locale: 'zh' | 'en', zh: string, en: string): string =>
  locale === 'en' ? en : zh;
