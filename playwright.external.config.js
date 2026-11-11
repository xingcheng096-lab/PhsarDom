import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4415', trace: 'on-first-retry' },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
})
