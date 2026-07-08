import { act, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { usePreferences } from './usePreferences';
import type { UserPreferences } from '../types';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockAppContext = vi.hoisted(() => ({
  preferences: {
    favoriteIdioms: ['array-map'],
    selectedLanguages: ['javascript'],
    theme: 'dark',
  } as UserPreferences,
  updatePreferences: vi.fn<(updates: Partial<UserPreferences>) => void>(),
  toggleFavorite: vi.fn<(idiomId: string) => void>(),
  isFavorite: vi.fn<(idiomId: string) => boolean>(),
  selectedLanguages: ['javascript'],
  setSelectedLanguages: vi.fn<(languages: string[]) => void>(),
}));

vi.mock('../contexts/AppContext', () => ({
  useAppContext: () => mockAppContext,
}));

type PreferencesApi = ReturnType<typeof usePreferences>;

function PreferencesHarness({ onHook }: { onHook: (api: PreferencesApi) => void }) {
  onHook(usePreferences());
  return null as ReactNode;
}

function renderHook() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  let api: PreferencesApi | undefined;

  act(() => {
    root.render(<PreferencesHarness onHook={(value) => { api = value; }} />);
  });

  const unmount = () => {
    act(() => root.unmount());
    container.remove();
  };

  if (!api) {
    throw new Error('usePreferences harness did not render');
  }

  return { api, unmount };
}

function resetMockContext(overrides: Partial<typeof mockAppContext> = {}) {
  mockAppContext.preferences = {
    favoriteIdioms: ['array-map'],
    selectedLanguages: ['javascript'],
    theme: 'dark',
  };
  mockAppContext.selectedLanguages = ['javascript'];
  mockAppContext.updatePreferences.mockReset();
  mockAppContext.toggleFavorite.mockReset();
  mockAppContext.isFavorite.mockReset();
  mockAppContext.isFavorite.mockImplementation((idiomId) =>
    mockAppContext.preferences.favoriteIdioms.includes(idiomId)
  );
  mockAppContext.setSelectedLanguages.mockReset();
  Object.assign(mockAppContext, overrides);
}

afterEach(() => {
  document.body.innerHTML = '';
  resetMockContext();
});

describe('usePreferences', () => {
  it('exposes raw preferences, selected languages, and current theme', () => {
    resetMockContext();

    const { api, unmount } = renderHook();

    expect(api.preferences).toBe(mockAppContext.preferences);
    expect(api.getFavorites()).toEqual(['array-map']);
    expect(api.selectedLanguages).toEqual(['javascript']);
    expect(api.theme).toBe('dark');
    unmount();
  });

  it('falls back to light theme when preferences theme is missing', () => {
    resetMockContext({
      preferences: {
        favoriteIdioms: [],
        selectedLanguages: [],
        theme: undefined as unknown as UserPreferences['theme'],
      },
      selectedLanguages: [],
    });

    const { api, unmount } = renderHook();

    expect(api.theme).toBe('light');
    unmount();
  });

  it('adds a favorite only when it is not already present', () => {
    resetMockContext();
    const { api, unmount } = renderHook();

    api.addFavorite('promise-all');
    api.addFavorite('array-map');

    expect(mockAppContext.toggleFavorite).toHaveBeenCalledTimes(1);
    expect(mockAppContext.toggleFavorite).toHaveBeenCalledWith('promise-all');
    unmount();
  });

  it('removes a favorite only when it exists', () => {
    resetMockContext();
    const { api, unmount } = renderHook();

    api.removeFavorite('array-map');
    api.removeFavorite('promise-all');

    expect(mockAppContext.toggleFavorite).toHaveBeenCalledTimes(1);
    expect(mockAppContext.toggleFavorite).toHaveBeenCalledWith('array-map');
    unmount();
  });

  it('forwards direct favorite checks and toggles', () => {
    resetMockContext();
    const { api, unmount } = renderHook();

    expect(api.isFavorite('array-map')).toBe(true);
    api.toggleFavorite('array-map');

    expect(mockAppContext.isFavorite).toHaveBeenCalledWith('array-map');
    expect(mockAppContext.toggleFavorite).toHaveBeenCalledWith('array-map');
    unmount();
  });

  it('forwards selected language updates to the app context', () => {
    resetMockContext();
    const { api, unmount } = renderHook();

    api.setSelectedLanguages(['python', 'go']);

    expect(mockAppContext.setSelectedLanguages).toHaveBeenCalledWith(['python', 'go']);
    unmount();
  });

  it('updates theme through the generic preferences updater', () => {
    resetMockContext();
    const { api, unmount } = renderHook();

    api.setTheme('light');

    expect(mockAppContext.updatePreferences).toHaveBeenCalledWith({ theme: 'light' });
    unmount();
  });

  it('resets favorites, languages, and theme to defaults', () => {
    resetMockContext();
    const { api, unmount } = renderHook();

    api.resetPreferences();

    expect(mockAppContext.updatePreferences).toHaveBeenCalledWith({
      favoriteIdioms: [],
      selectedLanguages: [],
      theme: 'light',
    });
    unmount();
  });

  it('passes batched preference updates through unchanged', () => {
    resetMockContext();
    const { api, unmount } = renderHook();
    const updates: Partial<UserPreferences> = {
      favoriteIdioms: ['reduce-group'],
      selectedLanguages: ['typescript'],
    };

    api.updatePreferences(updates);

    expect(mockAppContext.updatePreferences).toHaveBeenCalledWith(updates);
    unmount();
  });
});
