import { execFileSync } from 'node:child_process';
import { idioms, languages } from '../lib/content';
export const GET = () =>
  new Response(
    JSON.stringify({
      version: 2,
      commit:
        process.env.GITHUB_SHA ||
        execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      base: import.meta.env.BASE_URL,
      idioms: idioms.map((i) => i.id),
      languages: languages.map((l) => l.id),
      implementations: idioms.reduce((n, i) => n + i.implementations.length, 0),
    }),
    { headers: { 'content-type': 'application/json' } }
  );
