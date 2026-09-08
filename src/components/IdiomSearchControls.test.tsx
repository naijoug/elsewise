import { act, type ChangeEvent, type ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanupRenderedComponents,
  renderComponent,
} from '../test/renderComponent';
import { IdiomSearchControls } from './IdiomSearchControls';

function renderControls(
  props: Partial<ComponentProps<typeof IdiomSearchControls>> = {}
) {
  const defaultProps: ComponentProps<typeof IdiomSearchControls> = {
    searchQuery: 'map',
    onSearchChange: vi.fn(),
    onSearchClear: vi.fn(),
    filters: {},
    onFilterChange: vi.fn(),
    showFilters: false,
    onToggleFilters: vi.fn(),
    availableCategories: ['Collection'],
    availableParadigms: ['Functional'],
    availableLanguages: [{ id: 'ts', name: 'TypeScript' }],
  };

  return renderComponent(<IdiomSearchControls {...defaultProps} {...props} />)
    .container;
}

afterEach(cleanupRenderedComponents);

describe('IdiomSearchControls', () => {
  it('展示搜索框和关闭状态的筛选按钮，并隐藏筛选面板', () => {
    const view = renderControls({ searchQuery: '' });
    const toggleButton = view.querySelector<HTMLButtonElement>(
      'button[aria-label="显示筛选面板"]'
    );

    expect(
      view.querySelector<HTMLInputElement>(
        'input[placeholder="搜索标题、描述、标签、分类、语言名称/ID、代码或实现说明关键词..."]'
      )
    ).not.toBeNull();
    expect(toggleButton?.getAttribute('aria-expanded')).toBe('false');
    expect(
      view.querySelector('[role="region"][aria-label="筛选面板"]')
    ).toBeNull();
    expect(view.querySelector('button[aria-label="清除搜索"]')).toBeNull();
  });

  it('支持清除搜索和切换筛选面板', () => {
    const onSearchClear = vi.fn();
    const onToggleFilters = vi.fn();
    const view = renderControls({ onSearchClear, onToggleFilters });

    act(() => {
      view
        .querySelector<HTMLButtonElement>('button[aria-label="清除搜索"]')
        ?.click();
    });
    act(() => {
      view
        .querySelector<HTMLButtonElement>('button[aria-label="显示筛选面板"]')
        ?.click();
    });

    expect(onSearchClear).toHaveBeenCalledTimes(1);
    expect(onToggleFilters).toHaveBeenCalledTimes(1);
  });

  it('展开时渲染筛选面板，并转发筛选变更', () => {
    const onFilterChange = vi.fn();
    const view = renderControls({
      showFilters: true,
      filters: { difficulty: ['beginner'] },
      onFilterChange,
    });
    const toggleButton = view.querySelector<HTMLButtonElement>(
      'button[aria-label="隐藏筛选面板"]'
    );

    expect(toggleButton?.getAttribute('aria-expanded')).toBe('true');
    expect(
      view.querySelector('[role="region"][aria-label="筛选面板"]')
    ).not.toBeNull();
    expect(view.textContent).toContain('TypeScript');

    act(() => {
      view
        .querySelector<HTMLInputElement>('input[aria-label="筛选难度：中级"]')
        ?.click();
    });

    expect(onFilterChange).toHaveBeenCalledWith({
      difficulty: ['beginner', 'intermediate'],
    });
  });

  it('转发搜索输入变更事件', () => {
    const onSearchChange = vi.fn();
    const view = renderControls({ searchQuery: '', onSearchChange });
    const input = view.querySelector<HTMLInputElement>('input[type="search"]');

    act(() => {
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )?.set;
      if (input && valueSetter) {
        valueSetter.call(input, 'reduce');
      }
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(
      (onSearchChange.mock.calls[0][0] as ChangeEvent<HTMLInputElement>).target
    ).toBe(input);
  });
});
