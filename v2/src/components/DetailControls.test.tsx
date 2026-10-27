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
});
async function mount() {
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
    (button) => button.textContent === text
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
  act(() => button('清空选择（恢复默认）').click());
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
  act(() => button('☆ 收藏习语').click());
  expect(JSON.parse(localStorage.getItem('elsewise_preferences')!)).toEqual({
    selectedLanguages: ['go'],
    favoriteIdioms: ['a'],
    theme: 'dark',
  });
});
it('toggles learned independently of favorites and reports temporary saves', async () => {
  await mount();
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="标记已学会"]')!.click()
  );
  expect(
    host
      .querySelector('[aria-label="撤销已学会"]')
      ?.getAttribute('aria-pressed')
  ).toBe('true');
  expect(button('☆ 收藏习语').getAttribute('aria-pressed')).toBe('false');
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota');
  });
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="撤销已学会"]')!.click()
  );
  expect(host.textContent).toContain('仅在当前页面有效');
});
