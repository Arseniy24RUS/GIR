import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..', '..');
const outputDir = resolve(projectRoot, 'giip', 'static', 'landing', 'product');
const baseURL = process.env.GIIP_BASE_URL || 'http://127.0.0.1:8011';
const executablePath = process.env.GIIP_PLAYWRIGHT_EXECUTABLE_PATH
  || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  || undefined;

const routes = {
  country: ({ lang, theme }) => `/?lang=${lang}&theme=${theme}&country=RUS#country`,
  matrix: ({ lang, theme }) => `/?lang=${lang}&theme=${theme}&country=RUS#matrix`,
  htei: ({ lang, theme }) => `/?lang=${lang}&theme=${theme}&country=RUS#index-HTEI`,
};

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: executablePath ? ['--no-sandbox'] : [],
});

try {
  for (const lang of ['ru', 'en']) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        locale: lang === 'ru' ? 'ru-RU' : 'en-US',
        colorScheme: theme,
        deviceScaleFactor: 1,
      });
      await context.addInitScript(({ lang: activeLang, theme: activeTheme }) => {
        localStorage.setItem('lang', activeLang);
        localStorage.setItem('theme', activeTheme);
        localStorage.setItem('gir-sidebar', 'collapsed');
      }, { lang, theme });

      const page = await context.newPage();
      for (const [view, route] of Object.entries(routes)) {
        await page.goto(new URL(route({ lang, theme }), baseURL).href, { waitUntil: 'domcontentloaded' });
        await page.locator('html[data-app-ready="true"]').waitFor({ state: 'attached', timeout: 60_000 });
        await page.locator('#view .card').first().waitFor({ state: 'visible', timeout: 60_000 });
        if (view === 'matrix') {
          await page.locator('.matrix-table').waitFor({ state: 'visible', timeout: 60_000 });
        } else {
          await page.locator('[data-scale-mode="quantile"]').first().waitFor({ state: 'visible', timeout: 60_000 });
        }
        await page.evaluate(async () => { await document.fonts.ready; });
        await page.screenshot({
          path: resolve(outputDir, `${view}-${lang}-${theme}.png`),
          animations: 'disabled',
          fullPage: false,
        });
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}
