import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const idioms = JSON.parse(
  readFileSync(new URL('../src/data/idioms.json', import.meta.url))
);
const languages = JSON.parse(
  readFileSync(new URL('../src/data/languages.json', import.meta.url))
);
const base = (process.env.GHP_BASE || '/').replace(/\/$/, '') + '/';
const cards = (page) =>
  page.getByRole('list', { name: '编程习语列表' }).getByRole('listitem');
async function hydrated(page) {
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('astro-island[client="load"]')).every(
      (island) => !island.hasAttribute('ssr')
    )
  );
}
async function open(page, path = './') {
  const response = await page.goto(path);
  await hydrated(page);
  return response;
}
test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => {
    throw error;
  });
});

test('static entry has no full content or highlighter payload; search and combined filters work', async ({
  page,
}) => {
  const requests = [];
  const failures = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('response', (response) => {
    if (response.url().includes('/_astro/') && !response.ok())
      failures.push(response.url());
  });
  const response = await open(page);
  expect(response.status()).toBe(200);
  await expect(page).toHaveTitle('编程习语 · Elsewise · 异曲');
  await expect(cards(page)).toHaveCount(idioms.length);
  await expect(
    page.getByRole('link', { name: 'Elsewise · 异曲', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: '在新窗口中打开 GitHub' })
  ).toHaveAttribute('href', 'https://github.com/naijoug/elsewise');
  expect(
    requests.some((url) =>
      /search-index|idioms.*\.json|prism|highlighter/i.test(url)
    )
  ).toBe(false);
  const initialHTML = await response.text();
  expect(initialHTML).not.toContain('&quot;implementations&quot;');
  expect(initialHTML).not.toContain('code-array-map-javascript');
  await page.getByRole('searchbox', { name: '搜索习语' }).fill('数组映射');
  await expect(cards(page)).toHaveCount(1);
  await expect(
    page.getByText('正在加载代码搜索索引，先显示摘要匹配…')
  ).toHaveCount(0);
  expect(requests.some((url) => url.endsWith('/search-index.json'))).toBe(true);
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(cards(page)).toHaveCount(idioms.length);
  await page.locator('.filter-panel summary').click();
  await page.getByRole('checkbox', { name: 'Python', exact: true }).check();
  await page.getByRole('checkbox', { name: '初级', exact: true }).check();
  const expected = idioms.filter(
    (item) =>
      item.difficulty === 'beginner' &&
      item.implementations.some((impl) => impl.languageId === 'python')
  );
  await expect(cards(page)).toHaveCount(expected.length);
  await page
    .getByRole('searchbox', { name: '搜索习语' })
    .fill('no-such-idiom-release-test');
  await expect(cards(page)).toHaveCount(0);
  await expect(
    page.getByText('没有匹配结果。试试清空条件，或换一个关键词。')
  ).toBeVisible();
  expect(failures).toEqual([]);
});

test('search index failure preserves summaries and retry restores code search', async ({
  page,
}) => {
  await page.route('**/search-index.json', (route) =>
    route.fulfill({ status: 503, body: 'Unavailable' })
  );
  await open(page);
  await expect(cards(page)).toHaveCount(idioms.length);
  const term = 'numbers.map(n => n * 2)';
  await page.getByRole('searchbox', { name: '搜索习语' }).fill(term);
  await expect(page.getByRole('alert')).toContainText('代码搜索暂不可用');
  await page.unroute('**/search-index.json');
  await page.getByRole('button', { name: '重试', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(cards(page).filter({ hasText: '数组映射' })).toHaveCount(1);
  await expect(page.getByLabel('搜索命中').first()).toContainText('代码');
});

test('detail is direct HTTP 200, pre-highlighted source survives refresh and multiple language selection', async ({
  page,
}) => {
  const idiom = idioms.find((item) => item.id === 'array-map');
  const response = await open(page, 'idiom/array-map/');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('code-array-map-javascript');
  await expect(
    page.getByRole('heading', { name: idiom.title, exact: true })
  ).toBeVisible();
  for (const name of ['PHP', 'C++'])
    await page.getByRole('button', { name, exact: true }).click();
  for (const id of ['javascript', 'python', 'php', 'cpp']) {
    const code = page.locator(`#code-array-map-${id}`);
    await expect(code).toBeVisible();
    expect(await code.textContent()).toBe(
      idiom.implementations.find((impl) => impl.languageId === id).code
    );
    expect(await code.locator('.token').count()).toBeGreaterThan(0);
  }
  await page.reload();
  await hydrated(page);
  await expect(page.locator('#code-array-map-php')).toBeVisible();
  await expect(page.locator('#code-array-map-cpp')).toBeVisible();
});

test('favorites persist, appear in their dedicated scope, and stay removed', async ({
  page,
}) => {
  await open(page, 'idiom/array-map/');
  await page.getByRole('button', { name: '☆ 收藏习语', exact: true }).click();
  await page.reload();
  await hydrated(page);
  await expect(
    page.getByRole('button', { name: '★ 已收藏', exact: true })
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '收藏', exact: true })
    .click();
  await hydrated(page);
  expect(new URL(page.url()).pathname).toBe(`${base}favorites/`);
  await expect(cards(page)).toHaveCount(1);
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(cards(page)).toHaveCount(1);
  await cards(page)
    .getByRole('link', { name: /数组映射/ })
    .click();
  await hydrated(page);
  await page.getByRole('button', { name: '★ 已收藏', exact: true }).click();
  await open(page, 'favorites/');
  await expect(cards(page)).toHaveCount(0);
});

test('language directory, deep links, legacy query/hash redirect and 404 stay inside base', async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '语言', exact: true })
    .click();
  await hydrated(page);
  await expect(page.locator('.language-list > li')).toHaveCount(
    languages.length
  );
  await page
    .locator('.language-list')
    .getByRole('link', { name: 'Python', exact: true })
    .click();
  await hydrated(page);
  expect(new URL(page.url()).pathname).toBe(`${base}language/python/`);
  await expect(
    page.getByRole('heading', { name: 'Python', exact: true })
  ).toBeVisible();
  expect((await page.reload()).status()).toBe(200);
  await hydrated(page);
  await expect(cards(page)).toHaveCount(
    idioms.filter((item) =>
      item.implementations.some((impl) => impl.languageId === 'python')
    ).length
  );
  const hrefs = await page
    .locator('a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs.every((href) => href.startsWith(base))).toBe(true);
  await open(page, 'idioms/?q=python#saved');
  await expect.poll(() => new URL(page.url()).pathname).toBe(base);
  expect(new URL(page.url()).search).toBe('?q=python');
  expect(new URL(page.url()).hash).toBe('#saved');
  for (const missing of ['not-a-real-page', 'idiom/missing-idiom/']) {
    const response = await open(page, missing);
    expect(response.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: '这个页面暂时找不到。' })
    ).toBeVisible();
    await page.getByRole('link', { name: '浏览习语', exact: true }).click();
    await hydrated(page);
    expect(new URL(page.url()).pathname).toBe(base);
  }
});

test('ByteBite preferences migrate without losing legacy data or resurrecting removed favorites', async ({
  page,
}) => {
  await open(page);
  const legacy = {
    favoriteIdioms: ['array-map'],
    selectedLanguages: ['python', 'rust'],
    theme: 'dark',
  };
  await page.evaluate((value) => {
    localStorage.clear();
    localStorage.setItem('bytebite_preferences', JSON.stringify(value));
  }, legacy);
  await open(page, 'idiom/array-map/');
  await expect(
    page.getByRole('button', { name: '★ 已收藏', exact: true })
  ).toBeVisible();
  await expect(page.locator('#code-array-map-python')).toBeVisible();
  await expect(page.locator('#code-array-map-rust')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('elsewise_preferences'))
    )
  ).toEqual(legacy);
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bytebite_preferences'))
    )
  ).toEqual(legacy);
  await page.getByRole('button', { name: '★ 已收藏', exact: true }).click();
  await page.reload();
  await hydrated(page);
  await expect(
    page.getByRole('button', { name: '☆ 收藏习语', exact: true })
  ).toBeVisible();
});

test('invalid saved preferences do not crash static pages or hydration', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'elsewise_preferences',
      JSON.stringify({ favoriteIdioms: null, selectedLanguages: 42 })
    )
  );
  await open(page);
  await expect(cards(page)).toHaveCount(idioms.length);
  await open(page, 'idiom/array-map/');
  await expect(page.locator('#code-array-map-python')).toBeVisible();
});

test('dark and light stay synchronized through back navigation and reload', async ({
  page,
}) => {
  await open(page);
  await page.getByRole('button', { name: '切换明暗主题' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await cards(page).first().getByRole('link').click();
  await hydrated(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: '切换明暗主题' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.goBack();
  await hydrated(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await hydrated(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('copy sends exact visible source to the clipboard', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, 'idiom/array-map/');
  const implementation = page.locator('[data-language-card="javascript"]');
  await implementation
    .getByRole('button', { name: '复制代码', exact: true })
    .click();
  const expected = idioms
    .find((item) => item.id === 'array-map')
    .implementations.find((impl) => impl.languageId === 'javascript').code;
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(expected);
});

test('every shipped implementation preserves exact highlighted source and mobile width', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.addInitScript(
    (ids) =>
      localStorage.setItem(
        'elsewise_preferences',
        JSON.stringify({ selectedLanguages: ids })
      ),
    languages.map((language) => language.id)
  );
  for (const idiom of idioms) {
    await open(page, `idiom/${idiom.id}/`);
    await expect(
      page.getByRole('heading', { name: idiom.title, exact: true })
    ).toBeVisible();
    for (const impl of idiom.implementations) {
      const code = page.locator(`#code-${idiom.id}-${impl.languageId}`);
      await expect(code).toBeVisible();
      expect(await code.textContent()).toBe(impl.code);
      expect(await code.locator('.token').count()).toBeGreaterThan(0);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  }
});

test('without JavaScript, complete detail source and links remain available', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const response = await page.goto(new URL('idiom/array-map/', baseURL).href);
    expect(response.status()).toBe(200);
    const idiom = idioms.find((item) => item.id === 'array-map');
    await expect(
      page.getByRole('heading', { name: idiom.title, exact: true })
    ).toBeVisible();
    for (const impl of idiom.implementations) {
      const code = page.locator(`#code-${idiom.id}-${impl.languageId}`);
      await expect(code).toBeVisible();
      expect(await code.textContent()).toBe(impl.code);
    }
    await page.getByRole('link', { name: '← 全部习语', exact: true }).click();
    await expect(cards(page)).toHaveCount(idioms.length);
  } finally {
    await context.close();
  }
});

test('Get marks are separate, persist across detail navigation/reload, and compose with filters', async ({
  page,
}) => {
  await open(page);
  const first = cards(page).first();
  const title = await first.getByRole('heading').innerText();
  await first.getByRole('button', { name: `标记已学会：${title}` }).click();
  await expect(
    first.getByRole('button', { name: `撤销已学会：${title}` })
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '已学会', exact: true }).click();
  await expect(cards(page)).toHaveCount(1);
  await cards(page).first().getByRole('link').click();
  await hydrated(page);
  await expect(
    page.getByRole('button', { name: '撤销已学会', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: '☆ 收藏习语' })
  ).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await hydrated(page);
  await expect(
    page.getByRole('button', { name: '撤销已学会', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: '撤销已学会', exact: true }).click();
  await page.goBack();
  await hydrated(page);
  await page.getByRole('button', { name: '已学会', exact: true }).click();
  await expect(cards(page)).toHaveCount(0);
  await page.getByRole('button', { name: '未学会', exact: true }).click();
  await expect(cards(page)).toHaveCount(idioms.length);
  await page.getByRole('button', { name: '只看收藏', exact: true }).click();
  await expect(cards(page)).toHaveCount(0);
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(cards(page)).toHaveCount(idioms.length);
});

test('learned state synchronizes another tab and ignores malformed data without affecting favorites', async ({
  page,
  context,
}) => {
  await open(page, './idiom/array-map/');
  await page.evaluate(() => {
    localStorage.setItem('elsewise_learned_v1', '{bad');
  });
  await page.reload();
  await hydrated(page);
  await expect(
    page.getByText('已保存的学习记录格式异常', { exact: false })
  ).toBeVisible();
  const second = await context.newPage();
  await open(second);
  await second.getByRole('button', { name: '已学会', exact: true }).click();
  await expect(cards(second)).toHaveCount(0);
  await page.getByRole('button', { name: '标记已学会', exact: true }).click();
  await expect(cards(second)).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: '☆ 收藏习语' })
  ).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: '撤销已学会', exact: true }).click();
  await expect(cards(second)).toHaveCount(0);
  await second.close();
});
