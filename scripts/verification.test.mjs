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

async function buildFixture(root) {
  await put(root, 'dist/index.html', '<html><body>Elsewise</body></html>');
  await put(root, 'dist/assets/app-test.js', 'export {};');
  await put(root, 'dist/assets/app-test.css', 'body { margin: 0; }');
  await put(root, 'dist/assets/idioms-test.json', '[{"id":"array-map"}]');
  await put(root, 'dist/assets/languages-test.json', '[{"id":"javascript"}]');
}

describe('build artifact verification', () => {
  it('accepts emitted artifacts without relying on source files', async () => {
    const root = await workspace();
    await buildFixture(root);
    const result = run(root, 'verify-build.sh');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Build artifacts verified');
  });

  it.each(['idioms', 'languages'])(
    'rejects a missing emitted %s asset even when source data exists',
    async (prefix) => {
      const root = await workspace();
      await buildFixture(root);
      await rm(path.join(root, `dist/assets/${prefix}-test.json`));
      await put(root, `src/data/${prefix}.json`, '[{"id":"source-only"}]');
      const result = run(root, 'verify-build.sh');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(`No ${prefix} JSON asset emitted`);
    }
  );

  it.each(['not json', '{}', '[]'])(
    'rejects invalid or empty JSON data: %s',
    async (content) => {
      const root = await workspace();
      await buildFixture(root);
      await put(root, 'dist/assets/idioms-test.json', content);
      const result = run(root, 'verify-build.sh');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Build verification failed');
    }
  );

  it('rejects missing JavaScript assets', async () => {
    const root = await workspace();
    await buildFixture(root);
    await rm(path.join(root, 'dist/assets/app-test.js'));
    expect(run(root, 'verify-build.sh').status).toBe(1);
  });
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
