export type Locale = 'zh' | 'en';

export interface Messages {
  layout: {
    brandName: string;
    siteDescription: string;
    skipLink: string;
    mainNav: string;
    switchLocale: string;
    localeName: string;
    githubLabel: string;
    footerText: string;
    search: string;
    navKnowledge: string;
    navLanguages: string;
    navFavorites: string;
  };
  collection: {
    favoritesTitle: string;
    favoritesDesc: string;
    favoritesNoScript: string;
    languagesTitle: string;
    languagesDesc: string;
    allLanguages: string;
    languageReference: string;
    baselineLabel: string;
    typeSystemLabel: string;
    paradigmsLabel: string;
    metadataDisclaimer: string;
    typeSystems: {
      static: string;
      dynamic: string;
      gradual: string;
    };
    knowledgeTitle: string;
    knowledgeDesc: string;
    docLink: string;
    newWindow: string;
  };
  index: {
    title: string;
    heading: string;
    subtitle: string;
    topicsCount: string;
    languagesCount: string;
  };
  article: {
    backToDirectory: string;
    unrunDisclaimer: string;
    idiomDisclaimer: string;
    noScriptNotice: string;
    exampleCode: string;
    envBoundaries: string;
    sourcesAndDocs: string;
    reviewedAt: string;
    continueReading: string;
    relatedDocs: string;
    howItWorks: string;
    expectedOutput: string;
    errorOutput: string;
    designRationale: string;
    advantages: string;
    tradeoffs: string;
    references: string;
    statusLabels: {
      native: string;
      idiomatic: string;
      'not-applicable': string;
      undocumented: string;
    };
    statefulClosure: string;
    documentSubject: string;
  };
  notFound: {
    title: string;
    heading: string;
    message: string;
    browseKnowledge: string;
  };
  sidebar: {
    contents: string;
    allTopics: string;
  };
}

const zhMessages: Messages = {
  layout: {
    brandName: '异曲',
    search: '搜索',
    siteDescription: '围绕同一个任务，对照不同编程语言的实现与用法。',
    skipLink: '跳转到主内容',
    mainNav: '主导航',
    switchLocale: '切换至英文',
    localeName: 'English',
    githubLabel: 'GitHub（新窗口）',
    footerText:
      '同一个任务，不同语言的做法。学习记录与收藏仅保存在当前浏览器。',
    navKnowledge: '知识目录',
    navLanguages: '语言',
    navFavorites: '收藏',
  },
  collection: {
    favoritesTitle: '我的收藏',
    favoritesDesc: '仅保存在当前浏览器。学习记录与收藏分开保存。',
    favoritesNoScript: '启用 JavaScript 后可读取当前浏览器的收藏。',
    languagesTitle: '编程语言',
    languagesDesc: '查看各语言已收录的文档。收录范围不代表语言能力边界。',
    allLanguages: '全部语言',
    languageReference: '语言资料',
    baselineLabel: '资料记录版本',
    typeSystemLabel: '类型系统',
    paradigmsLabel: '编程范式',
    metadataDisclaimer:
      '元信息为资料记录基线，不表示当前最新版本或完整能力范围。',
    typeSystems: {
      static: '静态类型',
      dynamic: '动态类型',
      gradual: '渐进类型',
    },
    knowledgeTitle: '知识目录',
    knowledgeDesc: '所有知识点，按学习章节统一整理。',
    docLink: '语言文档',
    newWindow: '（新窗口）',
  },
  index: {
    title: '编程知识目录',
    heading: '编程知识目录',
    subtitle: '找到知识点，选择语言，一起看懂不同的实现。',
    topicsCount: '个知识点',
    languagesCount: '种语言',
  },
  article: {
    backToDirectory: '知识目录',
    unrunDisclaimer: '示例未在此执行；尚未提供的实现不代表语言不支持。',
    idiomDisclaimer:
      '这里只列出已收录实现，未收录不代表不支持。输出为静态示例，不是现场执行结果。',
    noScriptNotice:
      '未启用 JavaScript 时显示全部实现；启用后可选择语言与保存学习记录。',
    exampleCode: '示例代码',
    envBoundaries: '环境与边界',
    sourcesAndDocs: '来源与文档',
    reviewedAt: '核查于',
    continueReading: '继续阅读',
    relatedDocs: '相关文档',
    howItWorks: '实现说明',
    expectedOutput: '预期输出（静态示例）',
    errorOutput: '错误输出（静态示例）',
    designRationale: '设计思路',
    advantages: '优点',
    tradeoffs: '权衡与限制',
    references: '参考资料',
    statusLabels: {
      native: '原生机制 / 标准库',
      idiomatic: '库 / 惯用实现',
      'not-applicable': '不适用',
      undocumented: '尚未收录',
    },
    statefulClosure: '有状态闭包示例',
    documentSubject: '文档',
  },
  notFound: {
    title: '页面未找到',
    heading: '这个页面暂时找不到。',
    message: '链接可能已经变更。你可以返回知识目录继续查找。',
    browseKnowledge: '浏览知识目录',
  },
  sidebar: {
    contents: '知识目录',
    allTopics: '全部知识',
  },
};

const enMessages: Messages = {
  layout: {
    brandName: 'Elsewise',
    search: 'Search',
    siteDescription:
      'Learn one task. Compare implementations across programming languages.',
    skipLink: 'Skip to content',
    mainNav: 'Main navigation',
    switchLocale: 'Switch to Chinese',
    localeName: '中文',
    githubLabel: 'GitHub (new window)',
    footerText:
      'One task, many languages. Learning records and favorites stay in this browser.',
    navKnowledge: 'Knowledge',
    navLanguages: 'Languages',
    navFavorites: 'Saved',
  },
  collection: {
    favoritesTitle: 'Your saved reading',
    favoritesDesc:
      'Saved in this browser only. Learning progress is separate from favorites.',
    favoritesNoScript:
      'Enable JavaScript to read favorites stored in this browser.',
    languagesTitle: 'Languages',
    languagesDesc:
      'Explore collected documentation for each language. Coverage is not a measure of language capability.',
    allLanguages: 'All languages',
    languageReference: 'Language reference facts',
    baselineLabel: 'Recorded documentation baseline',
    typeSystemLabel: 'Type system',
    paradigmsLabel: 'Paradigms',
    metadataDisclaimer:
      'Metadata records a baseline, not a claim of the latest release or exhaustive coverage.',
    typeSystems: {
      static: 'Static',
      dynamic: 'Dynamic',
      gradual: 'Gradual',
    },
    knowledgeTitle: 'Knowledge directory',
    knowledgeDesc: 'All topics, organized by what you want to learn.',
    docLink: 'Documentation',
    newWindow: ' (new window)',
  },
  index: {
    title: 'Programming knowledge directory',
    heading: 'Programming knowledge',
    subtitle: 'Find a topic, choose your languages, and compare how it works.',
    topicsCount: 'topics',
    languagesCount: 'languages',
  },
  article: {
    backToDirectory: 'Knowledge directory',
    unrunDisclaimer:
      'Examples have not been run here. An implementation not yet provided does not mean the language lacks support.',
    idiomDisclaimer:
      'Only collected implementations are listed; absence does not mean unsupported. Outputs are static examples, not execution results.',
    noScriptNotice:
      'All implementations are visible without JavaScript. Enable it to select languages and save progress.',
    exampleCode: 'example code',
    envBoundaries: 'Environment & boundaries',
    sourcesAndDocs: 'Sources and documentation',
    reviewedAt: 'Reviewed',
    continueReading: 'Continue reading',
    relatedDocs: 'Related documentation',
    howItWorks: 'How it works',
    expectedOutput: 'Expected output (static example)',
    errorOutput: 'Error output (static example)',
    designRationale: 'Design rationale',
    advantages: 'Advantages',
    tradeoffs: 'Trade-offs',
    references: 'References',
    statusLabels: {
      native: 'Built-in / standard library',
      idiomatic: 'Library / idiomatic approach',
      'not-applicable': 'Not applicable',
      undocumented: 'Not yet documented',
    },
    statefulClosure: 'Stateful closure examples',
    documentSubject: 'document',
  },
  notFound: {
    title: 'Page not found',
    heading: 'This page could not be found.',
    message:
      'The link may have changed. Continue from the knowledge directory.',
    browseKnowledge: 'Browse knowledge',
  },
  sidebar: {
    contents: 'Contents',
    allTopics: 'All topics',
  },
};

const dictionaries: Record<Locale, Messages> = {
  zh: zhMessages,
  en: enMessages,
};

export function getMessages(locale: Locale = 'zh'): Messages {
  return dictionaries[locale] || dictionaries.zh;
}
