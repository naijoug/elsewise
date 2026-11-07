import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
const root = fileURLToPath(new URL('.', import.meta.url));
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
  root,
  resolve: {
    alias: [
      { find: /^@shared\/(.*)$/, replacement: `${root}../src/$1` },
      { find: /^@scripts\/(.*)$/, replacement: `${root}../scripts/$1` },
      { find: /^react$/, replacement: `${root}node_modules/react/index.js` },
      {
        find: /^react\/jsx-runtime$/,
        replacement: `${root}node_modules/react/jsx-runtime.js`,
      },
      {
        find: /^react-dom\/client$/,
        replacement: `${root}node_modules/react-dom/client.js`,
      },
      {
        find: /^react-dom\/server$/,
        replacement: `${root}node_modules/react-dom/server.node.js`,
      },
    ],
  },
  test: { environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] },
});
