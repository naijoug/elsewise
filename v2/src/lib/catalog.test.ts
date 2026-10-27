import { describe, it, expect } from 'vitest';
import { filterSummaries, emptyFilters } from './catalog';
import { filterIdioms } from '../../../src/utils/filters';
import idioms from '../../../src/data/idioms.json';
import type { Idiom, FilterOptions } from '../../../src/types';
const summaries = idioms.map(({ implementations, ...rest }) => ({
  ...rest,
  languageIds: implementations.map((item) => item.languageId),
}));
describe('summary filter compatibility', () => {
  for (const filters of [
    {},
    { categories: ['数据处理'] },
    { paradigms: ['函数式'] },
    { difficulty: ['beginner', 'intermediate'] },
    { languages: ['javascript', 'rust'] },
    {
      categories: ['数据处理'],
      languages: ['python'],
      difficulty: ['beginner'],
    },
  ])
    it(JSON.stringify(filters), () =>
      expect(
        filterSummaries(summaries, { ...emptyFilters(), ...filters }).map(
          (item) => item.id
        )
      ).toEqual(
        filterIdioms(idioms as Idiom[], filters as FilterOptions).map(
          (item) => item.id
        )
      )
    );
  it('sorts without mutating original', () => {
    const ids = summaries.map((item) => item.id);
    const sorted = filterSummaries(
      summaries,
      emptyFilters(),
      'implementations'
    );
    expect(sorted[0].languageIds.length).toBe(
      Math.max(...summaries.map((item) => item.languageIds.length))
    );
    expect(summaries.map((item) => item.id)).toEqual(ids);
  });
  it('unknown category has no matches', () =>
    expect(
      filterSummaries(summaries, { ...emptyFilters(), categories: ['missing'] })
    ).toEqual([]));
});
