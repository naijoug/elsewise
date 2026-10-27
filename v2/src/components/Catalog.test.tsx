import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import type { Summary } from '../lib/catalog';
let root: Root, host: HTMLDivElement;
const summaries: Summary[] = [
  {
    id: 'a',
    title: 'Alpha',
    description: 'first',
    category: '基础',
    difficulty: 'beginner',
    paradigms: ['函数式'],
    tags: ['tag'],
    languageIds: ['js'],
  },
  {
    id: 'b',
    title: 'Beta',
    description: 'second',
    category: '高级',
    difficulty: 'advanced',
    paradigms: ['面向对象'],
    tags: [],
    languageIds: ['py'],
  },
];
const fields = () =>
  ({
    title: [],
    description: [],
    category: [],
    tags: [],
    languages: [],
    code: [],
    explanation: [],
  }) as Record<string, string[]>;
const index = [
  { id: 'a', fields: { ...fields(), title: ['alpha'], code: ['fmt.println'] } },
];
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function mount(favorites = false, base = '/elsewise') {
  const { default: Catalog } = await import('./Catalog');
  await act(async () =>
    root.render(
      <Catalog
        summaries={summaries}
        languages={[
          { id: 'js', name: 'JavaScript' },
          { id: 'py', name: 'Python' },
        ]}
        base={base}
        initialFavoritesOnly={favorites}
      />
    )
  );
}
function button(text: string) {
  return [...host.querySelectorAll('button')].find(
    (button) => button.textContent === text
  )!;
}
async function type(query: string) {
  await act(async () => {
    const input = host.querySelector('input[type=search]')!;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!.call(input, query);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
it('ships summaries without fetching search data before input', async () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  await mount();
  expect(fetch).not.toHaveBeenCalled();
  expect(host.querySelector('article a')?.getAttribute('href')).toBe(
    '/elsewise/idiom/a/'
  );
});
it('favorites remain scoped after reset with legacy preferences', async () => {
  localStorage.setItem(
    'bytebite_preferences',
    JSON.stringify({
      favoriteIdioms: ['a'],
      selectedLanguages: ['py'],
      theme: 'dark',
    })
  );
  await mount(true);
  act(() => button('重置').click());
  expect(host.querySelectorAll('article')).toHaveLength(1);
  expect(host.querySelector('article')?.textContent).toContain('Alpha');
  expect(button('只看收藏').disabled).toBe(true);
});
it('checkbox selection and removable chips change results', async () => {
  await mount();
  const label = [...host.querySelectorAll('label')].find(
    (label) => label.textContent === '基础'
  )!;
  act(() => (label.querySelector('input') as HTMLInputElement).click());
  expect(host.querySelectorAll('article')).toHaveLength(1);
  act(() =>
    (
      host.querySelector('[aria-label="移除分类：基础"]') as HTMLButtonElement
    ).click()
  );
  expect(host.querySelectorAll('article')).toHaveLength(2);
});
it('fetches on query using base and explains exact code match', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => index });
  vi.stubGlobal('fetch', fetch);
  await mount();
  await type('fmt.println');
  expect(fetch).toHaveBeenCalledWith(
    '/elsewise/search-index.json',
    expect.any(Object)
  );
  expect(host.querySelectorAll('article')).toHaveLength(1);
  expect(host.querySelector('[aria-label="搜索命中"]')?.textContent).toBe(
    '命中：代码'
  );
  await type('alpha');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(host.querySelector('[aria-label="搜索命中"]')?.textContent).toBe(
    '命中：标题'
  );
  await type('');
  expect(host.querySelector('[aria-label="搜索命中"]')).toBeNull();
});
it('does not fetch whitespace; supports root base', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => index });
  vi.stubGlobal('fetch', fetch);
  await mount(false, '');
  await type('  ');
  expect(fetch).not.toHaveBeenCalled();
  await type('alpha');
  expect(fetch.mock.calls[0][0]).toBe('/search-index.json');
});
it('HTTP failure preserves summary matching and retry recovers', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({ ok: true, json: async () => index });
  vi.stubGlobal('fetch', fetch);
  await mount();
  await type('alpha');
  expect(host.querySelector('[role=alert]')).not.toBeNull();
  expect(host.querySelectorAll('article')).toHaveLength(1);
  await act(async () => button('重试').click());
  expect(host.querySelector('[role=alert]')).toBeNull();
  expect(host.querySelector('[aria-label="搜索命中"]')?.textContent).toBe(
    '命中：标题'
  );
});
it('clearing a failed search clears the old error', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  await mount();
  await type('alpha');
  expect(host.querySelector('[role=alert]')).not.toBeNull();
  await type('');
  expect(host.querySelector('[role=alert]')).toBeNull();
  expect(host.querySelectorAll('article')).toHaveLength(2);
});
it('rejects malformed search index instead of crashing', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'a', text: 'old schema' }],
    })
  );
  await mount();
  await type('alpha');
  expect(host.querySelector('[role=alert]')).not.toBeNull();
  expect(host.querySelectorAll('article')).toHaveLength(1);
});
for (const [field, label] of [
  ['title', '标题'],
  ['description', '描述'],
  ['category', '分类'],
  ['tags', '标签'],
  ['languages', '语言'],
  ['code', '代码'],
  ['explanation', '说明'],
])
  it(`labels ${field} accurately`, async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 'a', fields: { ...fields(), [field]: ['needle'] } },
        ],
      })
    );
    await mount();
    await type('needle');
    expect(host.querySelector('[aria-label="搜索命中"]')?.textContent).toBe(
      `命中：${label}`
    );
  });
it('matches raw mixed-case code and language labels from the index', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'a',
          fields: {
            ...fields(),
            code: ['fmt.Println(values)'],
            languages: ['JavaScript'],
          },
        },
      ],
    })
  );
  await mount();
  await type('fmt.println');
  expect(host.querySelectorAll('article')).toHaveLength(1);
  expect(host.querySelector('[aria-label="搜索命中"]')?.textContent).toBe(
    '命中：代码'
  );
  await type('javascript');
  expect(host.querySelectorAll('article')).toHaveLength(1);
  expect(host.querySelector('[aria-label="搜索命中"]')?.textContent).toBe(
    '命中：语言'
  );
});
it('marks knowledge points and intersects learned with favorites; reset never deletes progress', async () => {
  localStorage.setItem(
    'elsewise_preferences',
    JSON.stringify({
      favoriteIdioms: ['a'],
      selectedLanguages: [],
      theme: 'light',
    })
  );
  await mount(true);
  const mark = host.querySelector<HTMLButtonElement>(
    '[aria-label="标记已学会：Alpha"]'
  )!;
  act(() => mark.click());
  expect(
    host
      .querySelector('[aria-label="撤销已学会：Alpha"]')
      ?.getAttribute('aria-pressed')
  ).toBe('true');
  act(() => button('未学会').click());
  expect(host.querySelectorAll('[role=listitem]')).toHaveLength(0);
  act(() => button('已学会').click());
  expect(host.querySelectorAll('[role=listitem]')).toHaveLength(1);
  act(() => button('重置').click());
  expect(button('全部').getAttribute('aria-pressed')).toBe('true');
  expect(host.querySelectorAll('[role=listitem]')).toHaveLength(1);
  expect(JSON.parse(localStorage.getItem('elsewise_learned_v1')!).ids).toEqual([
    'a',
  ]);
});
