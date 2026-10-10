import { useEffect, useState } from 'react';

export function readBrowserStore<T>(key: string, fallback: T, normalize: (value: unknown) => T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? normalize(JSON.parse(stored)) : fallback;
  } catch { return fallback; }
}
export function useBrowserStore<T>(key: string, seed: () => T, normalize: (value: unknown) => T) {
  const [value, setValue] = useState<T>(seed);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    setValue(current => readBrowserStore(key, current, normalize));
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try { setValue(normalize(JSON.parse(event.newValue))); } catch { /* Ignore malformed external writes. */ }
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key, normalize]);
  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(key, JSON.stringify(value)); setStorageError(''); }
    catch { setStorageError('Changes could not be saved in this browser. Check browser storage availability.'); }
  }, [key, ready, value]);
  return [value, setValue, ready, storageError] as const;
}