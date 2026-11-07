import { describe, expect, it } from 'vitest';
import { getMessages, type Locale } from './messages';

describe('getMessages', () => {
  it('returns Chinese messages by default or when zh is requested', () => {
    const defaultMsg = getMessages();
    const zhMsg = getMessages('zh');
    expect(defaultMsg.layout.brandName).toBe('异曲');
    expect(zhMsg.layout.brandName).toBe('异曲');
    expect(defaultMsg).toEqual(zhMsg);
  });

  it('returns English messages when en is requested', () => {
    const enMsg = getMessages('en');
    expect(enMsg.layout.brandName).toBe('Elsewise');
    expect(enMsg.layout.skipLink).toBe('Skip to content');
    expect(enMsg.collection.languagesTitle).toBe('Languages');
  });

  it('has identical keys and structure for both locales', () => {
    const zh = getMessages('zh');
    const en = getMessages('en');

    function checkKeys(
      a: Record<string, unknown>,
      b: Record<string, unknown>,
      prefix = ''
    ) {
      const aKeys = Object.keys(a).sort();
      const bKeys = Object.keys(b).sort();
      expect(aKeys, `Mismatch at ${prefix}`).toEqual(bKeys);

      for (const key of aKeys) {
        const aVal = a[key];
        const bVal = b[key];
        if (typeof aVal === 'object' && aVal !== null && !Array.isArray(aVal)) {
          expect(typeof bVal, `Type mismatch at ${prefix}.${key}`).toBe(
            'object'
          );
          checkKeys(
            aVal as Record<string, unknown>,
            bVal as Record<string, unknown>,
            `${prefix}.${key}`
          );
        } else {
          expect(typeof aVal).toBe('string');
          expect(typeof bVal).toBe('string');
          expect((aVal as string).length).toBeGreaterThan(0);
          expect((bVal as string).length).toBeGreaterThan(0);
        }
      }
    }

    checkKeys(
      zh as unknown as Record<string, unknown>,
      en as unknown as Record<string, unknown>
    );
  });

  it('provides all type system labels in both languages', () => {
    for (const locale of ['zh', 'en'] as Locale[]) {
      const msg = getMessages(locale);
      expect(msg.collection.typeSystems.static).toBeTruthy();
      expect(msg.collection.typeSystems.dynamic).toBeTruthy();
      expect(msg.collection.typeSystems.gradual).toBeTruthy();
    }
  });

  it('provides all article status labels in both languages', () => {
    for (const locale of ['zh', 'en'] as Locale[]) {
      const msg = getMessages(locale);
      expect(msg.article.statusLabels.native).toBeTruthy();
      expect(msg.article.statusLabels.idiomatic).toBeTruthy();
      expect(msg.article.statusLabels['not-applicable']).toBeTruthy();
      expect(msg.article.statusLabels.undocumented).toBeTruthy();
    }
  });
});
