import { afterEach, describe, expect, it, vi } from 'vitest';
import { features, validateFeatures } from './feature-content';
import paths from '../data/paths.json';

function fixture() {
  const topic = structuredClone(features.find((f) => f.id === 'split-path')!);
  topic.related = [];
  topic.idiomIds = [];
  return [topic];
}

describe('feature JSON boundary validation', () => {
  it.each(['native', 'idiomatic'] as const)(
    'requires actual code for %s entries',
    (status) => {
      for (const code of ['', ' \n\t', null, undefined, 42]) {
        const data = fixture();
        Object.assign(data[0].entries[0], { status, code });
        expect(() => validateFeatures(data)).toThrow(
          /Feature 'split-path' entry 'javascript': code/
        );
      }
    }
  );
  it.each(['not-applicable', 'undocumented'] as const)(
    'allows explicitly empty code for %s, with evidence still required',
    (status) => {
      const data = fixture();
      Object.assign(data[0].entries[0], { status, code: '' });
      expect(() => validateFeatures(data)).not.toThrow();
      data[0].entries[0].versionNotes = ' ';
      expect(() => validateFeatures(data)).toThrow(/versionNotes/);
      data[0].entries[0].versionNotes =
        'Example is not applicable in this environment.';
      data[0].entries[0].sources = [];
      expect(() => validateFeatures(data)).toThrow(/sources/);
    }
  );
  it.each(['baseline', 'summary', 'versionNotes'])(
    'rejects missing, blank, or wrongly typed %s',
    (field) => {
      for (const value of [undefined, null, '', ' \n', 42, {}]) {
        const data = fixture();
        Object.assign(data[0].entries[0], { [field]: value });
        expect(() => validateFeatures(data)).toThrow(
          new RegExp(`entry 'javascript': ${field}`)
        );
      }
    }
  );
  it.each([
    'title',
    'description',
    'scopeNote',
    'tags',
    'related',
    'idiomIds',
    'entries',
  ])('rejects malformed topic field %s with a field path', (field) => {
    const data = fixture();
    Object.assign(data[0], { [field]: null });
    expect(() => validateFeatures(data)).toThrow(
      new RegExp(`Feature 'split-path': ${field}`)
    );
  });
  it('rejects malformed roots, array elements, and nested evidence without TypeErrors', () => {
    for (const value of [null, {}, [], [null]])
      expect(() => validateFeatures(value)).toThrow(/Features/);
    const data = fixture();
    Object.assign(data[0], { entries: [null] });
    expect(() => validateFeatures(data)).toThrow(/entries\[0\].*object/);
    const source = fixture();
    Object.assign(source[0].entries[0], { sources: [null] });
    expect(() => validateFeatures(source)).toThrow(/sources\[0\].*object/);
    Object.assign(source[0].entries[0], { sources: {} });
    expect(() => validateFeatures(source)).toThrow(/sources.*array/);
    Object.assign(data[0], { tags: ['valid', 123] });
    expect(() => validateFeatures(data)).toThrow(/tags\[1\]/);
  });
  it.each([
    'https://',
    'https://user:secret@example.com',
    'http://example.com',
    'https://example.com\n',
  ])('rejects invalid source URL %s', (url) => {
    const data = fixture();
    data[0].entries[0].sources[0].url = url;
    expect(() => validateFeatures(data)).toThrow(/sources\[0\].url/);
  });
  it.each(['2026-02-30', '2026-13-01', 'yesterday'])(
    'rejects invalid review date %s',
    (checkedAt) => {
      const data = fixture();
      data[0].entries[0].sources[0].checkedAt = checkedAt;
      expect(() => validateFeatures(data)).toThrow(/checkedAt/);
    }
  );
  it('validates source labels, IDs, support status, and duplicate languages', () => {
    const data = fixture();
    data[0].entries[0].sources[0].section = ' ';
    expect(() => validateFeatures(data)).toThrow(/section/);
    const unknown = fixture();
    unknown[0].entries[0].languageId = 'unknown';
    expect(() => validateFeatures(unknown)).toThrow(/Unknown language/);
    const duplicate = fixture();
    duplicate[0].entries.push(duplicate[0].entries[0]);
    expect(() => validateFeatures(duplicate)).toThrow(
      /Duplicate feature language/
    );
    const status = fixture();
    Object.assign(status[0].entries[0], { status: 'ready' });
    expect(() => validateFeatures(status)).toThrow(/Invalid support status/);
  });
  it('preserves valid content without rewriting it', () => {
    const before = structuredClone(features);
    expect(() => validateFeatures(features)).not.toThrow();
    expect(features).toEqual(before);
  });
});

describe('resolved English content validation', () => {
  afterEach(() => {
    vi.doUnmock('../data/paths.json');
    vi.resetModules();
  });
  it.each(['', 42])('rejects an English code override of %j', async (code) => {
    vi.resetModules();
    const translated = structuredClone(paths);
    Object.assign(translated[0].entries[0].en, { code });
    vi.doMock('../data/paths.json', () => ({ default: translated }));
    const { content } = await import('./localized-content');
    expect(() => content('zh')).not.toThrow();
    expect(() => content('en')).toThrow(
      /Feature 'compose-path' entry 'javascript': code/
    );
  });
});
