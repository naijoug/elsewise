import { describe, expect, it } from 'vitest';
import { content } from './localized-content';
import { knowledge, knowledgeSearch } from './knowledge';
import { toggledTopic } from './knowledge-identity';
import ledger from '../../../docs/strings-source-coverage.json';

describe('canonical Unicode string-length documentation', () => {
  it.each(['zh', 'en'] as const)(
    'keeps one foundational identity with bilingual evidence (%s)',
    (locale) => {
      const doc = content(locale).features.find(
        (f) => f.id === 'string-length'
      )!;
      expect(doc.scope).toBe('shared');
      expect(doc.entries.map((e) => e.languageId)).toEqual([
        'javascript',
        'typescript',
        'python',
        'go',
      ]);
      expect(doc.entries.map((e) => e.sources)).toEqual(
        ledger.entries.map((e) => e.reviewedSections)
      );
      const items = knowledge(locale).filter(
        (i) => i.id === 'feature:string-length'
      );
      expect(items).toHaveLength(1);
      expect(items[0].chapter).toBe('basics');
      expect(
        knowledgeSearch(locale).find((i) => i.id === 'feature:string-length')
          ?.text
      ).toContain('runecountinstring');
      for (const entry of doc.entries) {
        expect(entry.code).toBeTruthy();
        expect(entry.baseline).toBeTruthy();
        expect(entry.versionNotes).toBeTruthy();
        expect(entry.sources.length).toBeGreaterThan(0);
        if (locale === 'en') {
          expect(
            entry.summary + entry.versionNotes + entry.baseline
          ).not.toMatch(/[\u3400-\u9fff]/);
          expect(entry.versionNotes.toLowerCase()).toMatch(/grapheme/);
          expect(entry.versionNotes.toLowerCase()).toMatch(/not.*executed/);
        }
      }
    }
  );

  it('preserves historical learned and favorite keys', () => {
    const before = ['closure', 'feature:split-path', 'unknown-future-record'];
    const saved = toggledTopic(before, 'feature:string-length');
    expect(saved).toEqual([...before, 'feature:string-length']);
    expect(toggledTopic(saved, 'feature:string-length')).toEqual(before);
  });
});
