import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: 'test',
      HOST: '127.0.0.1',
      PORT: '4173',
      APP_ORIGIN: baseURL,
      DATABASE_PATH: ':memory:',
      LOG_LEVEL: 'silent',
      TRUST_PROXY: 'false',
    },
  },
});
