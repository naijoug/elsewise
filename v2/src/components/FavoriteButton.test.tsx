import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
let host: HTMLDivElement, root: Root;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => {
  localStorage.clear(); vi.resetModules();
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });
it('saves and unsaves the canonical topic across locales without touching learning', async () => {
  const learned = JSON.stringify({ version: 1, ids: ['closure'] });
  localStorage.setItem('elsewise_learned_v1', learned);
  const { default: FavoriteButton } = await import('./FavoriteButton');
  await act(async () => root.render(<FavoriteButton id="feature:closures" title="闭包" />));
  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('收藏: 闭包');
  await act(async () => host.querySelector('button')!.click());
  expect(host.querySelector('button')?.getAttribute('aria-pressed')).toBe('true');
  expect(JSON.parse(localStorage.getItem('elsewise_preferences')!).favoriteIdioms).toEqual(['feature:closures']);
  await act(async () => root.render(<FavoriteButton id="closure" title="Closures" locale="en" />));
  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('Unsave: Closures');
  expect(host.innerHTML).not.toMatch(/[\u4e00-\u9fff]/);
  await act(async () => host.querySelector('button')!.click());
  expect(JSON.parse(localStorage.getItem('elsewise_preferences')!).favoriteIdioms).toEqual([]);
  expect(localStorage.getItem('elsewise_learned_v1')).toBe(learned);
});
