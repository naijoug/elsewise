import ActionIcon from './ActionIcon';
import { hasTopic, toggledTopic } from '../lib/knowledge-identity';
import { text, type Locale } from '../lib/ui-i18n';
import { useEffect, useRef, useState } from 'react';
import { usePreferences, updatePreferences } from '../lib/preferences';
import LearnedButton, { LearnedNotice } from './LearnedButton';
type Option = { id: string; name: string };
export default function DetailControls({
  idiomId,
  options,
  subject,
  locale = 'zh',
}: {
  idiomId: string;
  subject?: string;
  locale?: Locale;
  options: Option[];
}) {
  const preferences = usePreferences();
  const [query, setQuery] = useState('');
  const pickerRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const media = window.matchMedia?.('(min-width: 850px)');
    const updatePicker = () => {
      if (pickerRef.current) pickerRef.current.open = media?.matches ?? true;
    };
    updatePicker();
    media?.addEventListener?.('change', updatePicker);
    return () => media?.removeEventListener?.('change', updatePicker);
  }, []);
  const available = preferences.selectedLanguages.filter((id) =>
    options.some((option) => option.id === id)
  );
  const selected = available.length
    ? available
    : options.slice(0, 2).map((option) => option.id);
  const visibleOptions = options.filter((option) =>
    `${option.name} ${option.id}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase())
  );
  const favorite = hasTopic(preferences.favoriteIdioms, idiomId);
  useEffect(() => {
    const grid = document.querySelector<HTMLElement>('.code-grid');
    if (grid) grid.dataset.columns = String(Math.min(selected.length, 2));
    document
      .querySelectorAll<HTMLElement>('[data-language-card]')
      .forEach((card) => {
        card.hidden = !selected.includes(card.dataset.languageCard || '');
      });
  }, [selected]);
  function toggle(id: string) {
    const next = selected.includes(id)
      ? selected.filter((value) => value !== id)
      : [...selected, id];
    if (next.length) updatePreferences({ selectedLanguages: next });
  }
  const favoriteLabel = favorite ? text(locale, '已收藏', 'Favorited') : text(locale, `收藏${subject || '文档'}`, 'Favorite');
  return (
    <div className="detail-controls">
      <button
        className="icon-action favorite-action"
        aria-label={favoriteLabel}
        aria-pressed={favorite}
        onClick={() =>
          updatePreferences({
            favoriteIdioms: toggledTopic(preferences.favoriteIdioms, idiomId),
          })
        }
      >
        <ActionIcon name="bookmark" />
        <span className="action-tip" aria-hidden="true">{favoriteLabel}</span>
      </button>
      <LearnedButton id={idiomId} locale={locale} />
      <LearnedNotice locale={locale} />
      <div>
        <h2>{text(locale, '对比语言', 'Compare languages')}</h2>
      </div>
      <details className="language-picker" ref={pickerRef}>
        <summary>
          <span>{text(locale, '选择语言', 'Choose languages')}</span>{' '}
          <span className="selected-language-summary">
            {selected
              .map(
                (id) => options.find((option) => option.id === id)?.name || id
              )
              .join(', ')}
          </span>
        </summary>
        <div className="toolbar">
          <input
            type="search"
            aria-label={text(
              locale,
              '搜索对比语言',
              'Search comparison languages'
            )}
            placeholder={text(locale, '搜索语言名称…', 'Search languages…')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            className="icon-action"
            aria-label={text(locale, '恢复默认', 'Reset selection')}
            onClick={() => {
              setQuery('');
              updatePreferences({ selectedLanguages: [] });
            }}
          >
            <ActionIcon name="reset" />
            <span className="action-tip" aria-hidden="true">{text(locale, '恢复默认', 'Reset selection')}</span>
          </button>
        </div>
        {!visibleOptions.length && (
          <p role="status">
            {text(
              locale,
              '没有匹配的已收录语言，试试其他名称。',
              'No matching languages in this document. Try another name.'
            )}
          </p>
        )}
        <div
          className="language-options"
          role="group"
          aria-label={text(locale, '对比语言', 'Compare languages')}
        >
          {visibleOptions.map((option) => (
            <button
              key={option.id}
              aria-pressed={selected.includes(option.id)}
              disabled={selected.length === 1 && selected.includes(option.id)}
              onClick={() => toggle(option.id)}
            >
              {option.name}
            </button>
          ))}
        </div>
      </details>
      <span className="sr-only" role="status">
        {text(
          locale,
          `已选择 ${selected.length} 种语言`,
          `${selected.length} languages selected`
        )}
      </span>
    </div>
  );
}
