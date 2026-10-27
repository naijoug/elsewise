import { describe, expect, it } from 'vitest';
import { content, modules } from './localized-content';
import type { Implementation } from '../../../src/types';

const practicalIds = ['read-text-file', 'write-text-file', 'json', 'http-get'];
const cjk = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;

// Check prose recursively rather than skipping entire documents/implementations.
// Code and observed output may intentionally contain multilingual sample data;
// a cited source's own title is allowed to retain its original language.
function untranslatedProse(value: unknown, path = ''): string[] {
  if (typeof value === 'string') return cjk.test(value) ? [path] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      untranslatedProse(item, `${path}[${index}]`)
    );
  }
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, item]) => {
    if (['code', 'output', 'errorOutput'].includes(key)) return [];
    if (key === 'title' && /(?:sources|references)\[\d+\]$/.test(path))
      return [];
    return untranslatedProse(item, path ? `${path}.${key}` : key);
  });
}

function nonempty(value: unknown, label: string) {
  expect(typeof value, label).toBe('string');
  expect((value as string).trim().length, label).toBeGreaterThan(0);
}

describe('localized build content', () => {
  it('has no untranslated CJK prose in English content or English module labels', () => {
    expect(untranslatedProse(content('en'))).toEqual([]);
    expect(
      modules.flatMap((module) => untranslatedProse(module.en, module.id))
    ).toEqual([]);
  });

  it('preserves document, idiom, language and implementation IDs across locales', () => {
    const zh = content('zh');
    const en = content('en');
    for (const key of [
      'idioms',
      'languages',
      'features',
      'catalog',
      'featureSummaries',
    ] as const) {
      expect(
        en[key].map((item) => item.id),
        key
      ).toEqual(zh[key].map((item) => item.id));
    }
    for (const [index, idiom] of zh.idioms.entries()) {
      expect(
        en.idioms[index].implementations.map((entry) => entry.languageId),
        idiom.id
      ).toEqual(idiom.implementations.map((entry) => entry.languageId));
    }
    for (const [index, feature] of zh.features.entries()) {
      expect(
        en.features[index].entries.map((entry) => entry.languageId),
        feature.id
      ).toEqual(feature.entries.map((entry) => entry.languageId));
    }
  });

  it.each(['zh', 'en'] as const)(
    'covers all four practical tasks in all twelve languages (%s)',
    (locale) => {
      const localized = content(locale);
      const languageIds = localized.languages
        .map((language) => language.id)
        .sort();
      expect(languageIds).toHaveLength(12);
      const practical = localized.features.filter((feature) =>
        practicalIds.includes(feature.id)
      );
      expect(practical.map((feature) => feature.id).sort()).toEqual(
        [...practicalIds].sort()
      );
      expect(
        practical.reduce((count, feature) => count + feature.entries.length, 0)
      ).toBe(48);
      for (const feature of practical) {
        expect(
          feature.entries.map((entry) => entry.languageId).sort(),
          feature.id
        ).toEqual(languageIds);
        for (const entry of feature.entries) {
          const label = `${locale}/${feature.id}/${entry.languageId}`;
          nonempty(entry.baseline, `${label}: runtime and prerequisites`);
          nonempty(
            entry.versionNotes,
            `${label}: limitations and execution caveat`
          );
          nonempty(entry.summary, `${label}: explanation`);
          nonempty(entry.code, `${label}: code`);
          expect(entry.sources.length, `${label}: sources`).toBeGreaterThan(0);
          for (const source of entry.sources) {
            nonempty(source.title, `${label}: source title`);
            nonempty(source.section, `${label}: source chapter`);
            expect(source.url, `${label}: source URL`).toMatch(/^https:\/\//);
            expect(source.checkedAt, `${label}: checked date`).toMatch(
              /^\d{4}-\d{2}-\d{2}$/
            );
          }
        }
      }
    }
  );

  it('assigns all document IDs to exactly one directory module', () => {
    const assignedIds = modules.flatMap((module) => module.ids);
    expect(new Set(modules.map((module) => module.id)).size).toBe(
      modules.length
    );
    expect(assignedIds).toHaveLength(28);
    expect(new Set(assignedIds).size).toBe(assignedIds.length);
    expect([...assignedIds].sort()).toEqual(
      content('zh')
        .features.map((feature) => feature.id)
        .sort()
    );
  });

  it('preserves every populated optional implementation prose field in English', () => {
    const zh = content('zh');
    const en = content('en');
    const fields = [
      'output',
      'errorOutput',
      'designRationale',
      'pros',
      'cons',
      'references',
    ] as const;
    let checkedFields = 0;
    for (const idiom of zh.idioms) {
      const translated = en.idioms.find((item) => item.id === idiom.id)!;
      for (const implementation of idiom.implementations) {
        const localized = translated.implementations.find(
          (entry) => entry.languageId === implementation.languageId
        )!;
        nonempty(
          localized.explanation,
          `${idiom.id}/${implementation.languageId}: explanation`
        );
        for (const field of fields) {
          const original: Implementation[typeof field] = implementation[field];
          if (original === undefined) continue;
          checkedFields++;
          const label = `${idiom.id}/${implementation.languageId}/${field}`;
          expect(localized[field], label).toBeDefined();
          if (Array.isArray(original)) {
            expect(localized[field], label).toHaveLength(original.length);
          } else if (original.trim()) {
            nonempty(localized[field], label);
          }
          if (!['output', 'errorOutput'].includes(field)) {
            expect(
              untranslatedProse({ [field]: localized[field] }, label),
              label
            ).toEqual([]);
          }
        }
      }
    }
    expect(checkedFields).toBeGreaterThan(0);
  });
});


describe('foundations-first learning path', () => {
  const ids = ['syntax-basics', 'variables', 'constants', 'basic-types', 'operators', 'conditions', 'loops', 'functions'];
  it('starts with real foundation chapters, not practical APIs or empty placeholders', () => {
    expect(modules[0].ids).toEqual(ids);
    for (const locale of ['zh', 'en'] as const) {
      const localized = content(locale);
      for (const id of ids) {
        const chapter = localized.features.find(feature => feature.id === id)!;
        expect(chapter.entries.map(entry => entry.languageId).sort()).toEqual(localized.languages.map(language => language.id).sort());
        for (const entry of chapter.entries) {
          nonempty(entry.code, `${locale}/${id}/${entry.languageId}`);
          nonempty(entry.summary, 'summary');
          nonempty(entry.versionNotes, 'versionNotes');
          expect(entry.sources.length).toBeGreaterThan(0);
        }
      }
    }
  });
  it('distinguishes constants from universally immutable values', () => {
    const entries = content('en').features.find(feature => feature.id === 'constants')!.entries;
    const prose = (id: string) => { const e = entries.find(entry => entry.languageId === id)!; return `${e.summary} ${e.versionNotes}`; };
    expect(prose('javascript')).toMatch(/binding|reassign/i);
    expect(prose('python')).toMatch(/convention|runtime|run.time/i);
    expect(prose('cpp')).toMatch(/constexpr/);
    expect(prose('go')).toMatch(/constant expression|compile.time/i);
  });
});

it('covers types, branches and loops as sourced beginner chapters in both locales', () => {
  for (const locale of ['zh', 'en'] as const) {
    const chapters = content(locale).features.filter(feature => ['basic-types', 'conditions', 'loops'].includes(feature.id));
    expect(chapters).toHaveLength(3);
    expect(chapters.reduce((count, chapter) => count + chapter.entries.length, 0)).toBe(36);
    expect(chapters.find(chapter => chapter.id === 'basic-types')!.related).toContain('conditions');
    expect(chapters.find(chapter => chapter.id === 'conditions')!.related).toContain('loops');
    for (const chapter of chapters) {
      expect(chapter.scope).toBe('common');
      for (const entry of chapter.entries) {
        nonempty(entry.baseline, 'documented environment');
        nonempty(entry.versionNotes, 'execution and semantic boundaries');
        expect(entry.sources.every(source => source.url.startsWith('https://') && source.section.trim())).toBe(true);
      }
    }
  }
});
