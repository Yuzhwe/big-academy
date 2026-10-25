import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  define: { __BA_LOCAL_REVIEW_IMAGES__: JSON.stringify(existsSync(resolve(import.meta.dirname, 'public/review/r2/overview.jpg'))) },
  plugins: [react()],
  optimizeDeps: { exclude: ['@big-academy/design-system'] },
  server: { fs: { allow: [resolve(import.meta.dirname, '../..')] } },
});
