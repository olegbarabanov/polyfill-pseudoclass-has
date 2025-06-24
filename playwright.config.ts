import {defineConfig, devices} from '@playwright/test';

const sampleWebServer = {
  protocol: process.env.SAMPLE_DEV_SERVER_PROTOCOL || 'http',
  domain: process.env.SAMPLE_DEV_SERVER_DOMAIN || 'localhost',
  port: process.env.SAMPLE_DEV_SERVER_PORT || '3000',
  path: process.env.SAMPLE_DEV_SERVER_PATH || '',
};

const sampleWebServerURI = new URL(
  `${sampleWebServer.protocol}://${sampleWebServer.domain}:${sampleWebServer.port}${sampleWebServer.path}`
);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'null',
  use: {
    baseURL: sampleWebServerURI.toString(),
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },

    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
    },

    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
    },
  ],

  webServer: {
    command: 'npm run serve',
    url: sampleWebServerURI.toString(),
    reuseExistingServer: !process.env.CI,
    ignoreHTTPSErrors: true,
  },
});
