import { execFileSync } from 'node:child_process';
import { features } from '../lib/feature-content';
import { idioms, languages } from '../lib/content';

function getCommit(): string {
  if (
    process.env.GITHUB_SHA &&
    /^[a-f0-9]{40}$/i.test(process.env.GITHUB_SHA)
  ) {
    return process.env.GITHUB_SHA;
  }
  try {
    const rev = execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (/^[a-f0-9]{40}$/i.test(rev)) return rev;
  } catch {
    // Graceful fallback to valid 40-character hex when outside git/CI
  }
  return '0'.repeat(40);
}

export const GET = () =>
  new Response(
    JSON.stringify({
      version: 2,
      features: features.map((feature) => feature.id),
      featureEntries: features.reduce(
        (count, feature) => count + feature.entries.length,
        0
      ),
      commit: getCommit(),
      base: import.meta.env.BASE_URL,
      idioms: idioms.map((i) => i.id),
      languages: languages.map((l) => l.id),
      implementations: idioms.reduce((n, i) => n + i.implementations.length, 0),
    }),
    { headers: { 'content-type': 'application/json' } }
  );
