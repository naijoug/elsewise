import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
let host: HTMLDivElement, root: Root;
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.querySelector('.code-grid')?.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function mount(locale: 'zh' | 'en' = 'zh') {
  const { default: Controls } = await import('./DetailControls');
  const grid = document.createElement('div');
  grid.className = 'code-grid';
  grid.innerHTML =
    '<article data-language-card="js"></article><article data-language-card="py"></article><article data-language-card="go"></article>';
  document.body.append(grid);
  await act(async () =>
    root.render(
      <Controls
        idiomId="a"
        locale={locale}
        options={[
          { id: 'js', name: 'JavaScript' },
          { id: 'py', name: 'Python' },
          { id: 'go', name: 'Go' },
        ]}
      />
    )
  );
}
function button(text: string) {
  return [...host.querySelectorAll('button')].find(
    (button) => (button.getAttribute('aria-label') || button.textContent) === text
  )!;
}
it('keeps one visible language and uses full width', async () => {
  await mount();
  act(() => button('Python').click());
  expect(button('JavaScript').disabled).toBe(true);
  expect(
    document.querySelectorAll('[data-language-card]:not([hidden])')
  ).toHaveLength(1);
  expect(
    (document.querySelector('.code-grid') as HTMLElement).dataset.columns
  ).toBe('1');
});
it('searching options preserves selection and clear restores defaults without losing prefs', async () => {
  localStorage.setItem(
    'elsewise_preferences',
    JSON.stringify({
      selectedLanguages: ['go'],
      favoriteIdioms: ['a'],
      theme: 'dark',
    })
  );
  await mount();
  const input = host.querySelector('input')!;
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!.call(input, 'python');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(host.querySelector('[role="group"]')?.textContent).toBe('Python');
  expect(
    document.querySelector('[data-language-card="go"]')?.hasAttribute('hidden')
  ).toBe(false);
  act(() => button('恢复默认').click());
  expect(input.value).toBe('');
  expect(
    document.querySelectorAll('[data-language-card]:not([hidden])')
  ).toHaveLength(2);
  expect(JSON.parse(localStorage.getItem('elsewise_preferences')!)).toEqual({
    selectedLanguages: [],
    favoriteIdioms: ['a'],
    theme: 'dark',
  });
});
it('favorite updates do not overwrite language or theme', async () => {
  localStorage.setItem(
    'elsewise_preferences',
    JSON.stringify({
      selectedLanguages: ['go'],
      favoriteIdioms: [],
      theme: 'dark',
    })
  );
  await mount();
  act(() => button('收藏文档').click());
  expect(JSON.parse(localStorage.getItem('elsewise_preferences')!)).toEqual({
    selectedLanguages: ['go'],
    favoriteIdioms: ['a'],
    theme: 'dark',
  });
});
it('toggles learned independently of favorites and reports temporary saves', async () => {
  await mount();
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="标记学会"]')!.click()
  );
  expect(
    host.querySelector('[aria-label="已学会"]')?.getAttribute('aria-pressed')
  ).toBe('true');
  expect(button('收藏文档').getAttribute('aria-pressed')).toBe('false');
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota');
  });
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="已学会"]')!.click()
  );
  expect(host.textContent).toContain('仅在当前页面有效');
});

it('keeps English comparison, favorites and learning controls free of Chinese text', async () => {
  await mount('en');
  expect(host.querySelector('h2')?.textContent).toBe('Compare languages');
  expect(host.innerHTML).not.toMatch(/[一-鿿]/);
  act(() => button('Favorite').click());
  expect(button('Favorited').getAttribute('aria-pressed')).toBe('true');
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Mark as learned"]')!
      .click()
  );
  expect(
    host.querySelector('[aria-label="Learned"]')?.getAttribute('aria-pressed')
  ).toBe('true');
  act(() => button('Python').click());
  expect(button('JavaScript').disabled).toBe(true);
  expect(host.innerHTML).not.toMatch(/[一-鿿]/);
});

it('collapses the language picker on narrow screens and preserves native disclosure switching', async () => {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  const matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false, addEventListener, removeEventListener });
  vi.stubGlobal('matchMedia', matchMedia);
  await mount();
  const picker = host.querySelector<HTMLDetailsElement>(
    'details.language-picker'
  )!;
  const summary = picker.querySelector('summary')!;
  expect(matchMedia).toHaveBeenCalledWith('(min-width: 850px)');
  expect(picker.open).toBe(false);
  expect(summary.textContent).toContain('选择语言');
  expect(summary.textContent).toContain('JavaScript, Python');
  expect(
    document.querySelectorAll('[data-language-card]:not([hidden])')
  ).toHaveLength(2);
  act(() => summary.click());
  expect(picker.open).toBe(true);
  act(() => button('Python').click());
  act(() => button('Go').click());
  expect(summary.textContent).toContain('JavaScript, Go');
  expect(summary.textContent).not.toContain('Python');
  expect(
    document.querySelector('[data-language-card="py"]')?.hasAttribute('hidden')
  ).toBe(true);
  expect(
    document.querySelector('[data-language-card="go"]')?.hasAttribute('hidden')
  ).toBe(false);
  act(() => summary.click());
  expect(picker.open).toBe(false);
  expect(summary.textContent).toContain('JavaScript, Go');
  expect(
    JSON.parse(localStorage.getItem('elsewise_preferences')!).selectedLanguages
  ).toEqual(['js', 'go']);
});
it('opens the desktop picker and adapts to breakpoint changes without changing selected languages', async () => {
  const media = {
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(media));
  await mount('en');
  const picker = host.querySelector<HTMLDetailsElement>(
    'details.language-picker'
  )!;
  expect(picker.open).toBe(true);
  expect(picker.querySelector('summary')?.textContent).toContain(
    'Choose languages'
  );
  expect(host.innerHTML).not.toMatch(/[\u4e00-\u9fff]/);
  const change = media.addEventListener.mock.calls[0][1] as () => void;
  media.matches = false;
  act(() => change());
  expect(picker.open).toBe(false);
  expect(picker.querySelector('summary')?.textContent).toContain(
    'JavaScript, Python'
  );
  expect(
    document.querySelectorAll('[data-language-card]:not([hidden])')
  ).toHaveLength(2);
  media.matches = true;
  act(() => change());
  expect(picker.open).toBe(true);
});
