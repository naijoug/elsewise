import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const { engines } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as { engines: { node: string } };
const match = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(engines.node);
const current = process.versions.node.split('.').map(Number);
if (
  !match ||
  current[0] !== Number(match[1]) ||
  current[1] < Number(match[2]) ||
  (current[1] === Number(match[2]) && current[2] < Number(match[3]))
) {
  throw new Error(
    `Node ${engines.node} required; found ${process.versions.node}. Run nvm use.`
  );
}

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
  },
});
