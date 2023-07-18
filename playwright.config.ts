// @ts-check
const { defineConfig, devices } = require('@playwright/test');
import { generateCustomLayoutAsync } from "./src/tests/utils/customLayout";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      "./node_modules/playwright-slack-report/dist/src/SlackReporter.js",
      {
        channels: ["chan-chan"], // provide one or more Slack channels
        sendResults: "always", // "always" , "on-failure", "off"
        layoutAsync: generateCustomLayoutAsync,
        slackOAuthToken: process.env.SLACK_BOT_USER_OAUTH_TOKEN,
      },
    ],
  ['dot'],
],
timeout: 60000,
  use: {
    screenshot: 'only-on-failure',
    video: "retain-on-failure",
    trace: 'on-first-retry',
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'chrome:latest:MacOS Monterey@lambdatest',
      use: {
        viewport: { width: 1920, height: 1080 }
      }
    },

    {
      name: 'chrome:latest:Windows 10@lambdatest',
      use: {
        viewport: { width: 1280, height: 720 }
      }
    },
  ],
});

