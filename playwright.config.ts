import { defineConfig, devices, HTTPCredentials } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8080';
const httpCredentials: HTTPCredentials = {
    username: process.env.BASIC_AUTH_USER ?? '',
    password: process.env.BASIC_AUTH_PASS ?? '',
};

export default defineConfig({
    testDir: './e2e',
    timeout: 60_000,
    expect: { timeout: 10_000 },
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html']],
    webServer: process.env.CI
        ? {
              command: 'npm run build && next start -p 8080',
              url: baseURL,
              reuseExistingServer: false,
              timeout: 120_000,
          }
        : {
              command: 'npm run dev',
              url: baseURL,
              reuseExistingServer: true,
              timeout: 120_000,
          },
    use: {
        baseURL,
        httpCredentials,
        headless: true,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
