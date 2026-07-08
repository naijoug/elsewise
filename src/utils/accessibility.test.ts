import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  announceToScreenReader,
  generateId,
  getAccessibleName,
  isVisibleToScreenReader,
  trapFocus,
} from './accessibility';

function keydownTab(target: HTMLElement, options: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
    ...options,
  });
  target.dispatchEvent(event);
  return event;
}

describe('announceToScreenReader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('应该创建 aria-live 公告并在延迟后移除', () => {
    announceToScreenReader('搜索完成，找到 5 个结果', 'assertive');

    const announcement = document.body.querySelector('.sr-only');
    expect(announcement).not.toBeNull();
    expect(announcement?.getAttribute('role')).toBe('status');
    expect(announcement?.getAttribute('aria-live')).toBe('assertive');
    expect(announcement?.getAttribute('aria-atomic')).toBe('true');
    expect(announcement?.textContent).toBe('搜索完成，找到 5 个结果');

    vi.advanceTimersByTime(1000);
    expect(document.body.querySelector('.sr-only')).toBeNull();
  });

  it('默认使用 polite 优先级', () => {
    announceToScreenReader('已保存');

    const announcement = document.body.querySelector('.sr-only');
    expect(announcement?.getAttribute('aria-live')).toBe('polite');
  });
});

describe('trapFocus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('在最后一个可聚焦元素按 Tab 时循环到第一个元素', () => {
    const container = document.createElement('div');
    container.innerHTML = '<button>first</button><input><button>last</button>';
    document.body.appendChild(container);
    const [firstButton, , lastButton] = Array.from(
      container.querySelectorAll<HTMLElement>('button, input')
    );
    const cleanup = trapFocus(container);

    lastButton.focus();
    const event = keydownTab(container);

    expect(document.activeElement).toBe(firstButton);
    expect(event.defaultPrevented).toBe(true);
    cleanup();
  });

  it('在第一个可聚焦元素按 Shift+Tab 时循环到最后一个元素', () => {
    const container = document.createElement('div');
    container.innerHTML = '<button>first</button><input><button>last</button>';
    document.body.appendChild(container);
    const [firstButton, , lastButton] = Array.from(
      container.querySelectorAll<HTMLElement>('button, input')
    );
    const cleanup = trapFocus(container);

    firstButton.focus();
    const event = keydownTab(container, { shiftKey: true });

    expect(document.activeElement).toBe(lastButton);
    expect(event.defaultPrevented).toBe(true);
    cleanup();
  });

  it('清理后不再拦截 Tab 事件', () => {
    const container = document.createElement('div');
    container.innerHTML = '<button>first</button><button>last</button>';
    document.body.appendChild(container);
    const [firstButton, lastButton] = Array.from(
      container.querySelectorAll<HTMLElement>('button')
    );
    const cleanup = trapFocus(container);
    cleanup();

    lastButton.focus();
    const event = keydownTab(container);

    expect(document.activeElement).not.toBe(firstButton);
    expect(event.defaultPrevented).toBe(false);
  });

  it('忽略非 Tab 按键', () => {
    const container = document.createElement('div');
    container.innerHTML = '<button>first</button><button>last</button>';
    document.body.appendChild(container);
    const [firstButton, lastButton] = Array.from(
      container.querySelectorAll<HTMLElement>('button')
    );
    const cleanup = trapFocus(container);

    lastButton.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(event);

    expect(document.activeElement).not.toBe(firstButton);
    expect(event.defaultPrevented).toBe(false);
    cleanup();
  });
});

describe('generateId', () => {
  it('使用默认前缀生成递增 ID', () => {
    const first = generateId();
    const second = generateId();

    expect(first).toMatch(/^a11y-\d+$/);
    expect(second).toMatch(/^a11y-\d+$/);
    expect(Number(second.split('-')[1])).toBe(Number(first.split('-')[1]) + 1);
  });

  it('支持自定义前缀', () => {
    expect(generateId('dialog')).toMatch(/^dialog-\d+$/);
  });
});

describe('isVisibleToScreenReader', () => {
  it('默认认为元素对屏幕阅读器可见', () => {
    const element = document.createElement('button');

    expect(isVisibleToScreenReader(element)).toBe(true);
  });

  it.each([
    [
      'aria-hidden',
      (element: HTMLElement) => element.setAttribute('aria-hidden', 'true'),
    ],
    [
      'hidden attribute',
      (element: HTMLElement) => element.setAttribute('hidden', ''),
    ],
    [
      'display none',
      (element: HTMLElement) => {
        element.style.display = 'none';
      },
    ],
    [
      'visibility hidden',
      (element: HTMLElement) => {
        element.style.visibility = 'hidden';
      },
    ],
  ])('当元素设置 %s 时返回 false', (_name, hide) => {
    const element = document.createElement('span');
    hide(element);

    expect(isVisibleToScreenReader(element)).toBe(false);
  });
});

describe('getAccessibleName', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('优先使用 aria-label 并裁剪空白', () => {
    const element = document.createElement('button');
    element.setAttribute('aria-label', '  保存设置  ');
    element.textContent = 'Save';

    expect(getAccessibleName(element)).toBe('保存设置');
  });

  it('按 aria-labelledby 引用的元素文本生成名称', () => {
    document.body.innerHTML = `
      <span id="dialog-title"> 设置对话框 </span>
      <span id="dialog-count"> 3 项 </span>
      <section aria-labelledby="dialog-title dialog-count">fallback</section>
    `;
    const element = document.querySelector<HTMLElement>('section');

    expect(getAccessibleName(element!)).toBe('设置对话框 3 项');
  });

  it('当 aria-labelledby 引用缺失时回退到元素文本', () => {
    const element = document.createElement('button');
    element.setAttribute('aria-labelledby', 'missing-label');
    element.textContent = '  提交  ';

    expect(getAccessibleName(element)).toBe('提交');
  });
});
