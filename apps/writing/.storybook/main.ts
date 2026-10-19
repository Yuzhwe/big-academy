import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const repoRoot = resolve(import.meta.dirname, '../../..');

const config: StorybookConfig = {
  stories: [
    '../../../packages/design-system/src/**/*.stories.tsx',
    '../src/**/*.stories.tsx',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  async viteFinal(viteConfig) {
    viteConfig.optimizeDeps = viteConfig.optimizeDeps ?? {};
    const excluded = viteConfig.optimizeDeps.exclude ?? [];
    viteConfig.optimizeDeps.exclude = [...excluded, '@big-academy/design-system'];
    viteConfig.server = viteConfig.server ?? {};
    viteConfig.server.fs = {
      ...(viteConfig.server.fs ?? {}),
      allow: [repoRoot],
    };
    return viteConfig;
  },
};

export default config;
