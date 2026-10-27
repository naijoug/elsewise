import { act } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserPreferences } from '../../../src/types';
let store: typeof import('./preferences');
let container: HTMLDivElement;
let root: Root | undefined;
const saved: UserPreferences = {
  favoriteIdioms: ['array-map'],
  selectedLanguages: ['python', 'go'],
  theme: 'dark',
};
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
function View() {
  return <output>{JSON.stringify(store.usePreferences())}</output>;
}
const visible = () =>
  JSON.parse(
    container.querySelector('output')!.textContent!
  ) as UserPreferences;
const write = (value: UserPreferences, key = 'elsewise_preferences') =>
  localStorage.setItem(key, JSON.stringify(value));
function mount() {
  root = createRoot(container);
  act(() => root!.render(<View />));
}
beforeEach(async () => {
  localStorage.clear();
  vi.resetModules();
  store = await import('./preferences');
  container = document.createElement('div');
  document.body.append(container);
});
afterEach(() => {
  if (root) act(() => root!.unmount());
  root = undefined;
  container.remove();
  vi.restoreAllMocks();
  localStorage.clear();
});
describe('preference islands', () => {
  it('hydrates defaults from legacy storage and keeps rollback data', () => {
    write(saved, 'bytebite_preferences');
    container.innerHTML = renderToString(<View />);
    expect(visible()).toEqual({
      favoriteIdioms: [],
      selectedLanguages: [],
      theme: 'light',
    });
    const onRecoverableError = vi.fn();
    act(() => {
      root = hydrateRoot(container, <View />, { onRecoverableError });
    });
    expect(visible()).toEqual(saved);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('elsewise_preferences')!)).toEqual(
      saved
    );
    expect(JSON.parse(localStorage.getItem('bytebite_preferences')!)).toEqual(
      saved
    );
  });
  it('merges favorites and language updates without losing theme', () => {
    write(saved);
    mount();
    act(() => store.updatePreferences({ favoriteIdioms: ['async-await'] }));
    act(() => store.updatePreferences({ selectedLanguages: ['rust'] }));
    expect(visible()).toEqual({
      ...saved,
      favoriteIdioms: ['async-await'],
      selectedLanguages: ['rust'],
    });
    expect(JSON.parse(localStorage.getItem('elsewise_preferences')!)).toEqual(
      visible()
    );
  });
  it('refreshes on pageshow', () => {
    write(saved);
    mount();
    const next = { ...saved, favoriteIdioms: [] };
    write(next);
    act(() => window.dispatchEvent(new Event('pageshow')));
    expect(visible()).toEqual(next);
  });
  it('refreshes on storage event', () => {
    write(saved);
    mount();
    const next = { ...saved, selectedLanguages: ['swift'] };
    write(next);
    act(() =>
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'elsewise_preferences' })
      )
    );
    expect(visible()).toEqual(next);
  });
  it('preserves session updates after write failure and later persists recovery', () => {
    write(saved);
    mount();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const setter = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('full', 'QuotaExceededError');
      });
    act(() => store.updatePreferences({ favoriteIdioms: ['async-await'] }));
    act(() => store.updatePreferences({ selectedLanguages: ['rust'] }));
    const session = {
      ...saved,
      favoriteIdioms: ['async-await'],
      selectedLanguages: ['rust'],
    };
    expect(visible()).toEqual(session);
    act(() => window.dispatchEvent(new Event('pageshow')));
    expect(visible()).toEqual(session);
    expect(JSON.parse(localStorage.getItem('elsewise_preferences')!)).toEqual(
      saved
    );
    setter.mockRestore();
    act(() => store.updatePreferences({ theme: 'light' }));
    expect(JSON.parse(localStorage.getItem('elsewise_preferences')!)).toEqual({
      ...session,
      theme: 'light',
    });
  });
  it('cleans up listeners', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    mount();
    act(() => root!.unmount());
    root = undefined;
    for (const name of ['storage', 'pageshow', 'elsewise:preferences'])
      expect(remove).toHaveBeenCalledWith(name, expect.any(Function));
  });
});
