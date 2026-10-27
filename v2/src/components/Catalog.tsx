import { useEffect, useState } from 'react';
import { usePreferences } from '../lib/preferences';
import {
  emptyFilters,
  filterSummaries,
  type Filters,
  type Sort,
  type Summary,
} from '../lib/catalog';
const fields = [
  ['title', '标题'],
  ['description', '描述'],
  ['category', '分类'],
  ['tags', '标签'],
  ['languages', '语言'],
  ['code', '代码'],
  ['explanation', '说明'],
] as const;
type SearchField = (typeof fields)[number][0];
type SearchEntry = { id: string; fields: Record<SearchField, string[]> };
const difficulty: Record<string, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
};
export default function Catalog({
  summaries,
  languages = [],
  base,
  initialFavoritesOnly = false,
}: {
  summaries: Summary[];
  languages?: { id: string; name: string }[];
  base: string;
  initialFavoritesOnly?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<Sort>('original');
  const [favoritesOnly, setFavoritesOnly] = useState(initialFavoritesOnly);
  const { favoriteIdioms: favorites } = usePreferences();
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!query.trim() || index) return;
    const controller = new AbortController();
    fetch(`${base}/search-index.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.json();
      })
      .then((data: unknown) => {
        if (
          !Array.isArray(data) ||
          !data.every(
            (entry) =>
              typeof entry?.id === 'string' &&
              fields.every(
                ([field]) =>
                  Array.isArray(entry?.fields?.[field]) &&
                  entry.fields[field].every(
                    (value: unknown) => typeof value === 'string'
                  )
              )
          )
        )
          throw new Error('Invalid search index');
        if (!controller.signal.aborted) setIndex(data as SearchEntry[]);
      })
      .catch((reason) => {
        if (!controller.signal.aborted && reason.name !== 'AbortError')
          setError(true);
      });
    return () => controller.abort();
  }, [query, index, retry, base]);
  const term = query.trim().toLocaleLowerCase();
  const languageName = (id: string) =>
    languages.find((language) => language.id === id)?.name || id;
  const matchingLabels = (id: string) => {
    if (!term || !index) return [];
    const entry = index.find((entry) => entry.id === id);
    return entry
      ? fields
          .filter(([field]) =>
            entry.fields[field].some((value) =>
              value.toLocaleLowerCase().includes(term)
            )
          )
          .map(([, label]) => label)
      : [];
  };
  const results = filterSummaries(summaries, filters, sort).filter(
    (item) =>
      (!(initialFavoritesOnly || favoritesOnly) ||
        favorites.includes(item.id)) &&
      (!term ||
        (index
          ? matchingLabels(item.id).length > 0
          : [
              item.title,
              item.description,
              item.category,
              ...item.tags,
              ...item.languageIds,
              ...item.languageIds.map(languageName),
            ].some((value) => value.toLocaleLowerCase().includes(term))))
  );
  const groups: [keyof Filters, string, { id: string; name: string }[]][] = [
    [
      'categories',
      '分类',
      [...new Set(summaries.map((item) => item.category))].map((id) => ({
        id,
        name: id,
      })),
    ],
    [
      'paradigms',
      '范式',
      [...new Set(summaries.flatMap((item) => item.paradigms))].map((id) => ({
        id,
        name: id,
      })),
    ],
    [
      'difficulty',
      '难度',
      Object.entries(difficulty).map(([id, name]) => ({ id, name })),
    ],
    [
      'languages',
      '语言',
      [...new Set(summaries.flatMap((item) => item.languageIds))].map((id) => ({
        id,
        name: languageName(id),
      })),
    ],
  ];
  function toggle(key: keyof Filters, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  }
  return (
    <section aria-label="习语目录">
      <div className="toolbar">
        <input
          className="search"
          type="search"
          aria-label="搜索习语"
          placeholder="搜索特性、实现代码或语言…"
          value={query}
          onChange={(event) => {
            setError(false);
            setQuery(event.target.value);
          }}
        />
        <label>
          排序{' '}
          <select
            aria-label="排序"
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
          >
            <option value="original">原始顺序</option>
            <option value="title">名称</option>
            <option value="difficulty">难度由低到高</option>
            <option value="implementations">实现数量</option>
          </select>
        </label>
        <button
          disabled={initialFavoritesOnly}
          aria-pressed={initialFavoritesOnly || favoritesOnly}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          只看收藏
        </button>
        <button
          onClick={() => {
            setQuery('');
            setFilters(emptyFilters());
            setSort('original');
            setFavoritesOnly(initialFavoritesOnly);
            setError(false);
          }}
        >
          重置
        </button>
      </div>
      <details className="filter-panel">
        <summary>筛选条件（{Object.values(filters).flat().length}）</summary>
        <p>
          同组多选满足任一项，不同组同时满足。语言筛选表示已收录实现，不表示语言支持边界。
        </p>
        <div className="filter-groups">
          {groups.map(([key, title, options]) => (
            <fieldset key={key}>
              <legend>{title}</legend>
              {options.map((option) => (
                <label key={option.id}>
                  <input
                    type="checkbox"
                    checked={filters[key].includes(option.id)}
                    onChange={() => toggle(key, option.id)}
                  />
                  {option.name}
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      </details>
      {!!Object.values(filters).flat().length && (
        <div className="active-filters" aria-label="已选条件">
          {groups.flatMap(([key, title, options]) =>
            filters[key].map((value) => (
              <button
                key={`${key}:${value}`}
                aria-label={`移除${title}：${options.find((option) => option.id === value)?.name || value}`}
                onClick={() => toggle(key, value)}
              >
                {options.find((option) => option.id === value)?.name || value} ×
              </button>
            ))
          )}
        </div>
      )}
      {term && !index && !error && (
        <p role="status">正在加载代码搜索索引，先显示摘要匹配…</p>
      )}
      {term && error && (
        <p role="alert">
          代码搜索暂不可用，当前仅匹配摘要。
          <button
            onClick={() => {
              setError(false);
              setRetry((value) => value + 1);
            }}
          >
            重试
          </button>
        </p>
      )}
      <p role="status">{results.length} 个习语</p>
      <div className="catalog" role="list" aria-label="编程习语列表">
        {results.map((item) => (
          <article className="card" role="listitem" key={item.id}>
            <h2>
              <a href={`${base}/idiom/${encodeURIComponent(item.id)}/`}>
                {item.title}
                {favorites.includes(item.id) && (
                  <span aria-label="已收藏"> ★</span>
                )}
              </a>
            </h2>
            <p>{item.description}</p>
            {term && (
              <p aria-label="搜索命中">
                {index
                  ? `命中：${matchingLabels(item.id).join('、')}`
                  : '摘要匹配'}
              </p>
            )}
            <div className="metadata">
              <span className="badge">{item.category}</span>
              <span className="badge">{difficulty[item.difficulty]}</span>
              <span className="badge">{item.languageIds.length} 种实现</span>
              {item.languageIds.map((id) => (
                <span className="badge" key={id}>
                  {languageName(id)}
                </span>
              ))}
            </div>
            <p className="tags">
              {item.tags.map((tag) => (
                <span key={tag}>#{tag} </span>
              ))}
            </p>
          </article>
        ))}
      </div>
      {!results.length && (
        <p className="notice">没有匹配结果。试试清空条件，或换一个关键词。</p>
      )}
    </section>
  );
}
