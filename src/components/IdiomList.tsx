import { useState, useMemo, useCallback, memo } from 'react';
import type { Idiom, FilterOptions } from '../types';
import { EmptyState } from './EmptyState';
import { IdiomGrid } from './IdiomGrid';
import { SearchResultSummary } from './SearchResultSummary';
import { IdiomSearchControls } from './IdiomSearchControls';
import { useDebounce } from '../hooks';
import { useAppContext } from '../contexts';
import {
  getActiveFilterSummaryItems,
  getAvailableCategories,
  getAvailableLanguageOptions,
  getAvailableParadigms,
  getIdiomSearchMatchLabels,
  searchAndFilterIdioms,
} from '../utils/filters';
import type { ActiveFilterSummaryItem } from '../utils/filters';

export interface IdiomListProps {
  idioms: Idiom[];
}

export const IdiomList = memo(function IdiomList({ idioms }: IdiomListProps) {
  const { languages } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);

  // 使用防抖优化搜索性能
  const debouncedQuery = useDebounce(searchQuery, 300);

  const availableLanguageOptions = useMemo(() => {
    return getAvailableLanguageOptions(idioms, languages);
  }, [idioms, languages]);

  // 计算过滤后的习语列表
  const filteredIdioms = useMemo(() => {
    return searchAndFilterIdioms(
      idioms,
      debouncedQuery,
      filters,
      availableLanguageOptions
    );
  }, [idioms, debouncedQuery, filters, availableLanguageOptions]);

  // 处理搜索 (memoized)
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // 处理筛选 (memoized)
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  // 清除所有筛选 (memoized)
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({});
  }, []);

  // 检查是否有激活的筛选条件
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchQuery.trim() !== '' ||
        (filters.categories && filters.categories.length > 0) ||
        (filters.paradigms && filters.paradigms.length > 0) ||
        (filters.difficulty && filters.difficulty.length > 0) ||
        (filters.languages && filters.languages.length > 0)
    );
  }, [searchQuery, filters]);

  const activeFilterSummaryItems = useMemo(() => {
    return getActiveFilterSummaryItems({
      query: searchQuery,
      filters,
      languages: availableLanguageOptions,
    });
  }, [searchQuery, filters, availableLanguageOptions]);

  const handleRemoveFilterItem = useCallback(
    (item: ActiveFilterSummaryItem) => {
      if (item.type === 'query') {
        setSearchQuery('');
        return;
      }

      const filterKeyByType = {
        category: 'categories',
        paradigm: 'paradigms',
        difficulty: 'difficulty',
        language: 'languages',
      } as const;
      const filterKey = filterKeyByType[item.type];

      setFilters((currentFilters) => ({
        ...currentFilters,
        [filterKey]: currentFilters[filterKey]?.filter(
          (value) => value !== item.value
        ),
      }));
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* 搜索和筛选控制栏 */}
      <IdiomSearchControls
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onSearchClear={() => setSearchQuery('')}
        filters={filters}
        onFilterChange={handleFilterChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        availableCategories={getAvailableCategories(idioms)}
        availableParadigms={getAvailableParadigms(idioms)}
        availableLanguages={availableLanguageOptions}
      />

      {/* 结果统计和清除按钮 */}
      <SearchResultSummary
        resultCount={filteredIdioms.length}
        totalCount={idioms.length}
        hasActiveFilters={hasActiveFilters}
        activeFilterItems={activeFilterSummaryItems}
        onClearFilters={handleClearFilters}
        onRemoveFilterItem={handleRemoveFilterItem}
      />

      {/* 习语列表 */}
      {filteredIdioms.length > 0 ? (
        <IdiomGrid
          idioms={filteredIdioms}
          ariaLabel="编程习语列表"
          getSearchMatchLabels={(idiom) =>
            getIdiomSearchMatchLabels(
              idiom,
              debouncedQuery,
              availableLanguageOptions
            )
          }
        />
      ) : (
        <EmptyState
          icon="search"
          title="未找到习语"
          description="可尝试标题、标签、语言、代码或实现说明关键词"
          className="py-12"
          action={
            hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 min-h-[44px] text-sm sm:text-base text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium"
                aria-label="清除所有搜索和筛选条件"
              >
                清除所有筛选
              </button>
            )
          }
        />
      )}
    </div>
  );
});
