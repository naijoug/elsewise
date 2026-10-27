import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { validateContent, ContentValidationError } from './content-schema.mjs';
const language = () => ({
  id: 'python',
  name: 'Python',
  version: '3.12',
  paradigms: ['过程式'],
  typeSystem: 'dynamic',
  description: '示例语言',
  features: ['可读性'],
  officialDocs: 'https://docs.python.org/3/',
});
const idiom = () => ({
  id: 'hello-world',
  title: '问候',
  description: '输出问候',
  category: '基础',
  difficulty: 'beginner',
  paradigms: ['过程式'],
  tags: ['输出'],
  implementations: [
    { languageId: 'python', code: 'print("hello")', explanation: '调用 print' },
  ],
});
const invalid = (change) => {
  const xs = [idiom()],
    ls = [language()];
  change(xs, ls);
  return () => validateContent(xs, ls);
};
describe('snapshot content contract', () => {
  it('validates current content without mutation', async () => {
    const xs = JSON.parse(await readFile('src/data/idioms.json', 'utf8')),
      ls = JSON.parse(await readFile('src/data/languages.json', 'utf8'));
    const before = JSON.stringify([xs, ls]);
    const result = validateContent(xs, ls);
    expect(result.counts).toEqual({
      idioms: xs.length,
      languages: ls.length,
      implementations: xs.reduce((n, x) => n + x.implementations.length, 0),
    });
    expect(result.idioms).toBe(xs);
    expect(JSON.stringify([xs, ls])).toBe(before);
  });
  it('rejects empty or absent collections', () => {
    expect(() => validateContent(null, [])).toThrow(ContentValidationError);
    expect(() => validateContent([], [language()])).toThrow('non-empty');
  });
  it('rejects malformed and duplicate IDs', () => {
    expect(invalid((xs) => xs.push(idiom()))).toThrow('duplicate idiom');
    expect(invalid((_, ls) => ls.push(language()))).toThrow(
      'duplicate language'
    );
    expect(
      invalid((xs) => {
        xs[0].id = '../x';
      })
    ).toThrow('kebab-case');
  });
  it('rejects unknown and repeated implementations', () => {
    expect(
      invalid((xs) => {
        xs[0].implementations[0].languageId = 'bad';
      })
    ).toThrow('unknown language');
    expect(
      invalid((xs) =>
        xs[0].implementations.push({ ...xs[0].implementations[0] })
      )
    ).toThrow('duplicate implementation');
  });
  it('requires valid content fields', () => {
    expect(
      invalid((xs) => {
        xs[0].implementations = [];
      })
    ).toThrow('non-empty');
    expect(
      invalid((xs) => {
        xs[0].implementations[0].code = ' ';
      })
    ).toThrow('.code');
    expect(
      invalid((xs) => {
        xs[0].tags = [42];
      })
    ).toThrow('.tags[0]');
    expect(
      invalid((xs) => {
        xs[0].difficulty = 'expert';
      })
    ).toThrow('.difficulty');
  });
  it('validates registry fields and safe URL schemes', () => {
    expect(
      invalid((_, ls) => {
        ls[0].typeSystem = 'strong';
      })
    ).toThrow('.typeSystem');
    expect(
      invalid((_, ls) => {
        ls[0].version = '';
      })
    ).toThrow('.version');
    expect(
      invalid((_, ls) => {
        ls[0].officialDocs = 'javascript:alert(1)';
      })
    ).toThrow('HTTP(S)');
    expect(
      invalid((_, ls) => {
        ls[0].icon = 'data:text/html,x';
      })
    ).toThrow('.icon');
  });
  it('checks optional metadata and references', () => {
    expect(
      invalid((xs) => {
        xs[0].source = 3;
      })
    ).toThrow('.source');
    expect(
      invalid((xs) => {
        xs[0].implementations[0].pros = [false];
      })
    ).toThrow('.pros[0]');
    expect(
      invalid((xs) => {
        xs[0].implementations[0].references = [
          { title: 'Docs', url: '/relative' },
        ];
      })
    ).toThrow('.url');
    expect(
      invalid((xs) => {
        xs[0].implementations[0].references = [
          { title: 'Docs', url: 'https://user:secret@example.com' },
        ];
      })
    ).toThrow('credentials');
  });
  it('preserves optional empty output and unknown provenance', () => {
    const x = idiom();
    x.source = 'tech-cards-handbook';
    x.future = { verified: false };
    Object.assign(x.implementations[0], {
      output: '',
      errorOutput: '',
      pros: [],
      cons: [],
      references: [],
      version: '3.12',
      sourceCard: 'chapters/python/x.md',
    });
    expect(validateContent([x], [language()]).idioms[0]).toBe(x);
  });
  it('aggregates field paths for malformed entries', () => {
    try {
      validateContent([null, []], [null]);
      throw Error('expected failure');
    } catch (e) {
      expect(e).toBeInstanceOf(ContentValidationError);
      expect(e.issues).toHaveLength(3);
      expect(e.issues[0]).toContain('languages[0]');
    }
  });
});
