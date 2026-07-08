import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadAllData, loadIdioms, loadLanguages } from './dataLoader';
import type { Idiom, Language } from '../types';

const sampleIdiom: Idiom = {
  id: 'test-idiom',
  title: 'Test Idiom',
  description: 'A test idiom',
  category: 'test',
  difficulty: 'beginner',
  paradigms: ['imperative'],
  implementations: [
    {
      languageId: 'javascript',
      code: 'console.log(1)',
      explanation: 'Prints 1',
    },
  ],
  tags: ['test'],
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

function mockFetchOk(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchStatus(status: number) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('loadIdioms', () => {
  it('returns parsed idioms on successful fetch', async () => {
    vi.stubGlobal('fetch', mockFetchOk([sampleIdiom]));
    const result = await loadIdioms();
    expect(result).toEqual([sampleIdiom]);
  });

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetchStatus(404));
    await expect(loadIdioms()).rejects.toThrow('Failed to load idioms: 404');
  });

  it('throws when JSON parsing fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      }),
    );
    await expect(loadIdioms()).rejects.toThrow(SyntaxError);
  });

  it('logs error before rethrowing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', mockFetchStatus(500));
    await expect(loadIdioms()).rejects.toThrow();
    expect(consoleError).toHaveBeenCalledWith(
      'Error loading idioms:',
      expect.any(Error),
    );
    consoleError.mockRestore();
  });
});

describe('loadLanguages', () => {
  it('returns parsed languages on successful fetch', async () => {
    vi.stubGlobal('fetch', mockFetchOk([sampleLanguage]));
    const result = await loadLanguages();
    expect(result).toEqual([sampleLanguage]);
  });

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetchStatus(500));
    await expect(loadLanguages()).rejects.toThrow(
      'Failed to load languages: 500',
    );
  });

  it('throws when JSON parsing fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      }),
    );
    await expect(loadLanguages()).rejects.toThrow(SyntaxError);
  });
});

describe('loadAllData', () => {
  it('returns both idioms and languages on success', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([sampleIdiom]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([sampleLanguage]),
      });
    vi.stubGlobal('fetch', fetchMock);

    const result = await loadAllData();
    expect(result.idioms).toEqual([sampleIdiom]);
    expect(result.languages).toEqual([sampleLanguage]);
  });

  it('throws if idioms fetch fails', async () => {
    vi.stubGlobal('fetch', mockFetchStatus(503));
    await expect(loadAllData()).rejects.toThrow();
  });

  it('throws if languages fetch fails (Promise.all rejection)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([sampleIdiom]),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({}),
      });
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadAllData()).rejects.toThrow('Failed to load languages: 403');
  });

  it('logs error before rethrowing on aggregate failure', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', mockFetchStatus(500));
    await expect(loadAllData()).rejects.toThrow();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
