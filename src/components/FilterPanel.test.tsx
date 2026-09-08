import { act, type ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanupRenderedComponents,
  renderComponent,
} from '../test/renderComponent';
import { FilterPanel } from './FilterPanel';

function renderFilterPanel(
  props: Partial<ComponentProps<typeof FilterPanel>> = {}
) {
  const defaultProps: ComponentProps<typeof FilterPanel> = {
    filters: {},
    onFilterChange: vi.fn(),
    availableCategories: ['Collection', 'Concurrency'],
    availableParadigms: ['Functional', 'Object-Oriented'],
    availableLanguages: [
      { id: 'ts', name: 'TypeScript' },
      { id: 'py', name: 'Python' },
    ],
  };

  return renderComponent(<FilterPanel {...defaultProps} {...props} />)
    .container;
}

afterEach(cleanupRenderedComponents);

describe('FilterPanel', () => {
  it('渲染可用筛选分组，并在无活跃筛选时隐藏清除按钮', () => {
    const view = renderFilterPanel();

    expect(
      view.querySelector('[role="region"][aria-label="筛选面板"]')
    ).not.toBeNull();
    expect(view.textContent).toContain('难度');
    expect(view.textContent).toContain('Collection');
    expect(view.textContent).toContain('Functional');
    expect(view.textContent).toContain('TypeScript');
    expect(
      view.querySelector('button[aria-label="清除所有筛选条件"]')
    ).toBeNull();
  });

  it('添加筛选条件时保留既有筛选并追加新值', () => {
    const onFilterChange = vi.fn();
    const view = renderFilterPanel({
      filters: {
        categories: ['Collection'],
        paradigms: ['Functional'],
      },
      onFilterChange,
    });

    act(() => {
      view
        .querySelector<HTMLInputElement>('input[aria-label="筛选难度：中级"]')
        ?.click();
    });

    expect(onFilterChange).toHaveBeenCalledWith({
      categories: ['Collection'],
      paradigms: ['Functional'],
      difficulty: ['intermediate'],
    });
  });

  it('取消最后一个同组筛选值时将该组置为 undefined', () => {
    const onFilterChange = vi.fn();
    const view = renderFilterPanel({
      filters: {
        difficulty: ['beginner'],
        languages: ['ts'],
      },
      onFilterChange,
    });

    act(() => {
      view
        .querySelector<HTMLInputElement>('input[aria-label="筛选难度：初级"]')
        ?.click();
    });

    expect(onFilterChange).toHaveBeenCalledWith({
      difficulty: undefined,
      languages: ['ts'],
    });
  });

  it('支持一键清除所有活跃筛选条件', () => {
    const onFilterChange = vi.fn();
    const view = renderFilterPanel({
      filters: {
        categories: ['Collection'],
        difficulty: ['advanced'],
        languages: ['py'],
      },
      onFilterChange,
    });

    act(() => {
      view
        .querySelector<HTMLButtonElement>(
          'button[aria-label="清除所有筛选条件"]'
        )
        ?.click();
    });

    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  it('移动端默认展示筛选选项，并支持收起后重新展开', () => {
    const view = renderFilterPanel();
    const toggleButton = view.querySelector<HTMLButtonElement>(
      'button[aria-controls="filter-options"]'
    );
    const filterOptions = view.querySelector<HTMLDivElement>('#filter-options');

    expect(toggleButton?.getAttribute('aria-expanded')).toBe('true');
    expect(toggleButton?.getAttribute('aria-label')).toBe('收起筛选面板');
    expect(filterOptions?.className).toContain('block');

    act(() => {
      toggleButton?.click();
    });

    expect(toggleButton?.getAttribute('aria-expanded')).toBe('false');
    expect(toggleButton?.getAttribute('aria-label')).toBe('展开筛选面板');
    expect(filterOptions?.className).toContain('hidden');

    act(() => {
      toggleButton?.click();
    });

    expect(toggleButton?.getAttribute('aria-expanded')).toBe('true');
    expect(toggleButton?.getAttribute('aria-label')).toBe('收起筛选面板');
    expect(filterOptions?.className).toContain('block');
  });
});
