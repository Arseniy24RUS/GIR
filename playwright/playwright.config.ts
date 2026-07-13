import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.GIIP_BASE_URL || 'http://127.0.0.1:8011';
const systemChromium = process.env.GIIP_PLAYWRIGHT_EXECUTABLE_PATH || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const disableVideo = process.env.GIIP_DISABLE_VIDEO === '1';
const configuredWorkers = Number(process.env.GIIP_PLAYWRIGHT_WORKERS || '2');

export default defineConfig({
  testDir: './tests',
  forbidOnly: true,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: '../outputs/playwright-summary.json' }]
  ],
  timeout: 60_000,
  workers: configuredWorkers,
  fullyParallel: false,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      stylePath: './utils/screenshot.css'
    }
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: disableVideo ? 'off' : 'retain-on-failure',
    launchOptions: systemChromium ? { executablePath: systemChromium, args: ['--no-sandbox'] } : undefined
  },
  webServer: process.env.GIIP_SKIP_WEBSERVER ? undefined : {
    command: 'python -m giip.cli runserver --host 127.0.0.1 --port 8011',
    cwd: '..',
    url: baseURL + '/api/health',
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    { name: 'desktop-ru-dark', use: { ...devices['Desktop Chrome'], locale: 'ru-RU', colorScheme: 'dark' } },
    { name: 'desktop-ru-light', use: { ...devices['Desktop Chrome'], locale: 'ru-RU', colorScheme: 'light' } },
    { name: 'desktop-en-dark', use: { ...devices['Desktop Chrome'], locale: 'en-US', colorScheme: 'dark' } },
    { name: 'desktop-en-light', use: { ...devices['Desktop Chrome'], locale: 'en-US', colorScheme: 'light' } },
    { name: 'mobile-ru', use: { ...devices['iPhone 14'], locale: 'ru-RU', colorScheme: 'dark' } },
    { name: 'mobile-en', use: { ...devices['Pixel 7'], locale: 'en-US', colorScheme: 'light' } },
    { name: 'tablet-ru', use: { ...devices['iPad Pro 11'], locale: 'ru-RU', colorScheme: 'light' } },
    { name: 'tablet-en', use: { ...devices['iPad Pro 11'], locale: 'en-US', colorScheme: 'dark' } }
  ]
});
