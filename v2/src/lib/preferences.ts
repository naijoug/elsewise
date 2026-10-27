import { useSyncExternalStore } from 'react';
import { loadPreferences, savePreferences } from '../../../src/utils/storage';
import type { UserPreferences } from '../../../src/types';
const eventName = 'elsewise:preferences';
const serverValue = JSON.stringify({
  favoriteIdioms: [],
  selectedLanguages: [],
  theme: 'light',
});
let sessionValue: string | undefined;
let storageFailed = false;
function snapshot() {
  sessionValue ??= JSON.stringify(loadPreferences());
  return sessionValue;
}
const subscribe = (callback: () => void) => {
  const refresh = () => {
    if (!storageFailed) sessionValue = JSON.stringify(loadPreferences());
    callback();
  };
  window.addEventListener('storage', refresh);
  window.addEventListener('pageshow', refresh);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener('storage', refresh);
    window.removeEventListener('pageshow', refresh);
    window.removeEventListener(eventName, callback);
  };
};
export function usePreferences() {
  return JSON.parse(
    useSyncExternalStore(subscribe, snapshot, () => serverValue)
  ) as UserPreferences;
}
export function updatePreferences(update: Partial<UserPreferences>) {
  const current = storageFailed ? JSON.parse(snapshot()) : loadPreferences();
  const next = { ...current, ...update };
  sessionValue = JSON.stringify(next);
  savePreferences(next);
  storageFailed = JSON.stringify(loadPreferences()) !== sessionValue;
  window.dispatchEvent(new Event(eventName));
}
