import { defineConfig } from '@playwright/test';

// Both servers are isolated: tests never send enquiries to the deployed API.
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  use: { baseURL: 'http://127.0.0.1:4177', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: [
    { command: 'node tests/fixtures/api.mjs', url: 'http://127.0.0.1:4178/healthz', reuseExistingServer: false },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 4177',
      url: 'http://127.0.0.1:4177', reuseExistingServer: false, timeout: 120_000,
      env: { NEXT_BUILD_DIR: '.next-playwright', API_PROXY_TARGET: 'http://127.0.0.1:4178', NEXT_PUBLIC_API_BASE_URL: '/api/v1', NEXT_PUBLIC_SITE_URL: 'https://example.com', NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: '' },
    },
  ],
});