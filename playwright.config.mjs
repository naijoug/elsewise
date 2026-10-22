import { defineConfig, devices } from '@playwright/test';

const basePath = process.env.GHP_BASE || '/';
const origin = 'http://127.0.0.1:4176';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: `${origin}${basePath}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node scripts/serve-build.mjs',
    url: `${origin}${basePath}`,
    reuseExistingServer: false,
    timeout: 15000,
  },
});
