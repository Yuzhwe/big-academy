import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', testMatch: ['integration-v1.spec.ts', 'cloud-m4.spec.ts', 'cloud-m4-visual.spec.ts', 'review05.spec.ts'],
  workers: 1, timeout: 60000,
  reporter: [['list'], ['json', { outputFile: 'docs/evidence/m4-audit/results.json' }]],
  use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width:1440, height:900 },
    baseURL:'http://127.0.0.1:5184', reducedMotion:'reduce', trace:'retain-on-failure' },
});
