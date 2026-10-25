import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@big-academy/design-system/tokens.css': resolve(__dirname, 'packages/design-system/src/tokens.css'), '@big-academy/design-system': resolve(__dirname, 'packages/design-system/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, 'vitest.setup.ts')],
    include: ['packages/**/*.test.tsx', 'apps/**/*.test.tsx'],
    css: true,
  },
});
