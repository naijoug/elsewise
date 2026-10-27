/** Shared types and metadata only: feature code stays in build-only feature-content. */
export const scopeLabels = { common: '跨语言通用', shared: '部分语言共有', specific: '语言特色' } as const;
export const statusLabels = { native: '原生机制', idiomatic: '惯用替代', 'not-applicable': '不适用此机制', undocumented: '尚未收录' } as const;
export type FeatureScope = keyof typeof scopeLabels;
export type FeatureStatus = keyof typeof statusLabels;
export type FeatureSource = { title: string; url: string; section: string; checkedAt: string };
export type FeatureEntry = { languageId: string; baseline: string; versionNotes: string; status: FeatureStatus; summary: string; code: string; sources: FeatureSource[] };
export type Feature = { id: string; title: string; description: string; scope: FeatureScope; scopeNote: string; tags: string[]; related: string[]; idiomIds: string[]; entries: FeatureEntry[] };
export type FeatureSummary = Omit<Feature, 'entries'> & { languageIds: string[]; languageNames: string[] };
export const featureKey = (id: string) => `feature:${id}`;
export function filterFeatures(features: FeatureSummary[], query: string, scope: string, language: string) {
  const q = query.trim().toLocaleLowerCase();
  return features.filter(feature => (!scope || feature.scope === scope) && (!language || feature.languageIds.includes(language)) && (!q || [feature.title, feature.description, ...feature.tags, ...feature.languageIds, ...feature.languageNames].join(' ').toLocaleLowerCase().includes(q)));
}
