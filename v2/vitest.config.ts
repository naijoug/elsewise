import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  root,
  resolve: {
    alias: [
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
