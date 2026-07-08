import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, useAppContext } from './AppContext';
import {
  cleanupRenderedComponents,
  renderComponent,
} from '../test/renderComponent';
import type { Idiom, Language, UserPreferences } from '../types';

const mocks = vi.hoisted(() => ({
  loadAllData: vi.fn(),
  loadPreferences: vi.fn(),
  savePreferences: vi.fn(),
}));

vi.mock('../utils/dataLoader', () => ({
  loadAllData: mocks.loadAllData,
}));

vi.mock('../utils/storage', () => ({
  loadPreferences: mocks.loadPreferences,
  savePreferences: mocks.savePreferences,
}));

const sampleIdiom: Idiom = {
  id: 'array-map',
  title: 'Array Map',
  description: 'Transform every item in an array.',
  category: 'collection',
  difficulty: 'beginner',
  paradigms: ['functional'],
  implementations: [
    {
      languageId: 'javascript',
      code: 'items.map(fn)',
      explanation: 'Maps every item.',
    },
  ],
  tags: ['array'],
};

const sampleLanguage: Language = {
  id: 'javascript',
  name: 'JavaScript',
  version: 'ES2023',
  paradigms: ['multi-paradigm'],
  typeSystem: 'dynamic',
  description: 'A dynamic language',
  features: ['closures'],
  officialDocs: 'https://developer.mozilla.org',
};

const defaultPreferences: UserPreferences = {
  favoriteIdioms: ['array-map'],
  selectedLanguages: ['javascript'],
  theme: 'dark',
};

function AppContextProbe() {
  const context = useAppContext();

  return (
    <section>
      <p data-testid="idiom-count">{context.idioms.length}</p>
      <p data-testid="language-count">{context.languages.length}</p>
      <p data-testid="selected-languages">
        {context.selectedLanguages.join(',')}
      </p>
      <p data-testid="favorite-state">
        {context.isFavorite('array-map') ? 'favorite' : 'not-favorite'}
      </p>
      <button onClick={() => context.toggleFavorite('promise-all')}>
        add favorite
      </button>
      <button onClick={() => context.toggleFavorite('array-map')}>
        remove favorite
      </button>
      <button onClick={() => context.setSelectedLanguages(['python', 'go'])}>
        set languages
      </button>
      <button onClick={() => context.updatePreferences({ theme: 'light' })}>
        set theme
      </button>
    </section>
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

function clickButton(container: HTMLElement, text: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (element) => element.textContent === text
  );
  if (!button) {
    throw new Error(`button not found: ${text}`);
  }

  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

beforeEach(() => {
  mocks.loadAllData.mockReset();
  mocks.loadPreferences.mockReset();
  mocks.savePreferences.mockReset();
  mocks.loadPreferences.mockReturnValue({ ...defaultPreferences });
});

afterEach(() => {
  cleanupRenderedComponents();
  vi.restoreAllMocks();
});

describe('AppProvider', () => {
  it('shows the loading screen while data is pending', () => {
    const pending = deferred<{ idioms: Idiom[]; languages: Language[] }>();
    mocks.loadAllData.mockReturnValue(pending.promise);

    const rendered = renderComponent(
      <AppProvider>
        <AppContextProbe />
      </AppProvider>
    );

    expect(rendered.container.textContent).toContain('正在加载数据...');
    expect(rendered.container.textContent).not.toContain('add favorite');
  });

  it('provides loaded data and persisted preferences to children', async () => {
    mocks.loadAllData.mockResolvedValue({
      idioms: [sampleIdiom],
      languages: [sampleLanguage],
    });

    const rendered = renderComponent(
      <AppProvider>
        <AppContextProbe />
      </AppProvider>
    );
    await flushPromises();

    expect(
      rendered.container.querySelector('[data-testid="idiom-count"]')
        ?.textContent
    ).toBe('1');
    expect(
      rendered.container.querySelector('[data-testid="language-count"]')
        ?.textContent
    ).toBe('1');
    expect(
      rendered.container.querySelector('[data-testid="selected-languages"]')
        ?.textContent
    ).toBe('javascript');
    expect(
      rendered.container.querySelector('[data-testid="favorite-state"]')
        ?.textContent
    ).toBe('favorite');
  });

  it('saves preference updates from context actions', async () => {
    mocks.loadAllData.mockResolvedValue({
      idioms: [sampleIdiom],
      languages: [sampleLanguage],
    });

    const rendered = renderComponent(
      <AppProvider>
        <AppContextProbe />
      </AppProvider>
    );
    await flushPromises();

    clickButton(rendered.container, 'add favorite');
    expect(mocks.savePreferences).toHaveBeenLastCalledWith({
      favoriteIdioms: ['array-map', 'promise-all'],
      selectedLanguages: ['javascript'],
      theme: 'dark',
    });

    clickButton(rendered.container, 'set languages');
    expect(mocks.savePreferences).toHaveBeenLastCalledWith({
      favoriteIdioms: ['array-map', 'promise-all'],
      selectedLanguages: ['python', 'go'],
      theme: 'dark',
    });

    clickButton(rendered.container, 'set theme');
    expect(mocks.savePreferences).toHaveBeenLastCalledWith({
      favoriteIdioms: ['array-map', 'promise-all'],
      selectedLanguages: ['python', 'go'],
      theme: 'light',
    });
  });

  it('renders an error state and retries loading data', async () => {
    mocks.loadAllData
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({
        idioms: [sampleIdiom],
        languages: [sampleLanguage],
      });

    const rendered = renderComponent(
      <AppProvider>
        <AppContextProbe />
      </AppProvider>
    );
    await flushPromises();

    expect(rendered.container.textContent).toContain('数据加载失败');
    expect(rendered.container.textContent).toContain('network down');

    clickButton(rendered.container, '重试');
    await flushPromises();

    expect(mocks.loadAllData).toHaveBeenCalledTimes(2);
    expect(rendered.container.textContent).toContain('add favorite');
    expect(
      rendered.container.querySelector('[data-testid="idiom-count"]')
        ?.textContent
    ).toBe('1');
  });

  it('throws when useAppContext is rendered without a provider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => renderComponent(<AppContextProbe />)).toThrow(
      'useAppContext must be used within an AppProvider'
    );

    consoleError.mockRestore();
  });
});
