import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoRoot = resolve(__dirname, '../..');

export default defineConfig({
  resolve: { alias: { '@big-academy/design-system/tokens.css': resolve(import.meta.dirname, '../../packages/design-system/src/tokens.css'), '@big-academy/design-system': resolve(import.meta.dirname, '../../packages/design-system/src/index.ts') } },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@big-academy/design-system'],
  },
  server: {
    // Quick tunnels send a public Host header. Vite otherwise refuses them.
    allowedHosts: true,
    fs: {
      allow: [repoRoot],
    },
  },
});
