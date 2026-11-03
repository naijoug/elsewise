/** Build-only: never pass entries / code into a client island. */
import data from '../data/features.json';
import practical from '../data/practical-docs.json';
import foundations from '../data/foundations.json';
import collections from '../data/collections.json';
import paths from '../data/paths.json';
import { idioms, languages } from './content';
import type { Feature } from './features';
export const features = [
  ...foundations,
  ...collections,
  ...practical,
  ...paths,
  ...data,
] as Feature[];
export function validateFeatures(values: Feature[]) {
  const ids = new Set<string>();
  for (const feature of values) {
    if (ids.has(feature.id)) {
      throw new Error(`Duplicate feature id: '${feature.id}'`);
    }
    ids.add(feature.id);
  }
  const idList = [...ids];
  for (const feature of values) {
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(feature.id) ||
      !feature.title ||
      !feature.description ||
      !feature.scopeNote
    )
      throw new Error(`Feature '${feature.id}': Invalid feature metadata`);
    if (!['common', 'shared', 'specific'].includes(feature.scope))
      throw new Error(
        `Feature '${feature.id}': Invalid feature scope '${feature.scope}'`
      );
    const langIds = new Set<string>();
    for (const entry of feature.entries) {
      if (langIds.has(entry.languageId)) {
        throw new Error(
          `Feature '${feature.id}': Duplicate feature language '${entry.languageId}'`
        );
      }
      langIds.add(entry.languageId);
    }
    if (!feature.entries.length) {
      throw new Error(`Feature '${feature.id}': Empty feature`);
    }
    if (
      feature.scope === 'common' &&
      feature.entries.length !== languages.length
    )
      throw new Error(
        `Feature '${feature.id}': Common features require a reviewed entry for every catalog language`
      );
    const unknownRelated = feature.related.find(
      (id) => !idList.includes(id) || id === feature.id
    );
    if (unknownRelated)
      throw new Error(
        `Feature '${feature.id}': Unknown related feature '${unknownRelated}'`
      );
    const unknownIdiom = feature.idiomIds.find(
      (id) => !idioms.some((idiom) => idiom.id === id)
    );
    if (unknownIdiom)
      throw new Error(
        `Feature '${feature.id}': Unknown related idiom '${unknownIdiom}'`
      );
    for (const entry of feature.entries) {
      if (
        !languages.some((language) => language.id === entry.languageId) ||
        !entry.baseline ||
        !entry.summary ||
        !entry.sources.length
      )
        throw new Error(
          `Feature '${feature.id}' entry '${entry.languageId}': Incomplete feature evidence`
        );
      if (
        !['native', 'idiomatic', 'not-applicable', 'undocumented'].includes(
          entry.status
        )
      )
        throw new Error(
          `Feature '${feature.id}' entry '${entry.languageId}': Invalid support status '${entry.status}'`
        );
      for (const source of entry.sources)
        if (
          !source.title ||
          !source.section ||
          !/^https:\/\//.test(source.url) ||
          !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt)
        )
          throw new Error(
            `Feature '${feature.id}' entry '${entry.languageId}': Invalid feature source '${source.title || source.url || 'untitled'}'`
          );
    }
  }
}
validateFeatures(features);
export const featureSummaries = features.map(({ entries, ...summary }) => ({
  ...summary,
  languageIds: entries.map((entry) => entry.languageId),
  languageNames: entries.map(
    (entry) =>
      languages.find((language) => language.id === entry.languageId)!.name
  ),
}));
