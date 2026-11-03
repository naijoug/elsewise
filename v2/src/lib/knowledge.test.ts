import { describe, it, expect } from 'vitest';
import { knowledge, chapters, knowledgeSearch } from './knowledge';
import { content } from './localized-content';
import { hasTopic, toggledTopic } from './knowledge-identity';
describe('unified knowledge directory', () => {
  it.each(['zh', 'en'] as const)(
    'covers every source once without confusing related concepts (%s)',
    (locale) => {
      const items = knowledge(locale);
      expect(items).toHaveLength(50);
      expect(new Set(items.map((i) => i.id)).size).toBe(50);
      expect(items.map((i) => i.id)).toEqual(
        expect.arrayContaining(
          content(locale).features.map((f) => `feature:${f.id}`)
        )
      );
      expect(items.map((i) => i.id)).toEqual(
        expect.arrayContaining(
          content(locale)
            .idioms.filter((i) => i.id !== 'closure')
            .map((i) => i.id)
        )
      );
      expect(
        items.find((i) => i.id === 'feature:closures')?.example?.href
      ).toBe('/idiom/closure/');
      expect(
        items.find((i) => i.id === 'feature:closures')?.languageIds
      ).toHaveLength(12);
      expect(items.find((i) => i.id === 'builder-pattern')?.chapter).toBe(
        'objects'
      );
      expect(items.find((i) => i.id === 'array-map')?.chapter).toBe(
        'collections'
      );
      expect(
        items.every(
          (i) =>
            !('entries' in i) && !('implementations' in i) && !('code' in i)
        )
      ).toBe(true);
      expect(items[0].id).toBe('feature:syntax-basics');
      expect(chapters.map((c) => c.id).slice(0, 3)).toEqual([
        'basics',
        'functions',
        'collections',
      ]);
      const search = knowledgeSearch(locale);
      expect(search).toHaveLength(50);
      expect(search.find((i) => i.id === 'feature:closures')?.text).toContain(
        'counter'
      );
    }
  );
  it('maps bilingual concepts to the same stable IDs', () => {
    expect(knowledge('zh').map((i) => i.id)).toEqual(
      knowledge('en').map((i) => i.id)
    );
  });
  it('reads either closure record and toggles both aliases without losing other IDs', () => {
    expect(hasTopic(['closure'], 'feature:closures')).toBe(true);
    expect(hasTopic(['feature:closures'], 'closure')).toBe(true);
    expect(
      toggledTopic(['closure', 'feature:closures', 'unknown'], 'closure')
    ).toEqual(['unknown']);
    expect(toggledTopic(['unknown'], 'closure')).toEqual([
      'unknown',
      'feature:closures',
    ]);
  });
});

it('retains valid Console.WriteLine calls in the C# map example', () => {
  const code = content('en').features.find(f => f.id === 'key-value-maps')!.entries.find(e => e.languageId === 'csharp')!.code!;
  expect(code).not.toContain('Writeemptye');
  expect(code.match(/Console\.WriteLine\(/g)).toHaveLength(4);
});
