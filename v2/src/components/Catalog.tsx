import { text, type Locale } from '../lib/ui-i18n';
import { useEffect, useState } from 'react';
import { usePreferences } from '../lib/preferences';
import { useLearned } from '../lib/learned';
import LearnedButton, { LearnedNotice } from './LearnedButton';
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

export default function Catalog({
  summaries,
  languages = [],
  base,
  initialFavoritesOnly = false,
  locale = 'zh',
}: {
  summaries: Summary[];
  languages?: { id: string; name: string }[];
  base: string;
  initialFavoritesOnly?: boolean;
  locale?: Locale;
}) {
  const difficulty: Record<string, string> = {
    beginner: text(locale, '初级', 'Beginner'),
    intermediate: text(locale, '中级', 'Intermediate'),
    advanced: text(locale, '高级', 'Advanced'),
  };
  const fieldLabels: Record<SearchField, string> = {
    title: text(locale, '标题', 'Title'),
    description: text(locale, '描述', 'Description'),
    category: text(locale, '分类', 'Category'),
    tags: text(locale, '标签', 'Tags'),
    languages: text(locale, '语言', 'Languages'),
    code: text(locale, '代码', 'Code'),
    explanation: text(locale, '说明', 'Explanation'),
  };
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<Sort>('original');
  const [learning, setLearning] = useState<'all' | 'learned' | 'unlearned'>(
    'all'
  );
  const { ids: learned } = useLearned();
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
          .map(([field]) => fieldLabels[field])
      : [];
  };
  const results = filterSummaries(summaries, filters, sort).filter(
    (item) =>
      (learning === 'all' ||
        learned.includes(item.id) === (learning === 'learned')) &&
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
      text(locale, '分类', 'Category'),
      [...new Set(summaries.map((item) => item.category))].map((id) => ({
        id,
        name: id,
      })),
    ],
    [
      'paradigms',
      text(locale, '范式', 'Paradigm'),
      [...new Set(summaries.flatMap((item) => item.paradigms))].map((id) => ({
        id,
        name: id,
      })),
    ],
    [
      'difficulty',
      text(locale, '难度', 'Difficulty'),
      Object.entries(difficulty).map(([id, name]) => ({ id, name })),
    ],
    [
      'languages',
      text(locale, '语言', 'Languages'),
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
    <section aria-label={text(locale, '习语目录', 'Idiom catalog')}>
      <div className="toolbar">
        <input
          className="search"
          type="search"
          aria-label={text(locale, '搜索习语', 'Search idioms')}
          placeholder={text(locale, '搜索特性、实现代码或语言…', 'Search features, code, or languages…')}
          value={query}
          onChange={(event) => {
            setError(false);
            setQuery(event.target.value);
          }}
        />
        <label>
          {text(locale, '排序', 'Sort')}{' '}
          <select
            aria-label={text(locale, '排序', 'Sort')}
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
          >
            <option value="original">{text(locale, '原始顺序', 'Original order')}</option>
            <option value="title">{text(locale, '名称', 'Name')}</option>
            <option value="difficulty">{text(locale, '难度由低到高', 'Difficulty: easy to hard')}</option>
            <option value="implementations">{text(locale, '实现数量', 'Implementation count')}</option>
          </select>
        </label>
        <button
          disabled={initialFavoritesOnly}
          aria-pressed={initialFavoritesOnly || favoritesOnly}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          {text(locale, '只看收藏', 'Favorites only')}
        </button>
        <button
          onClick={() => {
            setQuery('');
            setFilters(emptyFilters());
            setSort('original');
            setFavoritesOnly(initialFavoritesOnly);
            setLearning('all');
            setError(false);
          }}
        >
          {text(locale, '重置', 'Reset')}
        </button>
      </div>
      <div className="learning-filter" role="group" aria-label={text(locale, '学习状态', 'Learning status')}>
        {(
          [
            ['all', text(locale, '全部', 'All')],
            ['unlearned', text(locale, '未学会', 'Not learned')],
            ['learned', text(locale, '已学会', 'Learned')],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={learning === id}
            onClick={() => setLearning(id)}
          >
            {label}
          </button>
        ))}
        <span>
          {text(locale, '本目录已学会', 'Learned in this catalog')}{' '}
          {summaries.filter((item) => learned.includes(item.id)).length} /{' '}
          {summaries.length}
        </span>
      </div>
      <LearnedNotice locale={locale} />
      <details className="filter-panel">
        <summary>{text(locale, `筛选条件（${Object.values(filters).flat().length}）`, `Filters (${Object.values(filters).flat().length})`)}</summary>
        <p>
          {text(locale, '同组多选满足任一项，不同组同时满足。语言筛选表示已收录实现，不表示语言支持边界。', 'Match any option within a group and all selected groups. Language filters reflect included implementations, not language capability limits.')}
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
        <div className="active-filters" aria-label={text(locale, '已选条件', 'Active filters')}>
          {groups.flatMap(([key, title, options]) =>
            filters[key].map((value) => (
              <button
                key={`${key}:${value}`}
                aria-label={`${text(locale, '移除', 'Remove ')}${title}: ${options.find((option) => option.id === value)?.name || value}`}
                onClick={() => toggle(key, value)}
              >
                {options.find((option) => option.id === value)?.name || value} ×
              </button>
            ))
          )}
        </div>
      )}
      {term && !index && !error && (
        <p role="status">{text(locale, '正在加载代码搜索索引，先显示摘要匹配…', 'Loading code search. Showing summary matches for now…')}</p>
      )}
      {term && error && (
        <p role="alert">
          {text(locale, '代码搜索暂不可用，当前仅匹配摘要。', 'Code search is temporarily unavailable. Only summaries are being matched.')}
          <button
            onClick={() => {
              setError(false);
              setRetry((value) => value + 1);
            }}
          >
            {text(locale, '重试', 'Retry')}
          </button>
        </p>
      )}
      <p role="status">{text(locale, `${results.length} 个习语`, `${results.length} idioms`)}</p>
      <div className="catalog" role="list" aria-label={text(locale, '编程习语列表', 'Programming idioms')}>
        {results.map((item) => (
          <article className="card" role="listitem" key={item.id}>
            <h2>
              <a href={`${base}/idiom/${encodeURIComponent(item.id)}/`}>
                {item.title}
                {favorites.includes(item.id) && (
                  <span aria-label={text(locale, '已收藏', 'Favorited')}> ★</span>
                )}
              </a>
            </h2>
            <LearnedButton id={item.id} title={item.title} locale={locale} />
            <p>{item.description}</p>
            {term && (
              <p aria-label={text(locale, '搜索命中', 'Search matches')}>
                {index
                  ? `${text(locale, '命中：', 'Matches: ')}${matchingLabels(item.id).join(locale === 'zh' ? '、' : ', ')}`
                  : text(locale, '摘要匹配', 'Summary match')}
              </p>
            )}
            <div className="metadata">
              <span className="badge">{item.category}</span>
              <span className="badge">{difficulty[item.difficulty]}</span>
              <span className="badge">{text(locale, `${item.languageIds.length} 种实现`, `${item.languageIds.length} implementations`)}</span>
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
        <p className="notice">{text(locale, '没有匹配结果。试试清空条件，或换一个关键词。', 'No matches. Clear the filters or try another keyword.')}</p>
      )}
    </section>
  );
}
