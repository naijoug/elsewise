import { useSyncExternalStore } from 'react';

export const learnedKey = 'elsewise_learned_v1';
const eventName = 'elsewise:learned';
type State = { ids: string[]; storage: 'saved' | 'session' | 'invalid' };
const serverValue = JSON.stringify({ ids: [], storage: 'saved' });
let value: string | undefined;
let unsaved = false;

function read(): State {
  let raw: string | null;
  try {
    raw = localStorage.getItem(learnedKey);
  } catch {
    return { ids: [], storage: 'session' };
  }
  try {
    if (!raw) return { ids: [], storage: 'saved' };
    const data: unknown = JSON.parse(raw);
    if (
      !data ||
      typeof data !== 'object' ||
      !('version' in data) ||
      data.version !== 1 ||
      !('ids' in data) ||
      !Array.isArray(data.ids) ||
      !data.ids.every((id: unknown) => typeof id === 'string' && id.length > 0)
    )
      return { ids: [], storage: 'invalid' };
    return { ids: [...new Set(data.ids as string[])], storage: 'saved' };
  } catch {
    return { ids: [], storage: 'invalid' };
  }
}
function snapshot() {
  value ??= JSON.stringify(read());
  return value;
}
function subscribe(callback: () => void) {
  const refresh = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key !== null &&
      event.key !== learnedKey
    )
      return;
    if (!unsaved) value = JSON.stringify(read());
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
}
export function useLearned(): State {
  return JSON.parse(
    useSyncExternalStore(subscribe, snapshot, () => serverValue)
  ) as State;
}
export function toggleLearned(id: string) {
  if (!id) return;
  const current: State = unsaved ? JSON.parse(snapshot()) : read();
  const ids = current.ids.includes(id)
    ? current.ids.filter((item) => item !== id)
    : [...current.ids, id];
  let storage: State['storage'] = 'saved';
  try {
    localStorage.setItem(learnedKey, JSON.stringify({ version: 1, ids }));
    unsaved = false;
  } catch {
    storage = 'session';
    unsaved = true;
  }
  value = JSON.stringify({ ids, storage });
  window.dispatchEvent(new Event(eventName));
}
