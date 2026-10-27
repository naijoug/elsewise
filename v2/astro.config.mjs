import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
export default defineConfig({
  site: 'https://naijoug.github.io',
  base: process.env.GHP_BASE || '/',
  output: 'static',
  trailingSlash: 'always',
  outDir: '../dist',
  integrations: [react()],
  vite: { css: { postcss: { plugins: [] } } },
});
