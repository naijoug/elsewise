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
      className="theme-toggle"
      title={text(locale, '切换明暗主题', 'Toggle light and dark theme')}
      aria-label={text(locale, '切换明暗主题', 'Toggle light and dark theme')}
      aria-pressed={theme === 'dark'}
      onClick={() =>
        updatePreferences({ theme: theme === 'dark' ? 'light' : 'dark' })
      }
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 4a8 8 0 0 1 0 16V4Z" fill="currentColor" />
      </svg>
    </button>
  );
}
