/** Build-only adapter: one curriculum, independent of the historical source format. */
import { content, type Locale } from './localized-content';
export const chapters = [
  {
    id: 'basics',
    zh: '基础语法',
    en: 'Language basics',
    items: [
      'f:syntax-basics',
      'f:variables',
      'f:constants',
      'f:basic-types',
      'f:operators',
      'f:conditions',
      'f:loops',
      'string-interpolation',
    ],
  },
  {
    id: 'functions',
    zh: '函数与计算',
    en: 'Functions & computation',
    items: [
      'f:functions',
      'f:closures',
      'recursion',
      'memoization',
      'lazy-evaluation',
    ],
  },
  {
    id: 'collections',
    zh: '集合与迭代',
    en: 'Collections & iteration',
    items: [
      'f:sequence-collections',
      'f:key-value-maps',
      'destructuring',
      'array-map',
      'array-filter',
      'f:python-comprehensions',
      'iterator-pattern',
      'f:javascript-generators',
      'pipeline-pattern',
    ],
  },
  {
    id: 'types',
    zh: '类型与数据建模',
    en: 'Types & data modeling',
    items: [
      'f:generics',
      'null-safety',
      'f:swift-optionals',
      'pattern-matching',
      'f:typescript-discriminated-unions',
      'immutability',
    ],
  },
  {
    id: 'objects',
    zh: '对象与协作',
    en: 'Objects & collaboration',
    items: [
      'f:inheritance',
      'f:polymorphism',
      'f:php-traits',
      'f:ruby-open-classes',
      'f:kotlin-delegated-properties',
      'method-chaining',
      'builder-pattern',
      'dependency-injection',
      'decorator-pattern',
      'observer-pattern',
      'f:csharp-events',
      'singleton-pattern',
    ],
  },
  {
    id: 'safety',
    zh: '错误与资源管理',
    en: 'Errors & resources',
    items: [
      'error-handling',
      'f:java-checked-exceptions',
      'f:rust-ownership',
      'f:cpp-raii',
    ],
  },
  {
    id: 'concurrency',
    zh: '异步与并发',
    en: 'Async & concurrency',
    items: ['async-await', 'f:go-goroutines-channels'],
  },
  {
    id: 'files',
    zh: '文件与目录',
    en: 'Files & directories',
    items: ['f:read-text-file', 'f:write-text-file'],
  },
  { id: 'data', zh: '数据格式', en: 'Data formats', items: ['f:json'] },
  { id: 'network', zh: '网络请求', en: 'Networking', items: ['f:http-get'] },
];
export type KnowledgeItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  chapter: string;
  languageIds: string[];
  search: string;
  example?: { title: string; href: string };
};
export function knowledge(locale: Locale): KnowledgeItem[] {
  const { features, idioms, languages } = content(locale);
  return chapters.flatMap((chapter) =>
    chapter.items.map((key) => {
      const feature = key.startsWith('f:');
      const id = feature ? key.slice(2) : key;
      const item = feature
        ? features.find((x) => x.id === id)
        : idioms.find((x) => x.id === id);
      if (!item) throw new Error(`Missing knowledge item ${key}`);
      const languageIds =
        'entries' in item
          ? item.entries.map((e) => e.languageId)
          : item.implementations.map((e) => e.languageId);
      return {
        id: feature ? `feature:${id}` : id,
        title: item.title,
        description: item.description,
        href: `/${feature ? 'feature' : 'idiom'}/${id}/`,
        chapter: chapter.id,
        languageIds,
        search: [
          item.title,
          item.description,
          ...item.tags,
          chapter[locale],
          ...languageIds.flatMap((id) => [
            id,
            languages.find((l) => l.id === id)!.name,
          ]),
          ...(id === 'closures'
            ? [idioms.find((i) => i.id === 'closure')!.title]
            : []),
        ]
          .join(' ')
          .toLocaleLowerCase(),
        ...(id === 'closures'
          ? {
              example: {
                title:
                  locale === 'en'
                    ? 'Stateful closure examples'
                    : '有状态闭包示例',
                href: '/idiom/closure/',
              },
            }
          : {}),
      };
    })
  );
}
export function knowledgeSearch(locale: Locale) {
  const { features, idioms } = content(locale);
  return knowledge(locale).map((item) => {
    const feature = features.find((f) => `feature:${f.id}` === item.id);
    const idiom = idioms.find(
      (i) =>
        i.id === item.id ||
        (item.id === 'feature:closures' && i.id === 'closure')
    );
    return {
      id: item.id,
      text: [
        item.search,
        ...(feature?.entries.flatMap((e) => [
          e.code || '',
          e.summary,
          e.versionNotes,
        ]) || []),
        ...(idiom?.implementations.flatMap((e) => [e.code, e.explanation]) ||
          []),
      ]
        .join(' ')
        .toLocaleLowerCase(),
    };
  });
}
