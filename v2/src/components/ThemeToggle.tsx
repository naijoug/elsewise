import { text, type Locale } from '../lib/ui-i18n';
import { useEffect } from 'react';
import { usePreferences, updatePreferences } from '../lib/preferences';
export default function ThemeToggle({ locale = 'zh' }: { locale?: Locale }) {
  const { theme = 'light' } = usePreferences();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return (
    <button
      id="theme-toggle"
      aria-label={text(locale, '切换明暗主题', 'Toggle light and dark theme')}
      aria-pressed={theme === 'dark'}
      onClick={() =>
        updatePreferences({ theme: theme === 'dark' ? 'light' : 'dark' })
      }
    >
      {text(locale, '明 / 暗', 'Light / Dark')}
    </button>
  );
}
