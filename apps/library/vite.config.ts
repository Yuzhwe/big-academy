import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  define: { __BA_LOCAL_REVIEW_IMAGES__: JSON.stringify(existsSync(resolve(import.meta.dirname, 'public/review/r2/overview.jpg'))) },
  resolve: { alias: { '@big-academy/design-system/tokens.css': resolve(import.meta.dirname, '../../packages/design-system/src/tokens.css'), '@big-academy/design-system': resolve(import.meta.dirname, '../../packages/design-system/src/index.ts') } },
  plugins: [react()],
  optimizeDeps: { exclude: ['@big-academy/design-system'] },
  server: { fs: { allow: [resolve(import.meta.dirname, '../..')] } },
});
