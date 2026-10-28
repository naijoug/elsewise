/** Build-only: never pass entries / code into a client island. */
import data from '../data/features.json';
import practical from '../data/practical-docs.json';
import foundations from '../data/foundations.json';
import collections from '../data/collections.json';
import { idioms, languages } from './content';
import type { Feature } from './features';
export const features = [...foundations, ...collections, ...practical, ...data] as Feature[];
export function validateFeatures(values: Feature[]) {
  const ids = values.map(feature => feature.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate feature id');
  for (const feature of values) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(feature.id) || !feature.title || !feature.description || !feature.scopeNote) throw new Error('Invalid feature metadata');
    if (!['common', 'shared', 'specific'].includes(feature.scope)) throw new Error('Invalid feature scope');
    if (new Set(feature.entries.map(entry => entry.languageId)).size !== feature.entries.length) throw new Error('Duplicate feature language');
    if (!feature.entries.length) throw new Error('Empty feature');
    if (feature.scope === 'common' && feature.entries.length !== languages.length) throw new Error('Common features require a reviewed entry for every catalog language');
    if (feature.related.some(id => !ids.includes(id) || id === feature.id)) throw new Error('Unknown related feature');
    if (feature.idiomIds.some(id => !idioms.some(idiom => idiom.id === id))) throw new Error('Unknown related idiom');
    for (const entry of feature.entries) {
      if (!languages.some(language => language.id === entry.languageId) || !entry.baseline || !entry.summary || !entry.sources.length) throw new Error('Incomplete feature evidence');
      if (!['native', 'idiomatic', 'not-applicable', 'undocumented'].includes(entry.status)) throw new Error('Invalid support status');
      for (const source of entry.sources) if (!source.title || !source.section || !/^https:\/\//.test(source.url) || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt)) throw new Error('Invalid feature source');
    }
  }
}
validateFeatures(features);
export const featureSummaries = features.map(({ entries, ...summary }) => ({ ...summary, languageIds: entries.map(entry => entry.languageId), languageNames: entries.map(entry => languages.find(language => language.id === entry.languageId)!.name) }));
