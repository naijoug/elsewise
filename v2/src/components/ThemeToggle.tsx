import { useEffect } from 'react';
import { usePreferences, updatePreferences } from '../lib/preferences';
export default function ThemeToggle() {
  const { theme = 'light' } = usePreferences();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return (
    <button
      id="theme-toggle"
      aria-label="切换明暗主题"
      aria-pressed={theme === 'dark'}
      onClick={() =>
        updatePreferences({ theme: theme === 'dark' ? 'light' : 'dark' })
      }
    >
      明 / 暗
    </button>
  );
}
