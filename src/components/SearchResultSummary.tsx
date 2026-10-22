import type { ActiveFilterSummaryItem } from '../utils/filters';

export interface SearchResultSummaryProps {
  /** Number of items after search and filters are applied. */
  resultCount: number;
  /** Total number of items before search and filters are applied. */
  totalCount: number;
  /** Whether there is any active search query or filter. */
  hasActiveFilters: boolean;
  /** Whether the visible result count is waiting for debounced search input. */
  isUpdating?: boolean;
  /** Human-readable labels for active search/filter criteria. */
  activeFilterItems: ActiveFilterSummaryItem[];
  /** Clears all active search and filter criteria. */
  onClearFilters: () => void;
  /** Removes one active search/filter criterion. */
  onRemoveFilterItem: (item: ActiveFilterSummaryItem) => void;
}

export function SearchResultSummary({
  resultCount,
  totalCount,
  hasActiveFilters,
  isUpdating = false,
  activeFilterItems,
  onClearFilters,
  onRemoveFilterItem,
}: SearchResultSummaryProps) {
  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-sm text-gray-600">
          找到{' '}
          <span className="font-semibold text-gray-900">{resultCount}</span>{' '}
          个习语
          {totalCount !== resultCount && (
            <span className="text-gray-400"> / 共 {totalCount} 个</span>
          )}
          {isUpdating && (
            <span className="ml-2 text-blue-600">正在更新搜索结果…</span>
          )}
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm sm:text-base text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium min-h-[44px] px-2 py-2"
            aria-label="清除所有搜索和筛选条件"
          >
            清除筛选
          </button>
        )}
      </div>

      {hasActiveFilters && activeFilterItems.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="当前搜索和筛选条件">
          {activeFilterItems.map((item) => (
            <button
              key={`${item.type}:${item.value}`}
              type="button"
              onClick={() => onRemoveFilterItem(item)}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label={`移除条件：${item.label}`}
              title={`移除条件：${item.label}`}
            >
              <span>{item.label}</span>
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
