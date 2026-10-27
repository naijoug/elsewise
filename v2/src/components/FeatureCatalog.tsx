import { useState } from 'react';
import { featureKey, filterFeatures, type FeatureSummary } from '../lib/features';
import { usePreferences } from '../lib/preferences';
import { useLearned } from '../lib/learned';
import { text, type Locale } from '../lib/ui-i18n';
import LearnedButton, { LearnedNotice } from './LearnedButton';

export default function FeatureCatalog({
  features, languages, base, favoritesOnly = false, locale = 'zh',
}: {
  features: FeatureSummary[];
  languages: { id: string; name: string }[];
  base: string;
  favoritesOnly?: boolean;
  locale?: Locale;
}) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [learning, setLearning] = useState('all');
  const { favoriteIdioms } = usePreferences();
  const { ids } = useLearned();
  const visible = filterFeatures(features, query, '', language).filter(
    feature => (!favoritesOnly || favoriteIdioms.includes(featureKey(feature.id))) &&
      (learning === 'all' || ids.includes(featureKey(feature.id)) === (learning === 'learned'))
  );
  return <section aria-label={text(locale, '文档', 'Documents')}>
    <div className="filters">
      <label>{text(locale, '查找文档', 'Find documents')}
        <input type="search" value={query} onChange={event => setQuery(event.target.value)}
          placeholder={text(locale, '继承、泛型、所有权…', 'Inheritance, generics, ownership…')} />
      </label>
      <div className="toolbar feature-toolbar">
        <label>{text(locale, '对比语言', 'Compare languages')}
          <select aria-label={text(locale, '对比语言', 'Compare languages')} value={language} onChange={event => setLanguage(event.target.value)}>
            <option value="">{text(locale, '全部语言', 'All languages')}</option>
            {languages.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>{text(locale, '学习状态', 'Learning status')}
          <select aria-label={text(locale, '学习状态', 'Learning status')} value={learning} onChange={event => setLearning(event.target.value)}>
            <option value="all">{text(locale, '全部', 'All')}</option>
            <option value="learned">{text(locale, '已学会', 'Learned')}</option>
            <option value="unlearned">{text(locale, '未学会', 'Not learned')}</option>
          </select>
        </label>
        <button onClick={() => { setQuery(''); setLanguage(''); setLearning('all'); }}>{text(locale, '重置筛选', 'Reset filters')}</button>
      </div>
    </div>
    <p role="status" className="result-count">{text(locale, `${visible.length} 篇文档`, `${visible.length} documents`)}</p>
    <LearnedNotice locale={locale} />
    {!visible.length && <p className="notice">{text(locale, '没有匹配的文档，试试重置筛选。', 'No matching documents. Try resetting the filters.')}</p>}
    <div className="catalog-grid">{visible.map(feature => <article className="card" key={feature.id}>
      {favoriteIdioms.includes(featureKey(feature.id)) && <span className="badge">{text(locale, '已收藏', 'Favorited')}</span>}
      <h2><a href={`${base}/feature/${feature.id}/`}>{feature.title}</a></h2>
      <p>{feature.description}</p>
      <p className="muted">{text(locale, `已对照 ${feature.languageIds.length} 门语言`, `${feature.languageIds.length} languages compared`)}</p>
      <div className="badges">{feature.tags.map(tag => <span className="badge" key={tag}>{tag}</span>)}</div>
      <LearnedButton id={featureKey(feature.id)} title={feature.title} locale={locale} />
    </article>)}</div>
  </section>;
}
