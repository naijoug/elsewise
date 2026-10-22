import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const idioms = JSON.parse(
  readFileSync(new URL('../src/data/idioms.json', import.meta.url))
);
const languages = JSON.parse(
  readFileSync(new URL('../src/data/languages.json', import.meta.url))
);
const base = process.env.GHP_BASE || '/';

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => {
    throw error;
  });
});

test('production entry boots, searches and filters real data', async ({
  page,
}) => {
  const failedAssets = [];
  page.on('response', (response) => {
    if (response.url().includes('/assets/') && !response.ok())
      failedAssets.push(response.url());
  });
  await page.goto('./');
  await expect(page).toHaveTitle('Elsewise · 异曲 - 编程语言对比学习平台');
  await expect(
    page.getByRole('navigation', { name: '主导航' }).getByRole('link', {
      name: 'Elsewise · 异曲',
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: '在新窗口中打开 GitHub', exact: true })
  ).toHaveAttribute('href', 'https://github.com/naijoug/elsewise');
  await expect(
    page.getByRole('heading', { name: '编程习语', exact: true })
  ).toBeVisible();
  const cards = page
    .getByRole('list', { name: '编程习语列表', exact: true })
    .getByRole('article');
  await expect(cards).toHaveCount(idioms.length);
  await page.getByRole('searchbox').fill('数组映射');
  await expect(cards).toHaveCount(1);
  await page
    .getByRole('button', { name: '清除所有搜索和筛选条件', exact: true })
    .click();
  await expect(cards).toHaveCount(idioms.length);
  await page.getByRole('button', { name: '显示筛选面板' }).click();
  await page
    .getByRole('checkbox', { name: '筛选语言：Python', exact: true })
    .check();
  await page
    .getByRole('checkbox', { name: '筛选难度：初级', exact: true })
    .check();
  const filtered = idioms.filter(
    (i) =>
      i.difficulty === 'beginner' &&
      i.implementations.some((x) => x.languageId === 'python')
  );
  await expect(cards).toHaveCount(filtered.length);
  await page.getByRole('searchbox').fill('no-such-idiom-release-test');
  await expect(page.getByText('未找到习语', { exact: true })).toBeVisible();
  expect(failedAssets).toEqual([]);
});

test('detail survives a direct 404 fallback and refresh, with accurate highlighted code', async ({
  page,
}) => {
  const idiom = idioms.find((i) => i.id === 'array-map');
  const response = await page.goto('idiom/array-map');
  expect(response.status()).toBe(404);
  await expect(
    page.getByRole('heading', { name: idiom.title, exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: /选择语言/ }).click();
  await page.getByRole('option', { name: /^PHP / }).click();
  await page.getByRole('option', { name: /^C\+\+ / }).click();
  for (const id of ['javascript', 'python', 'php', 'cpp']) {
    const code = page.locator(`code.language-${id}`);
    await expect(code).toHaveText(
      idiom.implementations.find((i) => i.languageId === id).code
    );
    expect(await code.locator('.token').count()).toBeGreaterThan(0);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /选择语言/ })).toBeFocused();
  await page.reload();
  await expect(page.locator('code.language-php')).toBeVisible();
  await expect(page.locator('code.language-cpp')).toBeVisible();
});

test('favorites persist across reload and can be removed', async ({ page }) => {
  await page.goto('idiom/array-map');
  await page.getByRole('button', { name: '添加收藏', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: '取消收藏', exact: true })
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: '快速链接' })
    .getByRole('link', { name: '我的收藏' })
    .click();
  await expect(page).toHaveURL(new RegExp(`${base}favorites$`));
  await page.getByRole('link', { name: /查看 数组映射 的详细信息/ }).click();
  await page.getByRole('button', { name: '取消收藏', exact: true }).click();
  await page.goto('favorites');
  await expect(
    page.getByRole('link', { name: /查看 数组映射 的详细信息/ })
  ).toHaveCount(0);
});

test('navigation, language directory, legacy route and 404 recovery stay inside the base', async ({
  page,
  isMobile,
}) => {
  await page.goto('./');
  const nav = page.getByRole('navigation', { name: '主导航' });
  if (isMobile) await nav.getByRole('button', { name: '打开主菜单' }).click();
  await nav.getByRole('link', { name: '语言', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '编程语言', exact: true })
  ).toBeVisible();
  const directory = page.getByRole('list', { name: '编程语言目录' });
  await expect(directory.getByRole('link')).toHaveCount(languages.length);
  await directory.getByRole('link', { name: 'Python', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${base}language/python$`));
  await expect(
    page.getByRole('heading', { name: 'Python', exact: true })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Python', exact: true })
  ).toBeVisible();
  const hrefs = await page
    .locator('a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs.every((href) => href.startsWith(base))).toBe(true);
  await page.goto('idioms');
  await expect(
    page.getByRole('heading', { name: '编程习语', exact: true })
  ).toBeVisible();
  await page.goto('not-a-real-page');
  await expect(page.getByRole('heading', { name: '页面未找到' })).toBeVisible();
  await page.getByRole('link', { name: '返回首页', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${base}$`));
  await page.goto('idiom/missing-idiom');
  await page.getByRole('button', { name: '返回首页', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '编程习语', exact: true })
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${base}$`));
});

test('existing ByteBite favorites migrate and stay removed after a reload', async ({
  page,
}) => {
  await page.goto('./');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      'bytebite_preferences',
      JSON.stringify({
        favoriteIdioms: ['array-map'],
        selectedLanguages: ['python', 'rust'],
        theme: 'light',
      })
    );
  });
  await page.goto('idiom/array-map');
  await expect(
    page.getByRole('button', { name: '取消收藏', exact: true })
  ).toBeVisible();
  await expect(page.locator('code.language-python')).toBeVisible();
  await expect(page.locator('code.language-rust')).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('elsewise_preferences'))
    )
  ).toEqual({
    favoriteIdioms: ['array-map'],
    selectedLanguages: ['python', 'rust'],
    theme: 'light',
  });
  await page.getByRole('button', { name: '取消收藏', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: '添加收藏', exact: true })
  ).toBeVisible();
});

test('invalid saved preferences do not crash startup', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'elsewise_preferences',
      JSON.stringify({ favoriteIdioms: null, selectedLanguages: 42 })
    )
  );
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: '编程习语', exact: true })
  ).toBeVisible();
  await page.goto('idiom/array-map');
  await expect(page.locator('code.language-python')).toBeVisible();
});

test('data loading failure offers a working retry', async ({ page }) => {
  await page.route('**/assets/idioms-*.json', (route) =>
    route.fulfill({ status: 503, body: 'Unavailable' })
  );
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: '数据加载失败' })
  ).toBeVisible();
  await page.unroute('**/assets/idioms-*.json');
  await page.getByRole('button', { name: '重试', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '编程习语', exact: true })
  ).toBeVisible();
});

test('every shipped language grammar renders source without losing angle brackets', async ({
  page,
}) => {
  await page.addInitScript(
    (ids) =>
      localStorage.setItem(
        'elsewise_preferences',
        JSON.stringify({ selectedLanguages: ids })
      ),
    languages.map((l) => l.id)
  );
  for (const id of [
    'array-map',
    'null-safety',
    'async-await',
    'builder-pattern',
  ]) {
    const idiom = idioms.find((i) => i.id === id);
    await page.goto(`idiom/${id}`);
    await expect(
      page.getByRole('heading', { name: idiom.title, exact: true })
    ).toBeVisible();
    for (const impl of idiom.implementations) {
      const code = page.locator(`code.language-${impl.languageId}`);
      await expect(code).toHaveText(impl.code);
      expect(await code.locator('.token').count()).toBeGreaterThan(0);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  }
});
