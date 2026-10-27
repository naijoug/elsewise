/** Server/build-only content. Never import this module from a client island. */
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import idiomData from '../../../src/data/idioms.json';
import languageData from '../../../src/data/languages.json';
import type { Idiom, Language } from '../../../src/types';
import { validateContent } from '../../../scripts/content-schema.mjs';

validateContent(idiomData, languageData);
export const idioms = idiomData as Idiom[];
export const languages = languageData as Language[];
export const catalog = idioms.map(({ implementations, ...summary }) => ({
  ...summary,
  languageIds: implementations.map(
    (implementation) => implementation.languageId
  ),
}));
const searchable = (values: string[]) =>
  values.map((value) => value.toLocaleLowerCase());
export const searchIndex = idioms.map((idiom) => ({
  id: idiom.id,
  fields: {
    title: searchable([idiom.title]),
    description: searchable([idiom.description]),
    category: searchable([idiom.category]),
    tags: searchable(idiom.tags),
    languages: searchable(
      idiom.implementations.flatMap((implementation) => [
        implementation.languageId,
        languages.find((language) => language.id === implementation.languageId)!
          .name,
      ])
    ),
    code: searchable(
      idiom.implementations.map((implementation) => implementation.code)
    ),
    explanation: searchable(
      idiom.implementations.map((implementation) => implementation.explanation)
    ),
  },
}));
const grammarIds = [
  ...new Set(
    idioms.flatMap((idiom) =>
      idiom.implementations.map((implementation) => implementation.languageId)
    )
  ),
];
loadLanguages(grammarIds);
export function highlight(code: string, languageId: string): string {
  const grammar = Prism.languages[languageId];
  if (!grammar) throw new Error(`Missing Prism grammar: ${languageId}`);
  return Prism.highlight(code, grammar, languageId);
}
