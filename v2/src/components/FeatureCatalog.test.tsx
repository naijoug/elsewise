import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import type { FeatureSummary } from '../lib/features';
let root: Root, host: HTMLDivElement;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const features: FeatureSummary[] = [{ id: 'ownership', title: '所有权', description: '资源管理', scope: 'specific', scopeNote: '范围', tags: ['资源'], related: [], idiomIds: [], languageIds: ['rust'], languageNames: ['Rust'] }];
beforeEach(() => { localStorage.clear(); vi.resetModules(); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
async function mount(favoritesOnly = false) {
  const { default: FeatureCatalog } = await import('./FeatureCatalog');
  await act(async () => root.render(<FeatureCatalog features={features} languages={[{id:'rust',name:'Rust'}]} base="/elsewise" favoritesOnly={favoritesOnly} />));
}
it('stores Get separately, supports learned filtering and does not clear it when resetting filters', async () => {
  await mount();
  const get = host.querySelector('.learned-button') as HTMLButtonElement;
  await act(async () => get.click());
  expect(get.getAttribute('aria-pressed')).toBe('true');
  const select = host.querySelectorAll('select')[2];
  await act(async () => { select.value = 'unlearned'; select.dispatchEvent(new Event('change', {bubbles:true})); });
  expect(host.querySelectorAll('article')).toHaveLength(0);
  const reset = [...host.querySelectorAll('button')].find(b => b.textContent === '重置特性筛选')!;
  await act(async () => reset.click());
  expect(host.querySelector('.learned-button')?.getAttribute('aria-pressed')).toBe('true');
  expect(host.querySelector('h2 a')?.getAttribute('href')).toBe('/elsewise/feature/ownership/');
});
it('does not treat a learned feature as a favorite', async () => {
  await mount(true);
  expect(host.querySelectorAll('article')).toHaveLength(0);
});
