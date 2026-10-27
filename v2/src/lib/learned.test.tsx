import { act } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
let store: typeof import('./learned');
let host: HTMLDivElement;
let root: Root | undefined;
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
function View() {
  return <output>{JSON.stringify(store.useLearned())}</output>;
}
const visible = () => JSON.parse(host.textContent!);
function mount() {
  root = createRoot(host);
  act(() => root!.render(<View />));
}
function write(ids: string[]) {
  localStorage.setItem(store.learnedKey, JSON.stringify({ version: 1, ids }));
}
beforeEach(async () => {
  localStorage.clear();
  vi.resetModules();
  store = await import('./learned');
  host = document.createElement('div');
  document.body.append(host);
});
afterEach(() => {
  if (root) act(() => root!.unmount());
  root = undefined;
  host.remove();
  vi.restoreAllMocks();
  localStorage.clear();
});
it('hydrates stored markers without mismatch and keeps preferences untouched', () => {
  localStorage.setItem('elsewise_preferences', 'original');
  write(['a', 'a']);
  host.innerHTML = renderToString(<View />);
  expect(visible().ids).toEqual([]);
  const onRecoverableError = vi.fn();
  act(() => {
    root = hydrateRoot(host, <View />, { onRecoverableError });
  });
  expect(visible().ids).toEqual(['a']);
  expect(onRecoverableError).not.toHaveBeenCalled();
  act(() => store.toggleLearned('b'));
  expect(visible().ids).toEqual(['a', 'b']);
  act(() => store.toggleLearned('a'));
  expect(visible().ids).toEqual(['b']);
  expect(localStorage.getItem('elsewise_preferences')).toBe('original');
});
it.each([
  'broken',
  '{}',
  '{"version":2,"ids":["a"]}',
  '{"version":1,"ids":[5]}',
])('tolerates invalid records %s', (raw) => {
  localStorage.setItem(store.learnedKey, raw);
  mount();
  expect(visible().ids).toEqual([]);
  act(() => store.toggleLearned('a'));
  expect(JSON.parse(localStorage.getItem(store.learnedKey)!)).toEqual({
    version: 1,
    ids: ['a'],
  });
});
it('refreshes through pageshow and only relevant storage events including clear', () => {
  mount();
  write(['a']);
  act(() =>
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'elsewise_preferences' })
    )
  );
  expect(visible().ids).toEqual([]);
  act(() =>
    window.dispatchEvent(new StorageEvent('storage', { key: store.learnedKey }))
  );
  expect(visible().ids).toEqual(['a']);
  write(['b']);
  act(() => window.dispatchEvent(new Event('pageshow')));
  expect(visible().ids).toEqual(['b']);
  localStorage.clear();
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: null })));
  expect(visible().ids).toEqual([]);
});
it('merges latest stored IDs before a toggle instead of losing another tab changes', () => {
  mount();
  write(['other']);
  act(() => store.toggleLearned('a'));
  expect(visible().ids).toEqual(['other', 'a']);
});
it('reports session-only failed saves, retains current-page changes, recovers on next edit', () => {
  write(['a']);
  mount();
  const setter = vi
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => {
      throw new Error('quota');
    });
  act(() => store.toggleLearned('b'));
  act(() => window.dispatchEvent(new Event('pageshow')));
  expect(visible()).toEqual({ ids: ['a', 'b'], storage: 'session' });
  act(() => store.toggleLearned('a'));
  expect(visible().ids).toEqual(['b']);
  setter.mockRestore();
  act(() => store.toggleLearned('c'));
  expect(visible()).toEqual({ ids: ['b', 'c'], storage: 'saved' });
  expect(JSON.parse(localStorage.getItem(store.learnedKey)!).ids).toEqual([
    'b',
    'c',
  ]);
});
it('survives blocked reads and removes listeners', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  const remove = vi.spyOn(window, 'removeEventListener');
  mount();
  expect(visible().storage).toBe('session');
  act(() => root!.unmount());
  root = undefined;
  for (const name of ['storage', 'pageshow', 'elsewise:learned'])
    expect(remove).toHaveBeenCalledWith(name, expect.any(Function));
});
