import { act, type ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  renderComponent,
  cleanupRenderedComponents,
} from '../test/renderComponent';
import { SearchResultSummary } from './SearchResultSummary';
import type { ActiveFilterSummaryItem } from '../utils/filters';

function renderSummary(
  props: Partial<ComponentProps<typeof SearchResultSummary>> = {}
) {
  const defaultItems: ActiveFilterSummaryItem[] = [
    { type: 'query', value: 'map', label: '搜索：map' },
    { type: 'difficulty', value: 'advanced', label: '难度：高级' },
  ];

  return renderComponent(
    <SearchResultSummary
      resultCount={2}
      totalCount={10}
      hasActiveFilters={true}
      activeFilterItems={defaultItems}
      onClearFilters={vi.fn()}
      onRemoveFilterItem={vi.fn()}
      {...props}
    />
  ).container;
}

afterEach(cleanupRenderedComponents);

describe('SearchResultSummary', () => {
  it('展示筛选后的数量、总数和当前条件 chip', () => {
    const view = renderSummary();

    expect(view.textContent).toContain('找到 2 个习语 / 共 10 个');
    expect(
      view.querySelector('[role="status"]')?.getAttribute('aria-live')
    ).toBe('polite');
    expect(
      view.querySelector('[aria-label="当前搜索和筛选条件"]')
    ).not.toBeNull();
    expect(
      view.querySelector('button[aria-label="移除条件：搜索：map"]')
    ).not.toBeNull();
    expect(
      view.querySelector('button[aria-label="移除条件：难度：高级"]')
    ).not.toBeNull();
  });

  it('没有活跃条件时隐藏清除按钮、条件 chip 和总数后缀', () => {
    const view = renderSummary({
      resultCount: 10,
      totalCount: 10,
      hasActiveFilters: false,
      activeFilterItems: [],
    });

    expect(view.textContent).toContain('找到 10 个习语');
    expect(view.textContent).not.toContain('/ 共 10 个');
    expect(
      view.querySelector('button[aria-label="清除所有搜索和筛选条件"]')
    ).toBeNull();
    expect(view.querySelector('[aria-label="当前搜索和筛选条件"]')).toBeNull();
  });

  it('搜索输入等待防抖结果时展示更新提示', () => {
    const view = renderSummary({ isUpdating: true });

    expect(view.textContent).toContain('正在更新搜索结果…');
  });

  it('点击清除和单个条件 chip 时触发对应回调', () => {
    const onClearFilters = vi.fn();
    const onRemoveFilterItem = vi.fn();
    const view = renderSummary({ onClearFilters, onRemoveFilterItem });

    act(() => {
      view
        .querySelector<HTMLButtonElement>(
          'button[aria-label="清除所有搜索和筛选条件"]'
        )
        ?.click();
    });
    act(() => {
      view
        .querySelector<HTMLButtonElement>(
          'button[aria-label="移除条件：难度：高级"]'
        )
        ?.click();
    });

    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(onRemoveFilterItem).toHaveBeenCalledTimes(1);
    expect(onRemoveFilterItem).toHaveBeenCalledWith({
      type: 'difficulty',
      value: 'advanced',
      label: '难度：高级',
    });
  });
});
