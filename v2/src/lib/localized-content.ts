/** Build-only localized content; never serialize implementation bodies to catalog islands. */
import { idioms, languages } from './content';
import { features } from './feature-content';
import englishData from '../data/english-content.json';
import type { Idiom, Language } from '../../../src/types';
import type { Feature } from './features';
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
export function content(locale: Locale) {
  const localizedIdioms = idioms.map((item) => {
    if (locale === 'zh') return item;
    const value = english.idioms[item.id];
    if (!value) throw new Error(`Missing English idiom ${item.id}`);
    return {
      ...item,
      ...value,
      implementations: item.implementations.map((entry) => ({
        ...entry,
        ...value.implementations[entry.languageId],
      })),
    } as Idiom;
  });
  const localizedLanguages = languages.map((item) =>
    locale === 'zh' ? item : { ...item, ...english.languages[item.id] }
  );
  const localizedFeatures = features.map((item) => {
    if (locale === 'zh') return item;
    const value =
      (item as Feature & { en?: Partial<Feature> }).en ||
      english.features[item.id];
    if (!value) throw new Error(`Missing English document ${item.id}`);
    return {
      ...item,
      ...value,
      entries: item.entries.map((entry) => ({
        ...entry,
        ...((entry as typeof entry & { en?: object }).en ||
          (value.entries as unknown as Record<string, object>)[
            entry.languageId
          ]),
      })),
    } as Feature;
  });
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
        (e) => languages.find((l) => l.id === e.languageId)!.name
      ),
    })),
  };
}
export function routeBase(locale: Locale) {
  return (
    import.meta.env.BASE_URL.replace(/\/$/, '') + (locale === 'en' ? '/en' : '')
  );
}
export const modules = [
  {
    id: 'files',
    zh: '文件与目录',
    en: 'Files & directories',
    ids: ['read-text-file', 'write-text-file'],
  },
  { id: 'data', zh: '数据格式', en: 'Data formats', ids: ['json'] },
  { id: 'network', zh: '网络请求', en: 'Networking', ids: ['http-get'] },
  {
    id: 'functions',
    zh: '函数与迭代',
    en: 'Functions & iteration',
    ids: ['closures', 'javascript-generators', 'python-comprehensions'],
  },
  {
    id: 'types',
    zh: '类型与数据建模',
    en: 'Types & modeling',
    ids: ['generics', 'typescript-discriminated-unions', 'swift-optionals'],
  },
  {
    id: 'objects',
    zh: '对象与行为',
    en: 'Objects & behavior',
    ids: [
      'inheritance',
      'polymorphism',
      'ruby-open-classes',
      'csharp-events',
      'kotlin-delegated-properties',
      'php-traits',
    ],
  },
  {
    id: 'safety',
    zh: '错误与资源管理',
    en: 'Errors & resources',
    ids: ['java-checked-exceptions', 'rust-ownership', 'cpp-raii'],
  },
  {
    id: 'concurrency',
    zh: '并发',
    en: 'Concurrency',
    ids: ['go-goroutines-channels'],
  },
];
