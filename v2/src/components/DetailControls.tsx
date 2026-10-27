import { useEffect, useState } from 'react';
import { usePreferences, updatePreferences } from '../lib/preferences';
import LearnedButton, { LearnedNotice } from './LearnedButton';
type Option = { id: string; name: string };
export default function DetailControls({
  idiomId,
  options,
  subject = '习语',
}: {
  idiomId: string;
  subject?: string;
  options: Option[];
}) {
  const preferences = usePreferences();
  const [query, setQuery] = useState('');
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
  const favorite = preferences.favoriteIdioms.includes(idiomId);
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
  return (
    <div className="detail-controls">
      <button
        aria-pressed={favorite}
        onClick={() =>
          updatePreferences({
            favoriteIdioms: favorite
              ? preferences.favoriteIdioms.filter((id) => id !== idiomId)
              : [...new Set([...preferences.favoriteIdioms, idiomId])],
          })
        }
      >
        {favorite ? '★ 已收藏' : `☆ 收藏${subject}`}
      </button>
      <LearnedButton id={idiomId} />
      <LearnedNotice />
      <div>
        <h2>选择要对比的语言</h2>
        <p>
          选择多种语言，查看同一个特性的不同实现。未列出的语言表示本条尚未收录，不代表语言不支持。
        </p>
      </div>
      <div className="toolbar">
        <input
          type="search"
          aria-label="搜索对比语言"
          placeholder="搜索语言名称…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          onClick={() => {
            setQuery('');
            updatePreferences({ selectedLanguages: [] });
          }}
        >
          清空选择（恢复默认）
        </button>
      </div>
      {!visibleOptions.length && (
        <p role="status">没有匹配的已收录语言，试试其他名称。</p>
      )}
      <div className="language-options" role="group" aria-label="对比语言">
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
      <span className="sr-only" role="status">
        已选择 {selected.length} 种语言
      </span>
    </div>
  );
}
