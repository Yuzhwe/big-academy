import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoRoot = resolve(__dirname, '../..');

export default defineConfig({
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
