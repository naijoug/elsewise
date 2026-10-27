import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const idioms = JSON.parse(
  readFileSync(new URL('../src/data/idioms.json', import.meta.url))
);
const languages = JSON.parse(
  readFileSync(new URL('../src/data/languages.json', import.meta.url))
);
const practical = JSON.parse(
  readFileSync(new URL('../v2/src/data/practical-docs.json', import.meta.url))
);
const conceptual = JSON.parse(
  readFileSync(new URL('../v2/src/data/features.json', import.meta.url))
);
const foundations = JSON.parse(
  readFileSync(new URL('../v2/src/data/foundations.json', import.meta.url))
);
const documents = [...foundations, ...practical, ...conceptual];
const english = JSON.parse(
  readFileSync(new URL('../v2/src/data/english-content.json', import.meta.url))
);
const learningFilter = (page, name) =>
  page
    .getByRole('group', { name: '学习状态', exact: true })
    .getByRole('button', { name, exact: true });
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
async function expandLanguagePicker(page) {
  const picker = page.locator('details.language-picker');
  // Desktop keeps the picker open and hides its disclosure summary.
  // Only a closed picker needs the visible mobile disclosure control.
  if (!(await picker.evaluate((element) => element.open))) {
    await expect(picker.locator('summary')).toBeVisible();
    await picker.locator('summary').click();
  }
  await expect(picker).toHaveAttribute('open', '');
  const availableLanguage = picker
    .locator('.language-options button:not([disabled])')
    .first();
  await expect(availableLanguage).toBeVisible();
  await expect(availableLanguage).toBeEnabled();
  return picker;
}

async function open(page, path = 'idioms/') {
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
  await expect(page).toHaveTitle('模式与习语 · 异曲');
  await expect(cards(page)).toHaveCount(idioms.length);
  await expect(
    page.getByRole('link', { name: '异曲', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'GitHub（新窗口）' })
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

test('delayed code index keeps summaries usable and resolves the latest search', async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/search-index.json', async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await open(page);
    const search = page.getByRole('searchbox', { name: '搜索习语' });
    await search.fill('数组映射');
    await expect(cards(page)).toHaveCount(1);
    await expect(
      page.getByText('正在加载代码搜索索引，先显示摘要匹配…')
    ).toBeVisible();
    await search.fill('no-such-idiom-while-index-pending');
    await expect(cards(page)).toHaveCount(0);
    release();
    await expect(
      page.getByText('正在加载代码搜索索引，先显示摘要匹配…')
    ).toHaveCount(0);
    await expect(cards(page)).toHaveCount(0);
    await search.fill('numbers.map(n => n * 2)');
    await expect(cards(page).filter({ hasText: '数组映射' })).toHaveCount(1);
    await expect(page.getByLabel('搜索命中').first()).toContainText('代码');
  } finally {
    release();
  }
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
  await expandLanguagePicker(page);
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
  await page.getByRole('button', { name: '☆ 收藏文档', exact: true }).click();
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

test('language directory, deep links, direct catalog query/hash and 404 stay inside base', async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '语言', exact: true })
    .click();
  await hydrated(page);
  await expect(page.locator('.language-directory > li')).toHaveCount(
    languages.length
  );
  await page
    .locator('.language-directory')
    .getByRole('link', { name: /^Python/ })
    .click();
  await hydrated(page);
  expect(new URL(page.url()).pathname).toBe(`${base}language/python/`);
  await expect(
    page.getByRole('heading', { name: 'Python', exact: true })
  ).toBeVisible();
  expect((await page.reload()).status()).toBe(200);
  await hydrated(page);
  await page.locator('.language-reference summary').click();
  await expect(page.locator('.language-reference')).toContainText(
    languages.find((item) => item.id === 'python').version
  );
  await expect(page.locator('.language-reference')).toContainText(
    '资料记录版本'
  );
  await expect(cards(page)).toHaveCount(
    idioms.filter((item) =>
      item.implementations.some((impl) => impl.languageId === 'python')
    ).length
  );
  const hrefs = await page
    .locator('a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs.every((href) => href.startsWith(base))).toBe(true);
  const catalogResponse = await open(page, 'idioms/?q=python#saved');
  expect(catalogResponse.status()).toBe(200);
  await expect.poll(() => new URL(page.url()).pathname).toBe(`${base}idioms/`);
  await expect(cards(page)).toHaveCount(idioms.length);
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
    expect(new URL(page.url()).pathname).toBe(`${base}idioms/`);
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
    page.getByRole('button', { name: '☆ 收藏文档', exact: true })
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
  await page.setViewportSize({ width: 375, height: 812 });
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
    await page.getByRole('link', { name: '← 模式与习语', exact: true }).click();
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
  await first.getByRole('button', { name: `标记学会: ${title}` }).click();
  await expect(
    first.getByRole('button', { name: `已学会: ${title}` })
  ).toHaveAttribute('aria-pressed', 'true');
  await learningFilter(page, '已学会').click();
  await expect(cards(page)).toHaveCount(1);
  await cards(page).first().getByRole('link').click();
  await hydrated(page);
  await expect(
    page.getByRole('button', { name: '已学会', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: '☆ 收藏文档' })
  ).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await hydrated(page);
  await expect(
    page.getByRole('button', { name: '已学会', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: '已学会', exact: true }).click();
  await page.goBack();
  await hydrated(page);
  await learningFilter(page, '已学会').click();
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
  await learningFilter(second, '已学会').click();
  await expect(cards(second)).toHaveCount(0);
  await page.getByRole('button', { name: '标记学会', exact: true }).click();
  await expect(cards(second)).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: '☆ 收藏文档' })
  ).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: '已学会', exact: true }).click();
  await expect(cards(second)).toHaveCount(0);
  await second.close();
});

test('documents retain learning/favorites, related idioms and language navigation', async ({
  page,
}) => {
  await open(page, 'features/');
  await expect(page.locator('.docs-directory [data-doc-row]')).toHaveCount(
    documents.length
  );
  await page.getByLabel('查找任务或功能模块').fill('所有权');
  await expect(page.locator('[data-doc-row]:visible')).toHaveCount(1);
  await page.locator('[data-doc-row]:visible').getByRole('link').click();
  await hydrated(page);
  await expect(
    page.getByRole('heading', { name: 'Rust 所有权', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: '标记学会', exact: true }).click();
  await page.getByRole('button', { name: '☆ 收藏文档', exact: true }).click();
  await open(page, 'favorites/');
  const savedDocuments = page.getByRole('region', {
    name: '文档',
    exact: true,
  });
  await expect(
    savedDocuments.getByRole('link', { name: 'Rust 所有权', exact: true })
  ).toBeVisible();
  await savedDocuments
    .getByLabel('学习状态', { exact: true })
    .selectOption('learned');
  await expect(savedDocuments.locator('.result-count')).toHaveText('1 篇文档');
  await savedDocuments
    .getByLabel('对比语言', { exact: true })
    .selectOption('rust');
  await expect(savedDocuments.locator('.result-count')).toHaveText('1 篇文档');
  await savedDocuments
    .getByLabel('学习状态', { exact: true })
    .selectOption('unlearned');
  await expect(savedDocuments.locator('.result-count')).toHaveText('0 篇文档');
  await savedDocuments.getByRole('button', { name: '重置筛选' }).click();
  await expect(savedDocuments.locator('.result-count')).toHaveText('1 篇文档');
  await open(page, 'feature/polymorphism/');
  await expandLanguagePicker(page);
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(page.locator('[data-language-card="go"]')).toBeVisible();
  await expect(
    page
      .locator('.related-docs')
      .getByRole('link', { name: '依赖注入', exact: true })
  ).toBeVisible();
  await open(page, 'language/rust/');
  // Language-directory links include the document title AND its summary.
  const ownershipLink = page.locator(
    '.docs-directory a[href$="/feature/rust-ownership/"]'
  );
  await expect(ownershipLink).toBeVisible();
  await expect(ownershipLink).toContainText('Rust 所有权');
  await ownershipLink.click();
  await hydrated(page);
  expect(new URL(page.url()).pathname).toBe(`${base}feature/rust-ownership/`);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Rust 所有权', exact: true })
  ).toBeVisible();
});

async function expectNoHorizontalOverflow(page, expectedWidth = 375) {
  expect(
    await page.evaluate(() => ({
      viewport: window.innerWidth,
      width: document.documentElement.scrollWidth,
    }))
  ).toEqual({ viewport: expectedWidth, width: expectedWidth });
}

async function expectEnglishProse(page) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  // UTF-8 demonstration strings intentionally contain non-English characters.
  // Exclude code samples and the Chinese locale link, never explanatory prose.
  const prose = await page.locator('body').evaluate((body) => {
    const copy = body.cloneNode(true);
    copy
      .querySelectorAll('pre, code, script, style, .locale-switch')
      .forEach((node) => node.remove());
    return copy.textContent;
  });
  expect(prose).not.toMatch(/\p{Script=Han}/u);
}

test('documentation home is a searchable task workspace, not the idiom catalog', async ({
  page,
}) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const response = await open(page, './');
  expect(response.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: '从基础开始，对照着学。' })
  ).toBeVisible();
  await expect(page.locator('.docs-sidebar')).toBeVisible();
  await expect(page.locator('[data-doc-row]')).toHaveCount(documents.length);
  await expect(cards(page)).toHaveCount(0);
  const query = page.getByLabel('查找任务或功能模块');
  await query.fill('JSON');
  await expect(page.locator('[data-doc-row]:visible')).toHaveCount(1);
  await query.fill('no-such-document-release-test');
  await expect(page.locator('[data-doc-row]:visible')).toHaveCount(0);
  await expect(page.locator('#docs-search-status')).toHaveText(
    '没有匹配文档。'
  );
  await query.fill('');
  await expect(page.locator('[data-doc-row]:visible')).toHaveCount(
    documents.length
  );
  expect(
    requests.some((url) =>
      /search-index|idioms.*\.json|prism|highlighter/i.test(url)
    )
  ).toBe(false);
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '模式与习语', exact: true })
    .click();
  await hydrated(page);
  await expect(cards(page)).toHaveCount(idioms.length);
});

test('all four practical tasks expose twelve sourced implementations in both locales and themes at 375px', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(practical.map((doc) => doc.id).sort()).toEqual([
    'http-get',
    'json',
    'read-text-file',
    'write-text-file',
  ]);
  expect(languages).toHaveLength(12);
  await page.addInitScript(
    (ids) => {
      localStorage.setItem(
        'elsewise_preferences',
        JSON.stringify({ selectedLanguages: ids })
      );
    },
    languages.map((language) => language.id)
  );
  for (const locale of ['zh', 'en']) {
    for (const doc of practical) {
      expect(doc.entries.map((entry) => entry.languageId).sort()).toEqual(
        languages.map((language) => language.id).sort()
      );
      const response = await open(
        page,
        `${locale === 'en' ? 'en/' : ''}feature/${doc.id}/`
      );
      expect(response.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        locale === 'en' ? doc.en.title : doc.title
      );
      await expect(page.locator('[data-language-card]')).toHaveCount(12);
      for (const entry of doc.entries) {
        const localized = locale === 'en' ? { ...entry, ...entry.en } : entry;
        const card = page.locator(`[data-language-card="${entry.languageId}"]`);
        await expect(card).toBeVisible();
        await expect(card.locator('.runtime-label')).toHaveText(
          localized.baseline
        );
        await expect(card).toContainText(localized.summary);
        await expect(card).toContainText(localized.versionNotes);
        const code = card.locator('pre code');
        expect(await code.textContent()).toBe(localized.code);
        expect(await code.locator('.token').count()).toBeGreaterThan(0);
        await card.locator('.source-details summary').click();
        await expect(card.locator('.source-details a')).toHaveCount(
          localized.sources.length
        );
        for (let i = 0; i < localized.sources.length; i++) {
          await expect(
            card.locator('.source-details a').nth(i)
          ).toHaveAttribute('href', localized.sources[i].url);
          await expect(card.locator('.source-details')).toContainText(
            localized.sources[i].checkedAt
          );
        }
      }
      for (const theme of ['light', 'dark']) {
        if ((await page.locator('html').getAttribute('data-theme')) !== theme)
          await page.locator('#theme-toggle').click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expectNoHorizontalOverflow(page);
        if (locale === 'en') await expectEnglishProse(page);
      }
    }
  }
});

test('document language selection and learned/favorite IDs survive Chinese to English navigation and reload', async ({
  page,
}) => {
  await open(page, 'feature/read-text-file/');
  await page.getByRole('button', { name: '标记学会', exact: true }).click();
  await page.getByRole('button', { name: '☆ 收藏文档', exact: true }).click();
  await expandLanguagePicker(page);
  for (const name of ['Rust', 'C++'])
    await page.getByRole('button', { name, exact: true }).click();
  const before = await page
    .locator('[data-language-card]:visible')
    .evaluateAll((cards) =>
      cards.map((card) => card.dataset.languageCard).sort()
    );
  expect(before).toContain('rust');
  expect(before).toContain('cpp');
  await page.getByRole('link', { name: '切换至英文' }).click();
  await hydrated(page);
  expect(new URL(page.url()).pathname).toBe(
    `${base}en/feature/read-text-file/`
  );
  await expect(
    page.getByRole('button', { name: 'Learned', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: '★ Favorited', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await hydrated(page);
  expect(
    await page
      .locator('[data-language-card]:visible')
      .evaluateAll((cards) =>
        cards.map((card) => card.dataset.languageCard).sort()
      )
  ).toEqual(before);
  for (const id of before) {
    await expect(
      page.locator('details.language-picker > summary')
    ).toContainText(languages.find((language) => language.id === id).name);
  }
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('elsewise_learned_v1')).ids
    )
  ).toEqual(['feature:read-text-file']);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('elsewise_preferences')).favoriteIdioms
    )
  ).toEqual(['feature:read-text-file']);
  await page.getByRole('button', { name: 'Learned', exact: true }).click();
  await page.getByRole('link', { name: 'Switch to Chinese' }).click();
  await hydrated(page);
  await expect(
    page.getByRole('button', { name: '标记学会', exact: true })
  ).toHaveAttribute('aria-pressed', 'false');
  await expect(
    page.getByRole('button', { name: '★ 已收藏', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
});

test('English navigation, collections and every document and idiom have English prose at 375px', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 375, height: 812 });
  const routes = [
    '',
    'features/',
    'idioms/',
    'favorites/',
    'languages/',
    ...languages.map((item) => `language/${item.id}/`),
    ...documents.map((item) => `feature/${item.id}/`),
    ...idioms.map((item) => `idiom/${item.id}/`),
  ];
  for (const route of routes) {
    const response = await open(page, `en/${route}`);
    expect(response.status()).toBe(200);
    await expectEnglishProse(page);
    await expectNoHorizontalOverflow(page);
    const hrefs = await page
      .locator('a[href^="/"]:not(.locale-switch)')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(hrefs.every((href) => href.startsWith(`${base}en/`))).toBe(true);
  }
  await open(page, 'en/idiom/array-map/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    english.idioms['array-map'].title
  );
});

test('without JavaScript, both locales retain the docs directory and all practical source bodies', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  try {
    const page = await context.newPage();
    for (const locale of ['zh', 'en']) {
      const prefix = locale === 'en' ? 'en/' : '';
      expect(
        (await page.goto(new URL(prefix || './', baseURL).href)).status()
      ).toBe(200);
      await expect(page.locator('[data-doc-row]')).toHaveCount(
        documents.length
      );
      for (const doc of practical) {
        expect(
          (
            await page.goto(
              new URL(`${prefix}feature/${doc.id}/`, baseURL).href
            )
          ).status()
        ).toBe(200);
        for (const entry of doc.entries) {
          const code = page.locator(`#code-${doc.id}-${entry.languageId}`);
          await expect(code).toBeVisible();
          expect(await code.textContent()).toBe(
            locale === 'en' ? (entry.en?.code ?? entry.code) : entry.code
          );
        }
        await expectNoHorizontalOverflow(page);
        if (locale === 'en') await expectEnglishProse(page);
      }
    }
  } finally {
    await context.close();
  }
});

test('language picker defaults match viewport and mobile disclosure supports repeated selection, collapse and reload', async ({
  page,
}) => {
  for (const locale of ['zh', 'en']) {
    const prefix = locale === 'en' ? 'en/' : '';
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, `${prefix}feature/read-text-file/`);
    await expect(page.locator('details.language-picker')).toHaveAttribute(
      'open',
      ''
    );
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await hydrated(page);
    const picker = page.locator('details.language-picker');
    const summary = picker.locator('summary');
    const search = picker.getByRole('searchbox');
    await expect(picker).not.toHaveAttribute('open');
    await expect(summary).toContainText(
      locale === 'en' ? 'Choose languages' : '选择语言'
    );
    await expect(search).toBeHidden();
    await expect(
      page.locator('[data-language-card]:visible').first()
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expandLanguagePicker(page);
    await expect(search).toBeVisible();
    await search.fill('Rust');
    const rust = picker.getByRole('button', { name: 'Rust', exact: true });
    await expect(rust).toBeVisible();
    if ((await rust.getAttribute('aria-pressed')) === 'true')
      await rust.click();
    await rust.click();
    await expect(rust).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-language-card="rust"]')).toBeVisible();
    await expect(summary).toContainText('Rust');
    await expectNoHorizontalOverflow(page);
    await summary.click();
    await expect(picker).not.toHaveAttribute('open');
    await expect(search).toBeHidden();
    await expect(page.locator('[data-language-card="rust"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expandLanguagePicker(page);
    await search.fill('');
    await expect(picker.locator('.language-options button')).toHaveCount(12);
    await summary.click();
    await page.reload();
    await hydrated(page);
    await expect(picker).not.toHaveAttribute('open');
    await expect(summary).toContainText('Rust');
    await expect(page.locator('[data-language-card="rust"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});


test('foundation-first directory opens the same eight beginner chapters in both locales', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: testInfo.project.name === 'mobile' ? 375 : 1280, height: 900 });
  for (const locale of ['zh', 'en']) {
    const prefix = locale === 'en' ? 'en/' : '';
    await open(page, prefix || './');
    const rows = page.locator('.docs-directory [data-doc-row] a');
    for (const [index, doc] of foundations.entries()) {
      await expect(rows.nth(index)).toHaveAttribute('href', `${base}${prefix}feature/${doc.id}/`);
    }
    await rows.first().click();
    await hydrated(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(locale === 'en' ? foundations[0].en.title : foundations[0].title);
    await expect(page.locator('.docs-sidebar [aria-current="page"]')).toHaveAttribute('href', `${base}${prefix}feature/syntax-basics/`);
    await expectNoHorizontalOverflow(page, page.viewportSize().width);
  }
});

test('all eight beginner chapters deliver twelve complete sourced examples in both locales', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: testInfo.project.name === 'mobile' ? 375 : 1280, height: 900 });
  test.setTimeout(180000);
  await page.addInitScript((ids) => localStorage.setItem('elsewise_preferences', JSON.stringify({ selectedLanguages: ids })), languages.map(language => language.id));
  for (const locale of ['zh', 'en']) {
    for (const doc of foundations) {
      const response = await open(page, `${locale === 'en' ? 'en/' : ''}feature/${doc.id}/`);
      expect(response.status()).toBe(200);
      await expect(page.locator('[data-language-card]')).toHaveCount(12);
      for (const entry of doc.entries) {
        const card = page.locator(`[data-language-card="${entry.languageId}"]`);
        await expect(card).toBeVisible();
        expect(await card.locator('pre code').textContent()).toBe(entry.code);
        await expect(card).toContainText(locale === 'en' ? entry.en.summary : entry.summary);
        await expect(card.locator('.source-details a')).toHaveCount(entry.sources.length);
      }
      for (const theme of ['light', 'dark']) {
        if ((await page.locator('html').getAttribute('data-theme')) !== theme) await page.locator('#theme-toggle').click();
        await expectNoHorizontalOverflow(page, page.viewportSize().width);
        if (locale === 'en') await expectEnglishProse(page);
      }
    }
  }
});


test('basic types, conditions and loops navigate as one beginner sequence without losing locale or selection', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: testInfo.project.name === 'mobile' ? 375 : 1280, height: 900 });
  for (const locale of ['zh', 'en']) {
    const prefix = locale === 'en' ? 'en/' : '';
    await open(page, `${prefix}feature/basic-types/`);
    const picker = await expandLanguagePicker(page);
    const python = picker.getByRole('button', { name: 'Python', exact: true });
    if ((await python.getAttribute('aria-pressed')) !== 'true') await python.click();
    for (const id of ['conditions', 'loops']) {
      await page.locator(`.related-docs a[href="${base}${prefix}feature/${id}/"]`).click();
      await hydrated(page);
      await expect(page.locator('[data-language-card="python"]')).toBeVisible();
      await expect(page.locator('.docs-sidebar [aria-current="page"]')).toHaveAttribute('href', `${base}${prefix}feature/${id}/`);
      await expectNoHorizontalOverflow(page, page.viewportSize().width);
      if (locale === 'en') await expectEnglishProse(page);
    }
  }
});
