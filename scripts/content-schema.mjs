/** Build-time snapshot validation. Does not establish code correctness or mutate content. */
export class ContentValidationError extends Error {
  constructor(issues) {
    super(
      `Invalid Elsewise content (${issues.length} issues):\n${issues.map((x) => `- ${x}`).join('\n')}`
    );
    this.name = 'ContentValidationError';
    this.issues = issues;
  }
}
export function validateContent(idioms, languages) {
  const issues = [];
  const fail = (p, message) => issues.push(`${p}: ${message}`);
  const object = (v, p) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
      fail(p, 'must be an object');
      return false;
    }
    return true;
  };
  const string = (v, p, empty = false) => {
    if (typeof v !== 'string' || (!empty && !v.trim())) {
      fail(p, empty ? 'must be a string' : 'must be a non-empty string');
      return false;
    }
    return true;
  };
  const id = (v, p) => {
    if (string(v, p) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v))
      fail(p, 'must be a lowercase kebab-case identifier');
  };
  const array = (v, p, nonempty = true) => {
    if (!Array.isArray(v)) {
      fail(p, 'must be an array');
      return [];
    }
    if (nonempty && !v.length) fail(p, 'must be a non-empty array');
    return v;
  };
  const strings = (v, p, nonempty = true) =>
    array(v, p, nonempty).forEach((x, i) => string(x, `${p}[${i}]`));
  const url = (v, p) => {
    if (!string(v, p)) return;
    try {
      const u = new URL(v);
      if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password)
        fail(p, 'must be an HTTP(S) URL without embedded credentials');
    } catch {
      fail(p, 'must be an absolute HTTP(S) URL');
    }
  };
  const known = new Set();
  const languageList = array(languages, 'languages');
  languageList.forEach((l, i) => {
    const p = `languages[${i}]`;
    if (!object(l, p)) return;
    id(l.id, `${p}.id`);
    if (typeof l.id === 'string') {
      if (known.has(l.id)) fail(`${p}.id`, `duplicate language id ${l.id}`);
      known.add(l.id);
    }
    for (const f of ['name', 'version', 'description'])
      string(l[f], `${p}.${f}`);
    for (const f of ['paradigms', 'features']) strings(l[f], `${p}.${f}`);
    if (!['static', 'dynamic', 'gradual'].includes(l.typeSystem))
      fail(`${p}.typeSystem`, 'must be static, dynamic, or gradual');
    url(l.officialDocs, `${p}.officialDocs`);
    if (l.icon !== undefined && string(l.icon, `${p}.icon`)) {
      if (/^[a-z][a-z\d+.-]*:/i.test(l.icon)) url(l.icon, `${p}.icon`);
      else if (l.icon.startsWith('//'))
        fail(`${p}.icon`, 'must be a local path or explicit HTTP(S) URL');
    }
  });
  const ids = new Set();
  let implementations = 0;
  const idiomList = array(idioms, 'idioms');
  idiomList.forEach((item, i) => {
    const p = `idioms[${i}]${typeof item?.id === 'string' ? ` (${item.id})` : ''}`;
    if (!object(item, p)) return;
    id(item.id, `${p}.id`);
    if (typeof item.id === 'string') {
      if (ids.has(item.id)) fail(`${p}.id`, `duplicate idiom id ${item.id}`);
      ids.add(item.id);
    }
    for (const f of ['title', 'description', 'category'])
      string(item[f], `${p}.${f}`);
    if (!['beginner', 'intermediate', 'advanced'].includes(item.difficulty))
      fail(`${p}.difficulty`, 'invalid difficulty');
    for (const f of ['paradigms', 'tags']) strings(item[f], `${p}.${f}`);
    if (item.source !== undefined) string(item.source, `${p}.source`);
    const used = new Set();
    array(item.implementations, `${p}.implementations`).forEach((impl, j) => {
      const q = `${p}.implementations[${j}]`;
      if (!object(impl, q)) return;
      implementations++;
      id(impl.languageId, `${q}.languageId`);
      if (typeof impl.languageId === 'string') {
        if (!known.has(impl.languageId))
          fail(`${q}.languageId`, `unknown language id ${impl.languageId}`);
        if (used.has(impl.languageId))
          fail(
            `${q}.languageId`,
            `duplicate implementation for ${impl.languageId}`
          );
        used.add(impl.languageId);
      }
      for (const f of ['code', 'explanation']) string(impl[f], `${q}.${f}`);
      for (const f of ['output', 'errorOutput'])
        if (impl[f] !== undefined) string(impl[f], `${q}.${f}`, true);
      for (const f of ['designRationale', 'sourceCard', 'version'])
        if (impl[f] !== undefined) string(impl[f], `${q}.${f}`);
      for (const f of ['pros', 'cons'])
        if (impl[f] !== undefined) strings(impl[f], `${q}.${f}`, false);
      if (impl.references !== undefined)
        array(impl.references, `${q}.references`, false).forEach((ref, k) => {
          const r = `${q}.references[${k}]`;
          if (object(ref, r)) {
            string(ref.title, `${r}.title`);
            url(ref.url, `${r}.url`);
          }
        });
    });
  });
  if (issues.length) throw new ContentValidationError(issues);
  return {
    idioms,
    languages,
    counts: {
      idioms: idiomList.length,
      languages: languageList.length,
      implementations,
    },
  };
}
