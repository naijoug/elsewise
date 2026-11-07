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
      <svg
        className="day"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" />
      </svg>
      <svg
        className="night"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.5 14.2A8.7 8.7 0 0 1 9.8 3.5a8.8 8.8 0 1 0 10.7 10.7Z" />
      </svg>
    </button>
  );
}
