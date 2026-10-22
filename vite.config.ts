import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GHP_BASE || '/',
  build: {
    // Keep automatic chunks: merging Prism core and side-effect language
    // modules into one vendor chunk runs grammars before Prism is initialized.
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: process.env.VITE_ENV === 'production' ? false : true,
    // Target modern browsers
    target: 'esnext',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'prismjs'],
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
});
