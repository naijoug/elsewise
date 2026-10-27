// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const workspaces = [];

afterEach(async () => {
  await Promise.all(
    workspaces
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true }))
  );
});

async function workspace() {
  const root = await mkdtemp(path.join(tmpdir(), 'elsewise-verification-'));
  workspaces.push(root);
  return root;
}

async function put(root, name, content, mode) {
  const file = path.join(root, name);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, { mode });
}

function run(root, script, env = {}) {
  return spawnSync('bash', [path.join(scripts, script)], {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: 15000,
  });
}

const validManifest = () => ({
  version: 2,
  commit: 'a'.repeat(40),
  base: '/elsewise',
  idioms: ['array-map'],
  features: ['closures'],
  languages: ['javascript'],
  implementations: 1,
});
const validIndex = () => [
  {
    id: 'array-map',
    fields: {
      title: ['map'],
      description: ['transform'],
      category: ['arrays'],
      tags: [],
      languages: ['javascript'],
      code: ['[1].map(x => x * 2)'],
      explanation: ['mapping'],
    },
  },
];
async function buildFixture(root) {
  for (const file of [
    'index.html',
    'languages/index.html',
    'favorites/index.html',
    'idioms/index.html',
    'features/index.html',
    'feature/closures/index.html',
    '404.html',
    'idiom/array-map/index.html',
    'language/javascript/index.html',
    'en/index.html',
    'en/features/index.html',
    'en/idioms/index.html',
    'en/languages/index.html',
    'en/favorites/index.html',
    'en/feature/closures/index.html',
    'en/idiom/array-map/index.html',
    'en/language/javascript/index.html',
  ]) {
    await put(
      root,
      `dist/${file}`,
      '<html><body>Elsewise static content</body></html>'
    );
  }
  await put(root, 'dist/_astro/app-test.js', 'export {};');
  await put(root, 'dist/_astro/app-test.css', 'body { margin: 0; }');
  await put(root, 'dist/build-manifest.json', JSON.stringify(validManifest()));
  await put(root, 'dist/search-index.json', JSON.stringify(validIndex()));
  await put(root, 'dist/en/search-index.json', JSON.stringify(validIndex()));
}

describe('build artifact verification', () => {
  it('accepts emitted Astro artifacts without relying on source files', async () => {
    const root = await workspace();
    await buildFixture(root);
    const result = run(root, 'verify-build.sh');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Build artifacts verified');
  });
  it.each([
    'idiom/array-map/index.html',
    'language/javascript/index.html',
    'favorites/index.html',
    'idioms/index.html',
    'features/index.html',
    'feature/closures/index.html',
    '404.html',
    'en/feature/closures/index.html',
    'en/idiom/array-map/index.html',
    'en/language/javascript/index.html',
    'en/search-index.json',
  ])(
    'rejects missing static route %s even if source data exists',
    async (route) => {
      const root = await workspace();
      await buildFixture(root);
      await rm(path.join(root, `dist/${route}`));
      await put(root, 'src/data/idioms.json', '[{"id":"array-map"}]');
      const result = run(root, 'verify-build.sh');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(route);
    }
  );
  it.each(['.js', '.css'])('rejects missing %s assets', async (extension) => {
    const root = await workspace();
    await buildFixture(root);
    await rm(path.join(root, `dist/_astro/app-test${extension}`));
    const result = run(root, 'verify-build.sh');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`No ${extension} assets`);
  });
  it.each(['_astro/app-test.js', '_astro/app-test.css', 'index.html'])(
    'rejects empty %s',
    async (file) => {
      const root = await workspace();
      await buildFixture(root);
      await put(root, `dist/${file}`, '');
      expect(run(root, 'verify-build.sh').status).toBe(1);
    }
  );
  it.each(['build-manifest.json', 'search-index.json'])(
    'rejects invalid JSON in %s',
    async (file) => {
      const root = await workspace();
      await buildFixture(root);
      await put(root, `dist/${file}`, 'not json');
      expect(run(root, 'verify-build.sh').status).toBe(1);
    }
  );
  it.each([
    { version: 1 },
    { commit: 'unknown' },
    { base: '../outside' },
    { idioms: [] },
    { idioms: ['../escape'] },
    { idioms: ['array-map', 'array-map'] },
    { languages: [] },
    { implementations: 0 },
    { implementations: 1.5 },
  ])('rejects malformed manifest %j', async (change) => {
    const root = await workspace();
    await buildFixture(root);
    await put(
      root,
      'dist/build-manifest.json',
      JSON.stringify({ ...validManifest(), ...change })
    );
    const result = run(root, 'verify-build.sh');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('manifest');
  });
  it.each(['empty', 'unknown', 'bad-fields', 'empty-code', 'count-mismatch'])(
    'rejects inconsistent search index: %s',
    async (kind) => {
      const root = await workspace();
      await buildFixture(root);
      const index = validIndex();
      if (kind === 'empty') index.length = 0;
      if (kind === 'unknown') index[0].id = 'other';
      if (kind === 'bad-fields') index[0].fields.code = 'not an array';
      if (kind === 'empty-code') index[0].fields.code = [''];
      if (kind === 'count-mismatch')
        index[0].fields.code.push('second implementation');
      await put(root, 'dist/search-index.json', JSON.stringify(index));
      expect(run(root, 'verify-build.sh').status).toBe(1);
    }
  );
});

async function commandFixture(root) {
  await put(
    root,
    'package.json',
    JSON.stringify({ engines: { node: '^22.12.0' } })
  );
  await put(
    root,
    'bin/npm',
    `#!/bin/bash
printf '%s:%s\\n' "\${VITE_ENV:-unset}" "$*" >> "$ELSEWISE_TEST_LOG"
if [ "$*" = "run validate" ] && [ "\${ELSEWISE_FAIL_VALIDATE:-}" = "1" ]; then
  echo "fixture validation failed" >&2
  exit 7
fi
`,
    0o755
  );
  return {
    PATH: `${path.join(root, 'bin')}${path.delimiter}${process.env.PATH}`,
    VITE_ENV: '',
    ELSEWISE_TEST_LOG: path.join(root, 'commands.log'),
  };
}

describe('pre-deploy orchestration', () => {
  it('validates once in production before checking artifacts', async () => {
    const root = await workspace();
    const env = await commandFixture(root);
    expect(run(root, 'pre-deploy-check.sh', env).status).toBe(0);
    expect(await readFile(env.ELSEWISE_TEST_LOG, 'utf8')).toBe(
      'production:run validate\nunset:run verify-build\n'
    );
  });

  it('preserves the failure and never checks stale artifacts after validation fails', async () => {
    const root = await workspace();
    const env = await commandFixture(root);
    const result = run(root, 'pre-deploy-check.sh', {
      ...env,
      ELSEWISE_FAIL_VALIDATE: '1',
    });
    expect(result.status).toBe(7);
    expect(result.stderr).toContain('fixture validation failed');
    expect(await readFile(env.ELSEWISE_TEST_LOG, 'utf8')).toBe(
      'production:run validate\n'
    );
  });
});
