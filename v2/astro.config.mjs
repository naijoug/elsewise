import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://naijoug.github.io',
  base: process.env.GHP_BASE || '/',
  output: 'static',
  trailingSlash: 'always',
  outDir: '../dist',
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '@shared': fileURLToPath(new URL('../src', import.meta.url)),
        '@scripts': fileURLToPath(new URL('../scripts', import.meta.url)),
      },
    },
    css: { postcss: { plugins: [] } },
  },
});
