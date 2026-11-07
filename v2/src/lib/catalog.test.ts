import { describe, it, expect } from 'vitest';
import { filterSummaries, emptyFilters, type Summary } from './catalog';
import idioms from '@shared/data/idioms.json';

const summaries: Summary[] = (
  idioms as Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    paradigms: string[];
    tags: string[];
    implementations: Array<{ languageId: string }>;
  }>
).map(({ implementations, ...rest }) => ({
  ...rest,
  languageIds: implementations.map((item) => item.languageId),
}));

describe('filterSummaries', () => {
  it('returns all items with empty filters', () => {
    const result = filterSummaries(summaries, emptyFilters());
    expect(result).toHaveLength(summaries.length);
    expect(result.map((item) => item.id)).toEqual(
      summaries.map((item) => item.id)
    );
  });

  it('filters by category', () => {
    const result = filterSummaries(summaries, {
      ...emptyFilters(),
      categories: ['数据处理'],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.category === '数据处理')).toBe(true);
  });

  it('filters by paradigm', () => {
    const result = filterSummaries(summaries, {
      ...emptyFilters(),
      paradigms: ['函数式'],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.paradigms.includes('函数式'))).toBe(
      true
    );
  });

  it('filters by difficulty', () => {
    const result = filterSummaries(summaries, {
      ...emptyFilters(),
      difficulty: ['beginner', 'intermediate'],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((item) =>
        ['beginner', 'intermediate'].includes(item.difficulty)
      )
    ).toBe(true);
  });

  it('filters by language', () => {
    const result = filterSummaries(summaries, {
      ...emptyFilters(),
      languages: ['javascript', 'rust'],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((item) =>
        item.languageIds.some((lang) => ['javascript', 'rust'].includes(lang))
      )
    ).toBe(true);
  });

  it('combines multiple filter dimensions (AND intersection)', () => {
    const result = filterSummaries(summaries, {
      categories: ['数据处理'],
      languages: ['python'],
      difficulty: ['beginner'],
      paradigms: [],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (item) =>
          item.category === '数据处理' &&
          item.languageIds.includes('python') &&
          item.difficulty === 'beginner'
      )
    ).toBe(true);
  });

  it('sorts by title', () => {
    const sorted = filterSummaries(summaries, emptyFilters(), 'title');
    for (let i = 1; i < sorted.length; i++) {
      expect(
        sorted[i - 1].title.localeCompare(sorted[i].title, 'zh-CN')
      ).toBeLessThanOrEqual(0);
    }
  });

  it('sorts by difficulty (beginner -> intermediate -> advanced)', () => {
    const ranks: Record<string, number> = {
      beginner: 0,
      intermediate: 1,
      advanced: 2,
    };
    const sorted = filterSummaries(summaries, emptyFilters(), 'difficulty');
    for (let i = 1; i < sorted.length; i++) {
      expect(ranks[sorted[i - 1].difficulty]).toBeLessThanOrEqual(
        ranks[sorted[i].difficulty]
      );
    }
  });

  it('sorts by implementations count without mutating original', () => {
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

  it('unknown category has no matches', () => {
    expect(
      filterSummaries(summaries, { ...emptyFilters(), categories: ['missing'] })
    ).toEqual([]);
  });
});
