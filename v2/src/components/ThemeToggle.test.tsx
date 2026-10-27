import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
let root: Root, host: HTMLDivElement;
const saved = {
  favoriteIdioms: ['array-map'],
  selectedLanguages: ['python', 'go'],
  theme: 'dark',
};
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  vi.resetModules();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  delete document.documentElement.dataset.theme;
  localStorage.clear();
  vi.restoreAllMocks();
});
async function mount() {
  const { default: ThemeToggle } = await import('./ThemeToggle');
  await act(async () => root.render(<ThemeToggle />));
}
const write = (theme = 'dark') =>
  localStorage.setItem(
    'elsewise_preferences',
    JSON.stringify({ ...saved, theme })
  );
const button = () =>
  host.querySelector<HTMLButtonElement>('[aria-label="切换明暗主题"]')!;
it('sets stored dark theme and pressed state', async () => {
  write();
  await mount();
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(button().getAttribute('aria-pressed')).toBe('true');
});
it('toggles without dropping favorites and languages', async () => {
  write();
  await mount();
  act(() => button().click());
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(JSON.parse(localStorage.getItem('elsewise_preferences')!)).toEqual({
    ...saved,
    theme: 'light',
  });
  act(() => button().click());
  expect(JSON.parse(localStorage.getItem('elsewise_preferences')!)).toEqual(
    saved
  );
});
it('refreshes document theme from a storage event', async () => {
  write();
  await mount();
  write('light');
  act(() =>
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'elsewise_preferences' })
    )
  );
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(button().getAttribute('aria-pressed')).toBe('false');
});
it('refreshes document theme on pageshow', async () => {
  write('light');
  await mount();
  write('dark');
  act(() => window.dispatchEvent(new Event('pageshow')));
  expect(document.documentElement.dataset.theme).toBe('dark');
});
