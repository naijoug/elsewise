import { describe, expect, it } from 'vitest';
import { content } from './localized-content';
import { knowledge, knowledgeSearch } from './knowledge';
import { toggledTopic } from './knowledge-identity';
import ledger from '../../../docs/path-parts-source-coverage.json';

describe('canonical path decomposition documentation', () => {
  it.each(['zh', 'en'] as const)(
    'keeps bilingual content, evidence and one identity (%s)',
    (locale) => {
      const doc = content(locale).features.find((f) => f.id === 'split-path')!;
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
      expect(doc.entries.every((e) => e.status === 'native')).toBe(true);
      const items = knowledge(locale).filter(
        (i) => i.id === 'feature:split-path'
      );
      expect(items).toHaveLength(1);
      expect(items[0].chapter).toBe('files');
      expect(
        knowledgeSearch(locale).find((i) => i.id === 'feature:split-path')?.text
      ).toContain('splitext');
      for (const entry of doc.entries) {
        expect(entry.code).toContain('reports/2026/');
        expect(entry.code).toContain('.env');
        expect(entry.code).toContain('archive.tar.gz');
        expect(entry.code).toContain('""');
        if (locale === 'en')
          expect(
            entry.summary + entry.versionNotes + entry.baseline
          ).not.toMatch(/[\u3400-\u9fff]/);
      }
    }
  );
  it('does not remove historical records while learning or favoriting a new topic', () => {
    const before = [
      'closure',
      'feature:compose-path',
      'feature:read-text-file',
      'future-record',
    ];
    const saved = toggledTopic(before, 'feature:split-path');
    expect(saved).toEqual([...before, 'feature:split-path']);
    expect(toggledTopic(saved, 'feature:split-path')).toEqual(before);
    expect(
      content('zh').features.find((f) => f.id === 'split-path')!.title
    ).toBe('拆分文件路径');
    expect(
      content('en').features.find((f) => f.id === 'split-path')!.title
    ).toBe('Split file paths');
  });
});
