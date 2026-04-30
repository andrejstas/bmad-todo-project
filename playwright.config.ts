import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: [
    {
      command: 'yarn workspace backend dev',
      port: 3000,
      reuseExistingServer: true,
    },
    {
      command: 'yarn workspace frontend dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
  ],
})
