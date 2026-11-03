import { describe, expect, it } from 'vitest';
import { content } from './localized-content';
import { knowledge, knowledgeSearch } from './knowledge';
import { toggledTopic } from './knowledge-identity';
import ledger from '../.././../docs/paths-source-coverage.json';

describe('canonical path composition documentation', () => {
  it.each(['zh', 'en'] as const)(
    'keeps one partial-coverage document in the files chapter (%s)',
    (locale) => {
      const doc = content(locale).features.find(
        (f) => f.id === 'compose-path'
      )!;
      expect(doc.scope).toBe('shared');
      expect(doc.entries.map((e) => e.languageId)).toEqual([
        'javascript',
        'typescript',
        'python',
        'go',
      ]);
      expect(doc.entries.every((e) => e.status === 'native')).toBe(true);
      expect(
        knowledge(locale).filter((i) => i.id === 'feature:compose-path')
      ).toHaveLength(1);
      expect(
        knowledge(locale).find((i) => i.id === 'feature:compose-path')?.chapter
      ).toBe('files');
      expect(
        knowledgeSearch(locale).find((i) => i.id === 'feature:compose-path')
          ?.text
      ).toContain('posixpath');
      expect(doc.entries.map((e) => e.sources)).toEqual(
        ledger.entries.map((e) => e.reviewedSections)
      );
    }
  );
  it('uses one bilingual identity without replacing prior learning or favorite records', () => {
    const before = ['closure', 'feature:read-text-file', 'future-record'];
    const saved = toggledTopic(before, 'feature:compose-path');
    expect(saved).toEqual([...before, 'feature:compose-path']);
    expect(toggledTopic(saved, 'feature:compose-path')).toEqual(before);
    expect(
      content('en').features.find((f) => f.id === 'compose-path')!.title
    ).toBe('Compose file path segments');
    expect(
      content('zh').features.find((f) => f.id === 'compose-path')!.title
    ).toBe('组合文件路径片段');
  });
});
