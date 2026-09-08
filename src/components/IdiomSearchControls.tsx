import type { ChangeEvent } from 'react';
import type { FilterOptions } from '../types';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import type { LanguageFilterOption } from './FilterPanel';
import { IDIOM_SEARCH_SCOPE_HINT } from '../utils/filters';

export interface IdiomSearchControlsProps {
  searchQuery: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearchClear: () => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  availableCategories: string[];
  availableParadigms: string[];
  availableLanguages: LanguageFilterOption[];
}

export function IdiomSearchControls({
  searchQuery,
  onSearchChange,
  onSearchClear,
  filters,
  onFilterChange,
  showFilters,
  onToggleFilters,
  availableCategories,
  availableParadigms,
  availableLanguages,
}: IdiomSearchControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onClear={onSearchClear}
            placeholder={`搜索${IDIOM_SEARCH_SCOPE_HINT}...`}
          />
        </div>
        <button
          onClick={onToggleFilters}
          className="px-4 py-3 min-h-[44px] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium text-gray-700"
          aria-label={showFilters ? '隐藏筛选面板' : '显示筛选面板'}
          aria-expanded={showFilters}
          aria-controls="filter-panel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="hidden sm:inline">筛选</span>
        </button>
      </div>

      {showFilters && (
        <div id="filter-panel">
          <FilterPanel
            filters={filters}
            onFilterChange={onFilterChange}
            availableCategories={availableCategories}
            availableParadigms={availableParadigms}
            availableLanguages={availableLanguages}
          />
        </div>
      )}
    </div>
  );
}
