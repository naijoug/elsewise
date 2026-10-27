import { useState } from 'react';
import { featureKey, filterFeatures, scopeLabels, type FeatureSummary } from '../lib/features';
import { usePreferences } from '../lib/preferences';
import { useLearned } from '../lib/learned';
import LearnedButton, { LearnedNotice } from './LearnedButton';
export default function FeatureCatalog({ features, languages, base, favoritesOnly = false }: { features: FeatureSummary[]; languages: { id: string; name: string }[]; base: string; favoritesOnly?: boolean }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('');
  const [language, setLanguage] = useState('');
  const [learning, setLearning] = useState('all');
  const { favoriteIdioms } = usePreferences();
  const { ids } = useLearned();
  const visible = filterFeatures(features, query, scope, language).filter(feature => (!favoritesOnly || favoriteIdioms.includes(featureKey(feature.id))) && (learning === 'all' || ids.includes(featureKey(feature.id)) === (learning === 'learned')));
  return <section aria-label="语言特性目录">
    <div className="filters">
      <label>查找特性<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="继承、泛型、所有权…" /></label>
      <div className="toolbar feature-toolbar">
        <label>概念标签<select value={scope} onChange={event => setScope(event.target.value)}><option value="">全部标签</option>{Object.entries(scopeLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label>对照语言<select value={language} onChange={event => setLanguage(event.target.value)}><option value="">全部语言</option>{languages.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>学习状态<select value={learning} onChange={event => setLearning(event.target.value)}><option value="all">全部</option><option value="learned">已学会</option><option value="unlearned">未学会</option></select></label>
        <button onClick={() => { setQuery(''); setScope(''); setLanguage(''); setLearning('all'); }}>重置特性筛选</button>
      </div>
    </div>
    <p role="status" className="result-count">{visible.length} 个特性概念</p>
    <LearnedNotice />
    {!visible.length && <p className="notice">没有匹配的特性。可以重置筛选；空结果不表示某门语言没有该能力。</p>}
    <div className="catalog-grid">{visible.map(feature => <article className="card" key={feature.id}>
      <div className="badges"><span className="badge">{scopeLabels[feature.scope]}</span>{favoriteIdioms.includes(featureKey(feature.id)) && <span className="badge">已收藏</span>}</div>
      <h2><a href={`${base}/feature/${feature.id}/`}>{feature.title}</a></h2><p>{feature.description}</p>
      <p className="muted">已对照 {feature.languageIds.length} 门语言</p><div className="badges">{feature.tags.map(tag => <span className="badge" key={tag}>{tag}</span>)}</div>
      <LearnedButton id={featureKey(feature.id)} title={feature.title} />
    </article>)}</div>
  </section>;
}
