import ActionIcon from './ActionIcon';
import { useEffect, useRef, useState } from 'react';
import type { KnowledgeItem } from '../lib/knowledge';
import type { Locale } from '../lib/ui-i18n';
import { hasTopic } from '../lib/knowledge-identity';
import { useLearned } from '../lib/learned';
import { usePreferences } from '../lib/preferences';
import LearnedButton, { LearnedNotice } from './LearnedButton';
type Chapter = { id: string; title: string };
export default function KnowledgeCatalog({
  items,
  chapters,
  languages,
  base,
  locale = 'zh',
  savedOnly = false,
}: {
  items: KnowledgeItem[];
  chapters: Chapter[];
  languages: { id: string; name: string }[];
  base: string;
  locale?: Locale;
  savedOnly?: boolean;
}) {
  const en = locale === 'en';
  const t = (zh: string, enText: string) => (en ? enText : zh);
  const languagePicker = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent | PointerEvent) => {
      const picker = languagePicker.current;
      if (!picker?.open) return;
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        picker.open = false;
        picker.querySelector('summary')?.focus();
      } else if (
        event instanceof PointerEvent &&
        !picker.contains(event.target as Node)
      )
        picker.open = false;
    };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', close);
    };
  }, []);
  const [query, setQuery] = useState('');
  const [chapter, setChapter] = useState('');
  const [language, setLanguage] = useState('');
  const [learning, setLearning] = useState('all');
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState<{ id: string; text: string }[] | null>(
    null
  );
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const learned = useLearned();
  const preferences = usePreferences();
  useEffect(() => {
    const restore = () => {
      const p = new URLSearchParams(location.search);
      setQuery(p.get('q') || '');
      setChapter(
        chapters.some((c) => c.id === p.get('chapter')) ? p.get('chapter')! : ''
      );
      setLanguage(
        languages.some((l) => l.id === p.get('language'))
          ? p.get('language')!
          : ''
      );
      setLearning(
        ['learned', 'unlearned'].includes(p.get('learning') || '')
          ? p.get('learning')!
          : 'all'
      );
      setReady(true);
    };
    restore();
    window.addEventListener('popstate', restore);
    window.addEventListener('pageshow', restore);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('pageshow', restore);
    };
  }, [chapters, languages]);
  useEffect(() => {
    if (!ready) return;
    const url = new URL(location.href);
    for (const [key, value] of Object.entries({
      q: query,
      chapter,
      language,
      learning: learning === 'all' ? '' : learning,
    })) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    history.replaceState(history.state, '', url);
    const alternate =
      document.querySelector<HTMLAnchorElement>('.locale-switch');
    if (alternate) {
      const href = new URL(alternate.href);
      href.search = url.search;
      alternate.href = href.href;
    }
  }, [query, chapter, language, learning, ready]);
  useEffect(() => {
    if (!query.trim() || index) return;
    const controller = new AbortController();
    fetch(`${base}/knowledge-index.json`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data: unknown) => {
        if (
          !Array.isArray(data) ||
          !data.every(
            (e) => typeof e.id === 'string' && typeof e.text === 'string'
          )
        )
          throw Error();
        if (!controller.signal.aborted) { setIndex(data); setFailed(false); }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [query, index, retry, base]);
  const term = query.trim().toLocaleLowerCase();
  const visible = items.filter(
    (item) =>
      (!chapter || item.chapter === chapter) &&
      (!language || item.languageIds.includes(language)) &&
      (!savedOnly || hasTopic(preferences.favoriteIdioms, item.id)) &&
      (learning === 'all' ||
        hasTopic(learned.ids, item.id) === (learning === 'learned')) &&
      (!term ||
        item.search.includes(term) ||
        index?.find((e) => e.id === item.id)?.text.includes(term))
  );
  const reset = () => {
    setQuery('');
    setChapter('');
    setLanguage('');
    setLearning('all');
  };
  return (
    <div className="knowledge-workspace">
      <aside className="chapter-rail">
        <p className="rail-label">{t('学习目录', 'CONTENTS')}</p>
        <nav aria-label={t('知识章节', 'Knowledge chapters')}>
          <button aria-pressed={!chapter} onClick={() => setChapter('')}>
            {t('全部知识', 'All topics')}
            <span>{items.length}</span>
          </button>
          {chapters.map((c, n) => (
            <button
              key={c.id}
              aria-pressed={chapter === c.id}
              onClick={() => setChapter(c.id)}
            >
              <span className="chapter-number">
                {String(n + 1).padStart(2, '0')}
              </span>
              {c.title}
              <span>{items.filter((i) => i.chapter === c.id).length}</span>
            </button>
          ))}
        </nav>
        <p className="rail-note">
          {t(
            '从基础到实际用法，按同一个知识点对照不同语言。',
            'From fundamentals to practical tasks. One topic, many languages.'
          )}
        </p>
      </aside>
      <div className="knowledge-content">
        <div className="knowledge-search">
          <label htmlFor="docs-query">
            {t('搜索知识点', 'Search knowledge')}
          </label>
          <input
            id="docs-query"
            type="search"
            value={query}
            placeholder={t(
              '变量、函数、文件读写…',
              'Variables, functions, reading files…'
            )}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="knowledge-toolbar">
          <div
            className="learning-tabs"
            role="group"
            aria-label={t('学习状态', 'Learning status')}
          >
            {[
              ['all', t('全部', 'All')],
              ['unlearned', t('未学会', 'Not learned')],
              ['learned', t('已学会', 'Learned')],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-pressed={learning === id}
                onClick={() => setLearning(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <details className="knowledge-language" ref={languagePicker}>
            <summary>
              {language
                ? languages.find((l) => l.id === language)!.name
                : t('全部语言', 'All languages')}
            </summary>
            <div
              role="group"
              aria-label={t('按语言筛选', 'Filter by language')}
            >
              <button aria-pressed={!language} onClick={() => setLanguage('')}>
                {t('全部语言', 'All languages')}
              </button>
              {languages.map((l) => (
                <button
                  key={l.id}
                  aria-pressed={language === l.id}
                  onClick={() => setLanguage(l.id)}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </details>
          <button className="reset-knowledge icon-action" aria-label={t('重置', 'Reset')} onClick={reset}>
            <ActionIcon name="reset" />
            <span className="action-tip" aria-hidden="true">{t('重置', 'Reset')}</span>
          </button>
        </div>
        <div className="knowledge-status" role="status">
          <span>
            {visible.length} {t('个知识点', 'topics')}
            {chapter
              ? ` · ${chapters.find((c) => c.id === chapter)?.title}`
              : ''}
          </span>
          <span>
            {items.filter((i) => hasTopic(learned.ids, i.id)).length}/
            {items.length} {t('已学会', 'learned')}
          </span>
        </div>
        {failed && (
          <p role="status">
            {t(
              '全文搜索暂不可用，仍可搜索标题与摘要。',
              'Full-text search unavailable. Titles and summaries still work.'
            )}{' '}
            <button onClick={() => setRetry((n) => n + 1)}>
              {t('重试', 'Retry')}
            </button>
          </p>
        )}
        {!visible.length && (
          <section className="knowledge-empty">
            <h2>{t('没有匹配的知识点', 'No matching topics')}</h2>
            <p>
              {t(
                '试试其他关键词，或清除筛选。未收录不代表语言不支持。',
                'Try another term or clear filters. Missing coverage does not mean unsupported.'
              )}
            </p>
            <button onClick={reset}>{t('清除筛选', 'Clear filters')}</button>
          </section>
        )}
        {chapters.map((c, n) => {
          const rows = visible.filter((i) => i.chapter === c.id);
          return (
            rows.length > 0 && (
              <section
                className="knowledge-chapter"
                key={c.id}
                aria-labelledby={`chapter-${c.id}`}
              >
                <header>
                  <span className="chapter-number">
                    {String(n + 1).padStart(2, '0')}
                  </span>
                  <h2 id={`chapter-${c.id}`}>{c.title}</h2>
                  <span>{rows.length}</span>
                </header>
                <ul>
                  {rows.map((item) => (
                    <li key={item.id} data-knowledge-id={item.id}>
                      <div className="knowledge-row-text">
                        <a
                          className="knowledge-title"
                          href={`${base}${item.href}`}
                        >
                          {item.title}
                          <span aria-hidden="true">→</span>
                        </a>
                        <p>{item.description}</p>
                        <div className="knowledge-meta">
                          <span
                            title={item.languageIds
                              .map(
                                (id) => languages.find((l) => l.id === id)?.name
                              )
                              .join(', ')}
                          >
                            {item.languageIds.length}{' '}
                            {t('种语言可对照', 'languages to compare')}
                          </span>
                          {item.example && (
                            <a href={`${base}${item.example.href}`}>
                              {item.example.title}
                            </a>
                          )}
                          {hasTopic(preferences.favoriteIdioms, item.id) && (
                            <span>{t('★ 已收藏', '★ Saved')}</span>
                          )}
                        </div>
                      </div>
                      <LearnedButton
                        id={item.id}
                        title={item.title}
                        locale={locale}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )
          );
        })}
        <LearnedNotice locale={locale} />
        <p className="doc-context">
          {t(
            '目录持续补充中，不是完整语言手册。只统计已收录实现，未收录不代表不支持。',
            'This directory is growing, not an exhaustive manual. Counts show collected implementations, not language capabilities.'
          )}
        </p>
      </div>
    </div>
  );
}
