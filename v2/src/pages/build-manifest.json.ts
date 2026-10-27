import { execFileSync } from 'node:child_process';
import { features } from '../lib/feature-content';
import { idioms, languages } from '../lib/content';
export const GET = () =>
  new Response(
    JSON.stringify({
      version: 2,
      features: features.map((feature) => feature.id),
      featureEntries: features.reduce((count, feature) => count + feature.entries.length, 0),
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
