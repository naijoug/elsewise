export type Summary = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  paradigms: string[];
  tags: string[];
  languageIds: string[];
};
export type Filters = {
  categories: string[];
  paradigms: string[];
  difficulty: string[];
  languages: string[];
};
export type Sort = 'original' | 'title' | 'difficulty' | 'implementations';
export const emptyFilters = (): Filters => ({
  categories: [],
  paradigms: [],
  difficulty: [],
  languages: [],
});
export function filterSummaries(
  items: Summary[],
  filters: Filters,
  sort: Sort = 'original'
) {
  const results = items.filter(
    (item) =>
      (!filters.categories.length ||
        filters.categories.includes(item.category)) &&
      (!filters.paradigms.length ||
        item.paradigms.some((value) => filters.paradigms.includes(value))) &&
      (!filters.difficulty.length ||
        filters.difficulty.includes(item.difficulty)) &&
      (!filters.languages.length ||
        item.languageIds.some((value) => filters.languages.includes(value)))
  );
  const ranks: Record<string, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
  };
  if (sort === 'title')
    results.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  if (sort === 'difficulty')
    results.sort((a, b) => ranks[a.difficulty] - ranks[b.difficulty]);
  if (sort === 'implementations')
    results.sort((a, b) => b.languageIds.length - a.languageIds.length);
  return results;
}
