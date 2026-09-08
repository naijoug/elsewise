import type { Idiom, FilterOptions, Language } from '../types';

export interface LanguageFilterOption {
  id: string;
  name: string;
}

export type SearchMatchLabel =
  | '标题'
  | '描述'
  | '标签'
  | '分类'
  | '实现语言'
  | '实现代码'
  | '实现说明';

export interface SearchMatchLabelSummary {
  visibleLabels: SearchMatchLabel[];
  hiddenCount: number;
}

export interface ActiveFilterSummaryOptions {
  query?: string;
  filters?: FilterOptions;
  languages?: LanguageFilterOption[];
}

type LanguageLookup = Map<string, string>;

export const IDIOM_SEARCH_SCOPE_HINT =
  '标题、描述、标签、分类、语言名称/ID、代码或实现说明关键词';

export type ActiveFilterSummaryItemType =
  | 'query'
  | 'category'
  | 'paradigm'
  | 'difficulty'
  | 'language';

export interface ActiveFilterSummaryItem {
  type: ActiveFilterSummaryItemType;
  label: string;
  value: string;
}

const difficultyLabels: Record<Idiom['difficulty'], string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
};

function normalizeSearchQuery(query: string): string {
  return query.toLowerCase().trim();
}

function includesQuery(value: string, normalizedQuery: string): boolean {
  return value.toLowerCase().includes(normalizedQuery);
}

function buildLanguageLookup(
  languages: LanguageFilterOption[] = []
): LanguageLookup {
  return new Map(languages.map((language) => [language.id, language.name]));
}

function implementationMatchesLanguageQuery(
  languageId: string,
  normalizedQuery: string,
  languageLookup: LanguageLookup
): boolean {
  return (
    includesQuery(languageId, normalizedQuery) ||
    includesQuery(languageLookup.get(languageId) || '', normalizedQuery)
  );
}

/**
 * 返回单个习语被关键词命中的字段标签。
 *
 * 该函数用于列表页解释“为什么这条结果会出现”，与 searchIdioms
 * 使用相同的搜索范围。查询为空时返回空数组，避免把无搜索状态误标成匹配。
 */
export function getIdiomSearchMatchLabels(
  idiom: Idiom,
  query: string,
  languages: LanguageFilterOption[] = []
): SearchMatchLabel[] {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const labels: SearchMatchLabel[] = [];
  const languageLookup = buildLanguageLookup(languages);

  if (includesQuery(idiom.title, normalizedQuery)) {
    labels.push('标题');
  }

  if (includesQuery(idiom.description, normalizedQuery)) {
    labels.push('描述');
  }

  if (idiom.tags.some((tag) => includesQuery(tag, normalizedQuery))) {
    labels.push('标签');
  }

  if (includesQuery(idiom.category, normalizedQuery)) {
    labels.push('分类');
  }

  if (
    idiom.implementations.some((implementation) =>
      implementationMatchesLanguageQuery(
        implementation.languageId,
        normalizedQuery,
        languageLookup
      )
    )
  ) {
    labels.push('实现语言');
  }

  if (
    idiom.implementations.some((implementation) =>
      includesQuery(implementation.code, normalizedQuery)
    )
  ) {
    labels.push('实现代码');
  }

  if (
    idiom.implementations.some((implementation) =>
      includesQuery(implementation.explanation, normalizedQuery)
    )
  ) {
    labels.push('实现说明');
  }

  return labels;
}

/**
 * 将搜索命中字段压缩成适合卡片展示的摘要。
 *
 * 卡片空间有限，默认只展示前 3 个命中字段，其余用 +N 表示，避免标题、描述、
 * 标签和实现字段同时命中时在结果列表里产生过多视觉噪声。
 */
export function summarizeSearchMatchLabels(
  labels: SearchMatchLabel[],
  maxVisible = 3
): SearchMatchLabelSummary {
  const visibleCount = Math.max(0, maxVisible);
  const visibleLabels = labels.slice(0, visibleCount);

  return {
    visibleLabels,
    hiddenCount: Math.max(labels.length - visibleLabels.length, 0),
  };
}

/**
 * 生成人类可读的当前搜索/筛选条件摘要。
 *
 * 用于列表页结果统计和空状态，帮助用户理解“当前为什么只有这些结果”，也让清除
 * 筛选前的状态更容易复核。语言筛选优先展示语言名称，缺少元数据时回退到 languageId。
 */
export function getActiveFilterSummaryItems({
  query = '',
  filters = {},
  languages = [],
}: ActiveFilterSummaryOptions): ActiveFilterSummaryItem[] {
  const items: ActiveFilterSummaryItem[] = [];
  const normalizedQuery = query.trim();

  if (normalizedQuery) {
    items.push({
      type: 'query',
      label: `搜索：${normalizedQuery}`,
      value: normalizedQuery,
    });
  }

  filters.categories?.forEach((category) => {
    items.push({
      type: 'category',
      label: `分类：${category}`,
      value: category,
    });
  });

  filters.paradigms?.forEach((paradigm) => {
    items.push({
      type: 'paradigm',
      label: `范式：${paradigm}`,
      value: paradigm,
    });
  });

  filters.difficulty?.forEach((difficulty) => {
    items.push({
      type: 'difficulty',
      label: `难度：${difficultyLabels[difficulty]}`,
      value: difficulty,
    });
  });

  filters.languages?.forEach((languageId) => {
    items.push({
      type: 'language',
      label: `语言：${
        languages.find((language) => language.id === languageId)?.name ||
        languageId
      }`,
      value: languageId,
    });
  });

  return items;
}

export function getActiveFilterSummaryLabels(
  options: ActiveFilterSummaryOptions
): string[] {
  return getActiveFilterSummaryItems(options).map((item) => item.label);
}

/**
 * 根据关键词搜索习语
 *
 * 搜索范围包括：
 * - 习语标题
 * - 习语描述
 * - 习语标签
 * - 习语分类
 * - 实现语言 ID 与语言展示名称
 * - 实现代码和说明
 *
 * 搜索不区分大小写，会自动去除首尾空格
 *
 * @param idioms - 要搜索的习语数组
 * @param query - 搜索关键词
 * @returns 匹配的习语数组，如果查询为空则返回所有习语
 *
 * @example
 * ```typescript
 * const results = searchIdioms(allIdioms, '数组');
 * // 返回标题、描述、标签或分类中包含"数组"的所有习语
 * ```
 */
export function searchIdioms(
  idioms: Idiom[],
  query: string,
  languages: LanguageFilterOption[] = []
): Idiom[] {
  if (!query || query.trim() === '') {
    return idioms;
  }

  const normalizedQuery = normalizeSearchQuery(query);
  const languageLookup = buildLanguageLookup(languages);

  return idioms.filter((idiom) => {
    // 搜索标题
    if (includesQuery(idiom.title, normalizedQuery)) {
      return true;
    }

    // 搜索描述
    if (includesQuery(idiom.description, normalizedQuery)) {
      return true;
    }

    // 搜索标签
    if (idiom.tags.some((tag) => includesQuery(tag, normalizedQuery))) {
      return true;
    }

    // 搜索分类
    if (includesQuery(idiom.category, normalizedQuery)) {
      return true;
    }

    // 搜索具体实现：语言、代码和说明
    if (
      idiom.implementations.some(
        (implementation) =>
          implementationMatchesLanguageQuery(
            implementation.languageId,
            normalizedQuery,
            languageLookup
          ) ||
          includesQuery(implementation.code, normalizedQuery) ||
          includesQuery(implementation.explanation, normalizedQuery)
      )
    ) {
      return true;
    }

    return false;
  });
}

/**
 * 根据筛选条件过滤习语
 *
 * 支持的筛选条件：
 * - categories: 按分类筛选（数组，支持多选）
 * - paradigms: 按编程范式筛选（数组，支持多选，只要习语包含任一范式即匹配）
 * - difficulty: 按难度筛选（数组，支持多选）
 * - languages: 按语言筛选（数组，支持多选，只要习语有该语言的实现即匹配）
 *
 * 多个筛选条件之间是 AND 关系，同一条件内的多个值是 OR 关系
 *
 * @param idioms - 要筛选的习语数组
 * @param filters - 筛选条件对象
 * @returns 符合所有筛选条件的习语数组
 *
 * @example
 * ```typescript
 * const filtered = filterIdioms(allIdioms, {
 *   categories: ['数据处理'],
 *   difficulty: ['beginner', 'intermediate'],
 *   languages: ['javascript', 'python']
 * });
 * // 返回分类为"数据处理"，难度为初级或中级，且有 JS 或 Python 实现的习语
 * ```
 */
export function filterIdioms(idioms: Idiom[], filters: FilterOptions): Idiom[] {
  let result = idioms;

  // 按分类筛选
  if (filters.categories && filters.categories.length > 0) {
    result = result.filter((idiom) =>
      filters.categories!.includes(idiom.category)
    );
  }

  // 按范式筛选
  if (filters.paradigms && filters.paradigms.length > 0) {
    result = result.filter((idiom) =>
      idiom.paradigms.some((paradigm) => filters.paradigms!.includes(paradigm))
    );
  }

  // 按难度筛选
  if (filters.difficulty && filters.difficulty.length > 0) {
    result = result.filter((idiom) =>
      filters.difficulty!.includes(idiom.difficulty)
    );
  }

  // 按语言筛选（习语必须有该语言的实现）
  if (filters.languages && filters.languages.length > 0) {
    result = result.filter((idiom) =>
      filters.languages!.some((langId) =>
        idiom.implementations.some((impl) => impl.languageId === langId)
      )
    );
  }

  return result;
}

/**
 * 组合搜索和筛选
 *
 * 先执行关键词搜索，然后对搜索结果应用筛选条件
 * 这样可以确保结果同时满足搜索和筛选的要求
 *
 * @param idioms - 要处理的习语数组
 * @param query - 搜索关键词
 * @param filters - 筛选条件对象
 * @returns 同时满足搜索和筛选条件的习语数组
 *
 * @example
 * ```typescript
 * const results = searchAndFilterIdioms(allIdioms, '数组', {
 *   difficulty: ['beginner']
 * });
 * // 返回包含"数组"关键词且难度为初级的习语
 * ```
 */
export function searchAndFilterIdioms(
  idioms: Idiom[],
  query: string,
  filters: FilterOptions,
  languages: LanguageFilterOption[] = []
): Idiom[] {
  // 先搜索，再筛选
  const searchResults = searchIdioms(idioms, query, languages);
  return filterIdioms(searchResults, filters);
}

/**
 * 获取所有可用的分类
 *
 * 从习语数组中提取所有唯一的分类，并按字母顺序排序
 * 用于生成筛选面板中的分类选项
 *
 * @param idioms - 习语数组
 * @returns 排序后的分类名称数组
 */
export function getAvailableCategories(idioms: Idiom[]): string[] {
  const categories = new Set<string>();
  idioms.forEach((idiom) => categories.add(idiom.category));
  return Array.from(categories).sort();
}

/**
 * 获取所有可用的范式
 *
 * 从习语数组中提取所有唯一的编程范式，并按字母顺序排序
 * 一个习语可能包含多个范式，此函数会收集所有范式
 *
 * @param idioms - 习语数组
 * @returns 排序后的范式名称数组
 */
export function getAvailableParadigms(idioms: Idiom[]): string[] {
  const paradigms = new Set<string>();
  idioms.forEach((idiom) => {
    idiom.paradigms.forEach((paradigm) => paradigms.add(paradigm));
  });
  return Array.from(paradigms).sort();
}

/**
 * 获取所有难度级别
 *
 * 返回系统支持的所有难度级别常量
 * - beginner: 初级
 * - intermediate: 中级
 * - advanced: 高级
 *
 * @returns 难度级别数组
 */
export function getAvailableDifficulties(): Array<
  'beginner' | 'intermediate' | 'advanced'
> {
  return ['beginner', 'intermediate', 'advanced'];
}

/**
 * 获取所有有实现的语言 ID
 *
 * 从习语实现中提取唯一语言 ID，并按字母顺序排序
 * 用于生成语言筛选选项，确保只展示当前数据集中真正可筛选的语言
 *
 * @param idioms - 习语数组
 * @returns 排序后的语言 ID 数组
 */
export function getAvailableLanguageIds(idioms: Idiom[]): string[] {
  const languageIds = new Set<string>();
  idioms.forEach((idiom) => {
    idiom.implementations.forEach((implementation) => {
      languageIds.add(implementation.languageId);
    });
  });
  return Array.from(languageIds).sort();
}

/**
 * 获取语言筛选选项
 *
 * 只返回当前习语数据中有实现的语言，并优先使用语言数据中的展示名称。
 * 如果语言数据尚未加载或缺少定义，则回退显示 languageId。
 *
 * @param idioms - 习语数组
 * @param languages - 语言元数据数组
 * @returns 可用于筛选面板的语言选项
 */
export function getAvailableLanguageOptions(
  idioms: Idiom[],
  languages: Language[]
): LanguageFilterOption[] {
  return getAvailableLanguageIds(idioms).map((languageId) => ({
    id: languageId,
    name:
      languages.find((language) => language.id === languageId)?.name ||
      languageId,
  }));
}
