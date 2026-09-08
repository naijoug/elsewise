import { useState, memo, useCallback, useMemo } from 'react';
import type { FilterOptions } from '../types';
import { Button } from './common';

export interface LanguageFilterOption {
  id: string;
  name: string;
}

export interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableCategories?: string[];
  availableParadigms?: string[];
  availableLanguages?: LanguageFilterOption[];
}

export const FilterPanel = memo(function FilterPanel({
  filters,
  onFilterChange,
  availableCategories = [],
  availableParadigms = [],
  availableLanguages = [],
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const difficulties: Array<'beginner' | 'intermediate' | 'advanced'> = [
    'beginner',
    'intermediate',
    'advanced',
  ];

  const difficultyLabels = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  };

  const toggleFilter = useCallback(
    <K extends keyof FilterOptions>(key: K, value: string) => {
      const currentValues = (filters[key] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      onFilterChange({
        ...filters,
        [key]: newValues.length > 0 ? newValues : undefined,
      });
    },
    [filters, onFilterChange]
  );

  const clearFilters = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = useMemo(
    () =>
      (filters.categories?.length ?? 0) > 0 ||
      (filters.paradigms?.length ?? 0) > 0 ||
      (filters.difficulty?.length ?? 0) > 0 ||
      (filters.languages?.length ?? 0) > 0,
    [filters]
  );

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      role="region"
      aria-label="筛选面板"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">筛选</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              aria-label="清除所有筛选条件"
            >
              清除
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-2 min-w-[44px] min-h-[44px] hover:bg-gray-100 rounded active:bg-gray-200 transition-colors flex items-center justify-center"
            aria-label={isExpanded ? '收起筛选面板' : '展开筛选面板'}
            aria-expanded={isExpanded}
            aria-controls="filter-options"
          >
            <svg
              className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="filter-options"
        className={`space-y-6 ${isExpanded ? 'block' : 'hidden'} lg:block`}
      >
        {/* Difficulty Filter */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">
            难度
          </legend>
          <div className="space-y-2" role="group" aria-label="难度筛选选项">
            {difficulties.map((difficulty) => (
              <label
                key={difficulty}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[44px] active:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.difficulty?.includes(difficulty) ?? false}
                  onChange={() => toggleFilter('difficulty', difficulty)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-label={`筛选难度：${difficultyLabels[difficulty]}`}
                />
                <span className="ml-3 text-base text-gray-700">
                  {difficultyLabels[difficulty]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Categories Filter */}
        {availableCategories.length > 0 && (
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              分类
            </legend>
            <div
              className="space-y-2 max-h-48 overflow-y-auto"
              role="group"
              aria-label="分类筛选选项"
            >
              {availableCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[44px] active:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories?.includes(category) ?? false}
                    onChange={() => toggleFilter('categories', category)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label={`筛选分类：${category}`}
                  />
                  <span className="ml-3 text-base text-gray-700">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Paradigms Filter */}
        {availableParadigms.length > 0 && (
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              范式
            </legend>
            <div
              className="space-y-2 max-h-48 overflow-y-auto"
              role="group"
              aria-label="范式筛选选项"
            >
              {availableParadigms.map((paradigm) => (
                <label
                  key={paradigm}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[44px] active:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.paradigms?.includes(paradigm) ?? false}
                    onChange={() => toggleFilter('paradigms', paradigm)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label={`筛选范式：${paradigm}`}
                  />
                  <span className="ml-3 text-base text-gray-700">
                    {paradigm}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Languages Filter */}
        {availableLanguages.length > 0 && (
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              语言
            </legend>
            <div
              className="space-y-2 max-h-48 overflow-y-auto"
              role="group"
              aria-label="语言筛选选项"
            >
              {availableLanguages.map((language) => (
                <label
                  key={language.id}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[44px] active:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.languages?.includes(language.id) ?? false}
                    onChange={() => toggleFilter('languages', language.id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label={`筛选语言：${language.name}`}
                  />
                  <span className="ml-3 text-base text-gray-700">
                    {language.name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>
    </div>
  );
});
