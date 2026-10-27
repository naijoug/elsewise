import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
let host: HTMLDivElement, root: Root;
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
});
it('shares the same learned ID across Chinese and English without changing favorites', async () => {
  const { default: LearnedButton, LearnedNotice } = await import(
    './LearnedButton'
  );
  const favorites = JSON.stringify({
    favoriteIdioms: ['feature:ownership'],
    selectedLanguages: ['rust'],
    theme: 'dark',
  });
  localStorage.setItem('elsewise_preferences', favorites);
  await act(async () =>
    root.render(
      <>
        <LearnedButton id="feature:ownership" title="所有权" />
        <LearnedNotice />
      </>
    )
  );
  expect(host.textContent).toContain('标记学会');
  expect(host.textContent).not.toContain('Get');
  await act(async () =>
    host.querySelector<HTMLButtonElement>('button')!.click()
  );
  expect(host.querySelector('button')?.getAttribute('aria-pressed')).toBe(
    'true'
  );
  expect(host.textContent).toContain('已学会');
  await act(async () =>
    root.render(
      <>
        <LearnedButton id="feature:ownership" title="Ownership" locale="en" />
        <LearnedNotice locale="en" />
      </>
    )
  );
  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe(
    'Learned: Ownership'
  );
  expect(host.querySelector('button')?.getAttribute('aria-pressed')).toBe(
    'true'
  );
  expect(host.innerHTML).not.toMatch(/[\u4e00-\u9fff]/);
  expect(JSON.parse(localStorage.getItem('elsewise_learned_v1')!).ids).toEqual([
    'feature:ownership',
  ]);
  await act(async () =>
    host.querySelector<HTMLButtonElement>('button')!.click()
  );
  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe(
    'Mark as learned: Ownership'
  );
  await act(async () =>
    root.render(
      <>
        <LearnedButton id="feature:ownership" />
        <LearnedNotice />
      </>
    )
  );
  expect(host.querySelector('button')?.getAttribute('aria-pressed')).toBe(
    'false'
  );
  expect(JSON.parse(localStorage.getItem('elsewise_learned_v1')!).ids).toEqual(
    []
  );
  expect(localStorage.getItem('elsewise_preferences')).toBe(favorites);
});
it('reports invalid storage and temporary saves in English without Chinese fallback', async () => {
  localStorage.setItem('elsewise_learned_v1', 'invalid json');
  const { default: LearnedButton, LearnedNotice } = await import(
    './LearnedButton'
  );
  await act(async () =>
    root.render(
      <>
        <LearnedButton id="a" locale="en" />
        <LearnedNotice locale="en" />
      </>
    )
  );
  expect(host.textContent).toContain('invalid format');
  expect(host.innerHTML).not.toMatch(/[\u4e00-\u9fff]/);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota');
  });
  await act(async () =>
    host.querySelector<HTMLButtonElement>('button')!.click()
  );
  expect(host.textContent).toContain('Learning progress cannot be saved');
  expect(host.querySelector('[role="status"]')).not.toBeNull();
  expect(host.innerHTML).not.toMatch(/[\u4e00-\u9fff]/);
});
