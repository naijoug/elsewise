/** Build-only: never pass entries / code into a client island. */
import data from '../data/features.json';
import practical from '../data/practical-docs.json';
import foundations from '../data/foundations.json';
import collections from '../data/collections.json';
import paths from '../data/paths.json';
import stringDocs from '../data/strings.json';
import { idioms, languages } from './content';
import type { Feature } from './features';

function object(
  value: unknown,
  path: string
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`${path}: must be an object`);
}
function string(
  value: unknown,
  path: string,
  allowEmpty = false
): asserts value is string {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim()))
    throw new Error(
      `${path}: must be ${allowEmpty ? 'a string' : 'a non-empty string'}`
    );
}
function array(
  value: unknown,
  path: string,
  allowEmpty = false
): asserts value is unknown[] {
  if (!Array.isArray(value) || (!allowEmpty && !value.length))
    throw new Error(
      `${path}: must be ${allowEmpty ? 'an array' : 'a non-empty array'}`
    );
}
function strings(
  value: unknown,
  path: string,
  allowEmpty = false
): asserts value is string[] {
  array(value, path, allowEmpty);
  value.forEach((item, i) => string(item, `${path}[${i}]`));
}
function identifier(value: unknown, path: string): asserts value is string {
  string(value, path);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
    throw new Error(`${path}: must be a lowercase kebab-case identifier`);
}
function sourceUrl(value: unknown, path: string) {
  string(value, path);
  try {
    const url = new URL(value);
    if (
      value !== value.trim() ||
      !value.startsWith('https://') ||
      url.protocol !== 'https:' ||
      !url.hostname ||
      url.username ||
      url.password
    )
      throw new Error();
  } catch {
    throw new Error(
      `${path}: must be an absolute HTTPS URL without credentials`
    );
  }
}
function checkedDate(value: unknown, path: string) {
  string(value, path);
  const date = new Date(`${value}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    throw new Error(`${path}: must be a valid YYYY-MM-DD date`);
}

/** Validate raw JSON and resolved translations before either reaches a template. */
export function validateFeatures(values: unknown): asserts values is Feature[] {
  array(values, 'Features');
  const ids = new Set<string>();
  const knownLanguages = new Set(languages.map((language) => language.id));
  const knownIdioms = new Set(idioms.map((idiom) => idiom.id));
  for (const [i, feature] of values.entries()) {
    object(feature, `Features[${i}]`);
    identifier(feature.id, `Features[${i}].id`);
    if (ids.has(feature.id))
      throw new Error(`Duplicate feature id: '${feature.id}'`);
    ids.add(feature.id);
  }
  for (const feature of values) {
    object(feature, 'Feature');
    const path = `Feature '${feature.id}'`;
    for (const field of ['title', 'description', 'scopeNote'])
      string(feature[field], `${path}: ${field}`);
    strings(feature.tags, `${path}: tags`);
    if (!['common', 'shared', 'specific'].includes(feature.scope as string))
      throw new Error(`${path}: Invalid feature scope '${feature.scope}'`);
    for (const field of ['related', 'idiomIds'] as const) {
      const links = feature[field];
      strings(links, `${path}: ${field}`, true);
      const seen = new Set<string>();
      for (const id of links) {
        identifier(id, `${path}: ${field}`);
        if (seen.has(id))
          throw new Error(`${path}: Duplicate ${field} '${id}'`);
        seen.add(id);
        if (
          field === 'related'
            ? !ids.has(id) || id === feature.id
            : !knownIdioms.has(id)
        )
          throw new Error(
            `${path}: Unknown related ${field === 'related' ? 'feature' : 'idiom'} '${id}'`
          );
      }
    }
    array(feature.entries, `${path}: entries`);
    const langIds = new Set<string>();
    for (const [i, entry] of feature.entries.entries()) {
      object(entry, `${path}: entries[${i}]`);
      identifier(entry.languageId, `${path}: entries[${i}].languageId`);
      const entryPath = `${path} entry '${entry.languageId}'`;
      if (!knownLanguages.has(entry.languageId))
        throw new Error(`${entryPath}: Unknown language`);
      if (langIds.has(entry.languageId))
        throw new Error(
          `${path}: Duplicate feature language '${entry.languageId}'`
        );
      langIds.add(entry.languageId);
      if (
        !['native', 'idiomatic', 'not-applicable', 'undocumented'].includes(
          entry.status as string
        )
      )
        throw new Error(
          `${entryPath}: Invalid support status '${entry.status}'`
        );
      for (const field of ['baseline', 'summary', 'versionNotes'])
        string(entry[field], `${entryPath}: ${field}`);
      // Absence of an applicable example is explicit, never inferred from empty code.
      string(
        entry.code,
        `${entryPath}: code`,
        entry.status === 'not-applicable' || entry.status === 'undocumented'
      );
      array(entry.sources, `${entryPath}: sources`);
      for (const [i, source] of entry.sources.entries()) {
        const sourcePath = `${entryPath}: sources[${i}]`;
        object(source, sourcePath);
        string(source.title, `${sourcePath}.title`);
        string(source.section, `${sourcePath}.section`);
        sourceUrl(source.url, `${sourcePath}.url`);
        checkedDate(source.checkedAt, `${sourcePath}.checkedAt`);
      }
    }
    if (feature.scope === 'common' && langIds.size !== knownLanguages.size)
      throw new Error(
        `${path}: Common features require a reviewed entry for every catalog language`
      );
  }
}
const featureData: unknown = [
  ...foundations,
  ...stringDocs,
  ...collections,
  ...practical,
  ...paths,
  ...data,
];
validateFeatures(featureData);
export const features = featureData;
export const featureSummaries = features.map(({ entries, ...summary }) => ({
  ...summary,
  languageIds: entries.map((entry) => entry.languageId),
  languageNames: entries.map(
    (entry) =>
      languages.find((language) => language.id === entry.languageId)!.name
  ),
}));
