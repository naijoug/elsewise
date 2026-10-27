import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import type { FeatureSummary } from '../lib/features';
let root: Root, host: HTMLDivElement;
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
const features: FeatureSummary[] = [
  {
    id: 'ownership',
    title: '所有权',
    description: '资源管理',
    scope: 'specific',
    scopeNote: '范围',
    tags: ['资源'],
    related: [],
    idiomIds: [],
    languageIds: ['rust'],
    languageNames: ['Rust'],
  },
];
beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
async function mount(favoritesOnly = false, locale: 'zh' | 'en' = 'zh') {
  const { default: FeatureCatalog } = await import('./FeatureCatalog');
  await act(async () =>
    root.render(
      <FeatureCatalog
        features={
          locale === 'en'
            ? features.map((item) => ({
                ...item,
                title: 'Ownership',
                description: 'Resource management',
                scopeNote: 'Scope',
                tags: ['Resources'],
              }))
            : features
        }
        locale={locale}
        languages={[{ id: 'rust', name: 'Rust' }]}
        base="/elsewise"
        favoritesOnly={favoritesOnly}
      />
    )
  );
}
it('stores learning progress separately, supports learned filtering and does not clear it when resetting filters', async () => {
  await mount();
  const get = host.querySelector('.learned-button') as HTMLButtonElement;
  await act(async () => get.click());
  expect(get.getAttribute('aria-pressed')).toBe('true');
  const select = host.querySelector(
    'select[aria-label="学习状态"]'
  ) as HTMLSelectElement;
  expect(select).not.toBeNull();
  await act(async () => {
    select.value = 'unlearned';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(host.querySelectorAll('article')).toHaveLength(0);
  const reset = [...host.querySelectorAll('button')].find(
    (b) => b.textContent === '重置筛选'
  )!;
  await act(async () => reset.click());
  expect(
    host.querySelector('.learned-button')?.getAttribute('aria-pressed')
  ).toBe('true');
  expect(host.querySelector('h2 a')?.getAttribute('href')).toBe(
    '/elsewise/feature/ownership/'
  );
});
it('does not treat a learned feature as a favorite', async () => {
  await mount(true);
  expect(host.querySelectorAll('article')).toHaveLength(0);
});

it('shows documents without scope filters or badges and supports English search', async () => {
  await mount(false, 'en');
  expect(host.querySelector('section')?.getAttribute('aria-label')).toBe(
    'Documents'
  );
  expect(host.querySelectorAll('select')).toHaveLength(2);
  expect(host.innerHTML).not.toMatch(/[一-鿿]/);
  expect(host.textContent).not.toContain('specific');
  const search = host.querySelector('input')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!.call(search, 'missing');
    search.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(host.querySelectorAll('article')).toHaveLength(0);
  expect(host.textContent).toContain('No matching documents');
  await act(async () =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Reset filters')!
      .click()
  );
  expect(host.querySelectorAll('article')).toHaveLength(1);
});
it('retains favorite filtering independently of learned document state', async () => {
  localStorage.setItem(
    'elsewise_preferences',
    JSON.stringify({
      favoriteIdioms: ['feature:ownership'],
      selectedLanguages: [],
      theme: 'light',
    })
  );
  await mount(true, 'en');
  expect(host.querySelectorAll('article')).toHaveLength(1);
  await act(async () =>
    host.querySelector<HTMLButtonElement>('.learned-button')!.click()
  );
  expect(host.querySelectorAll('article')).toHaveLength(1);
  expect(
    JSON.parse(localStorage.getItem('elsewise_preferences')!).favoriteIdioms
  ).toEqual(['feature:ownership']);
});
