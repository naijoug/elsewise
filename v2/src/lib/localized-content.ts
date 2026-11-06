/** Build-only localized content; never serialize implementation bodies to catalog islands. */
import { idioms, languages } from './content';
import { features, validateFeatures } from './feature-content';
import englishData from '../data/english-content.json';
import type { Idiom, Language, Implementation } from '@shared/types';
import type { Feature, FeatureEntry } from './features';
export type Locale = 'zh' | 'en';
const english = englishData as unknown as {
  idioms: Record<
    string,
    Partial<Idiom> & {
      implementations: Record<string, Record<string, unknown>>;
    }
  >;
  languages: Record<string, Partial<Language>>;
  features: Record<
    string,
    Partial<Feature> & { entries: Record<string, Record<string, unknown>> }
  >;
};
const contentCache = new Map<
  Locale,
  ReturnType<typeof buildLocalizedContent>
>();

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function buildLocalizedContent(locale: Locale) {
  const localizedIdioms = idioms.map((item) => {
    if (locale === 'zh') return item;
    const value = english.idioms[item.id];
    if (!value || !nonempty(value.title) || !nonempty(value.description)) {
      throw new Error(`Missing English idiom '${item.id}'`);
    }
    return {
      ...item,
      ...value,
      implementations: item.implementations.map((entry) => {
        const entryEn = value.implementations?.[entry.languageId] as
          | Partial<Implementation>
          | undefined;
        if (!entryEn || !entryEn.explanation?.trim()) {
          throw new Error(
            `Missing English implementation for idiom '${item.id}' (${entry.languageId})`
          );
        }
        return {
          ...entry,
          ...entryEn,
        };
      }),
    } as Idiom;
  });
  const localizedLanguages = languages.map((item) => {
    if (locale === 'zh') return item;
    const langEn = english.languages[item.id];
    if (!langEn || !langEn.description?.trim()) {
      throw new Error(`Missing English language '${item.id}'`);
    }
    return { ...item, ...langEn };
  });
  const langNameMap = new Map(languages.map((l) => [l.id, l.name]));
  const localizedFeatures = features.map((item) => {
    if (locale === 'zh') return item;
    const value =
      (item as Feature & { en?: Partial<Feature> }).en ||
      english.features[item.id];
    if (!value || !nonempty(value.title) || !nonempty(value.description)) {
      throw new Error(`Missing English document '${item.id}'`);
    }
    return {
      ...item,
      ...value,
      entries: item.entries.map((entry) => {
        const entryEn =
          (entry as typeof entry & { en?: Partial<FeatureEntry> }).en ||
          (value.entries as unknown as Record<string, Partial<FeatureEntry>>)?.[
            entry.languageId
          ];
        if (
          !entryEn ||
          !nonempty(entryEn.summary) ||
          !nonempty(entryEn.versionNotes) ||
          !nonempty(entryEn.baseline)
        ) {
          throw new Error(
            `Missing English entry for document '${item.id}' (${entry.languageId})`
          );
        }
        return {
          ...entry,
          ...entryEn,
        };
      }),
    } as Feature;
  });
  // Validate the resolved locale too: translations can override code and evidence.
  validateFeatures(localizedFeatures);
  return {
    idioms: localizedIdioms,
    languages: localizedLanguages,
    features: localizedFeatures,
    catalog: localizedIdioms.map(({ implementations, ...summary }) => ({
      ...summary,
      languageIds: implementations.map((entry) => entry.languageId),
    })),
    featureSummaries: localizedFeatures.map(({ entries, ...summary }) => ({
      ...summary,
      languageIds: entries.map((e) => e.languageId),
      languageNames: entries.map(
        (e) => langNameMap.get(e.languageId) || e.languageId
      ),
    })),
  };
}

export function content(locale: Locale) {
  let cached = contentCache.get(locale);
  if (!cached) {
    cached = buildLocalizedContent(locale);
    contentCache.set(locale, cached);
  }
  return cached;
}
export function routeBase(locale: Locale) {
  return (
    import.meta.env.BASE_URL.replace(/\/$/, '') + (locale === 'en' ? '/en' : '')
  );
}
