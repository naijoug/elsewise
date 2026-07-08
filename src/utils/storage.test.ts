/**
 * Tests for storage utility functions
 *
 * Covers:
 * - loadPreferences: empty storage, valid data, corrupted JSON, merge with defaults
 * - savePreferences: round-trip, quota exceeded graceful failure
 * - clearPreferences: removes key
 * - addFavoriteIdiom: dedup, persistence
 * - removeFavoriteIdiom: filter, idempotent
 * - isFavoriteIdiom: lookup
 * - updateSelectedLanguages / updateTheme: persistence
 * - localStorage unavailable (graceful degradation)
 */

import { describe, beforeEach, it, expect, vi } from 'vitest';
import {
  loadPreferences,
  savePreferences,
  clearPreferences,
  addFavoriteIdiom,
  removeFavoriteIdiom,
  isFavoriteIdiom,
  updateSelectedLanguages,
  updateTheme,
} from './storage';
import type { UserPreferences } from '../types';

const STORAGE_KEY = 'bytebite_preferences';

function setStored(value: string | null): void {
  if (value === null) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, value);
  }
}

describe('loadPreferences', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when storage is empty', () => {
    setStored(null);
    const result = loadPreferences();
    expect(result).toEqual({
      favoriteIdioms: [],
      selectedLanguages: [],
      theme: 'light',
    });
  });

  it('loads valid stored preferences', () => {
    const prefs: UserPreferences = {
      favoriteIdioms: ['array-map', 'string-split'],
      selectedLanguages: ['javascript', 'python'],
      theme: 'dark',
    };
    setStored(JSON.stringify(prefs));
    expect(loadPreferences()).toEqual(prefs);
  });

  it('merges with defaults for missing fields', () => {
    setStored(JSON.stringify({ favoriteIdioms: ['go-struct'] }));
    const result = loadPreferences();
    expect(result.favoriteIdioms).toEqual(['go-struct']);
    expect(result.selectedLanguages).toEqual([]);
    expect(result.theme).toBe('light');
  });

  it('returns defaults when JSON is corrupted', () => {
    setStored('{not valid json');
    const result = loadPreferences();
    expect(result).toEqual({
      favoriteIdioms: [],
      selectedLanguages: [],
      theme: 'light',
    });
  });

  it('returns defaults when localStorage throws', () => {
    const original = localStorage.getItem;
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const result = loadPreferences();
    expect(result.favoriteIdioms).toEqual([]);
    expect(result.selectedLanguages).toEqual([]);
    expect(result.theme).toBe('light');
    localStorage.getItem = original;
  });
});

describe('savePreferences', () => {
  beforeEach(() => localStorage.clear());

  it('persists preferences to localStorage', () => {
    const prefs: UserPreferences = {
      favoriteIdioms: ['rust-iter'],
      selectedLanguages: ['rust'],
      theme: 'dark',
    };
    savePreferences(prefs);
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(prefs);
  });

  it('does not throw when localStorage.setItem fails', () => {
    const original = localStorage.setItem;
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() =>
      savePreferences({
        favoriteIdioms: [],
        selectedLanguages: [],
        theme: 'light',
      })
    ).not.toThrow();
    localStorage.setItem = original;
  });
});

describe('clearPreferences', () => {
  beforeEach(() => localStorage.clear());

  it('removes the storage key', () => {
    localStorage.setItem(STORAGE_KEY, '{"favoriteIdioms":[]}');
    clearPreferences();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('does not throw when localStorage.removeItem fails', () => {
    const original = localStorage.removeItem;
    vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => clearPreferences()).not.toThrow();
    localStorage.removeItem = original;
  });
});

describe('addFavoriteIdiom', () => {
  beforeEach(() => localStorage.clear());

  it('adds an idiom to favorites', () => {
    addFavoriteIdiom('array-map');
    expect(isFavoriteIdiom('array-map')).toBe(true);
  });

  it('does not add duplicates', () => {
    addFavoriteIdiom('array-map');
    addFavoriteIdiom('array-map');
    const prefs = loadPreferences();
    expect(
      prefs.favoriteIdioms.filter((id) => id === 'array-map')
    ).toHaveLength(1);
  });
});

describe('removeFavoriteIdiom', () => {
  beforeEach(() => localStorage.clear());

  it('removes an idiom from favorites', () => {
    addFavoriteIdiom('array-map');
    addFavoriteIdiom('string-split');
    removeFavoriteIdiom('array-map');
    expect(isFavoriteIdiom('array-map')).toBe(false);
    expect(isFavoriteIdiom('string-split')).toBe(true);
  });

  it('is idempotent when removing a non-existent idiom', () => {
    expect(() => removeFavoriteIdiom('nonexistent')).not.toThrow();
    expect(isFavoriteIdiom('nonexistent')).toBe(false);
  });
});

describe('isFavoriteIdiom', () => {
  beforeEach(() => localStorage.clear());

  it('returns false for an idiom that is not favorited', () => {
    expect(isFavoriteIdiom('never-added')).toBe(false);
  });

  it('returns true for a favorited idiom', () => {
    addFavoriteIdiom('go-channels');
    expect(isFavoriteIdiom('go-channels')).toBe(true);
  });
});

describe('updateSelectedLanguages', () => {
  beforeEach(() => localStorage.clear());

  it('updates selected languages', () => {
    updateSelectedLanguages(['typescript', 'go']);
    const prefs = loadPreferences();
    expect(prefs.selectedLanguages).toEqual(['typescript', 'go']);
  });

  it('overwrites previous selections', () => {
    updateSelectedLanguages(['typescript']);
    updateSelectedLanguages(['go', 'rust']);
    const prefs = loadPreferences();
    expect(prefs.selectedLanguages).toEqual(['go', 'rust']);
  });
});

describe('updateTheme', () => {
  beforeEach(() => localStorage.clear());

  it('updates theme to dark', () => {
    updateTheme('dark');
    expect(loadPreferences().theme).toBe('dark');
  });

  it('updates theme to light', () => {
    updateTheme('dark');
    updateTheme('light');
    expect(loadPreferences().theme).toBe('light');
  });
});
