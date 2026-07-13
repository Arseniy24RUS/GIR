import { test, expect, type Page } from '@playwright/test';

const productNames = {
  ru: 'GIR — Глобальный рейтинг индексов',
  en: 'GIR — Global Index Ranker',
} as const;

const brandAssets = {
  ru: {
    dark: { gir: 'gir-ru-dark.svg', mgimo: 'mgimo-ru-dark.svg', fnisc: 'fnisc-ru-dark.svg', priority: 'priority-ru-dark.svg', ministry: 'minobrnauki-ru-dark.png' },
    light: { gir: 'gir-ru-light.svg', mgimo: 'mgimo-ru-light.svg', fnisc: 'fnisc-ru-light.svg', priority: 'priority-ru-light.svg', ministry: 'minobrnauki-ru-light.png' },
  },
  en: {
    dark: { gir: 'gir-en-dark.svg', mgimo: 'mgimo-en-dark.svg', fnisc: 'fnisc-en-dark.svg', priority: 'priority-en-dark.svg', ministry: 'minobrnauki-en-dark.png' },
    light: { gir: 'gir-en-light.svg', mgimo: 'mgimo-en-light.svg', fnisc: 'fnisc-en-light.svg', priority: 'priority-en-light.svg', ministry: 'minobrnauki-en-light.png' },
  },
} as const;

async function waitForApp(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true', { timeout: 30_000 });
  await expect(page.locator('#nav .nav-item').first()).toBeVisible();
}

test('institutional logo links use the four official external destinations', async ({ page }) => {
  await page.goto('/?lang=en&theme=light');
  await waitForApp(page);

  const expected = [
    ['mgimo', 'https://mgimo.ru/'],
    ['fnisc', 'https://www.fnisc.ru/'],
    ['priority', 'https://priority2030.ru/'],
    ['ministry', 'https://minobrnauki.gov.ru/'],
  ] as const;
  const links = page.locator('.institutional-strip .institution-link');
  await expect(links).toHaveCount(4);

  for (const [logo, href] of expected) {
    const link = page.locator(`.institutional-strip .institution-link:has(img[data-logo="${logo}"])`);
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
    await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);
    await expect(link.locator(`img[data-logo="${logo}"]`)).toHaveCount(1);
  }
});

test('desktop header makes GIR the dominant brand mark', async ({ page }) => {
  for (const viewportWidth of [1440, 1280]) {
    await page.setViewportSize({ width: viewportWidth, height: 1000 });
    await page.goto('/?lang=en&theme=dark');
    await waitForApp(page);

    const gir = page.locator('.header-gir-home [data-gir-logo]');
    const girBox = await gir.boundingBox();
    expect(girBox).not.toBeNull();
    expect(girBox!.width).toBeGreaterThan(viewportWidth >= 1440 ? 380 : 300);
    expect(girBox!.height).toBeGreaterThan(viewportWidth >= 1440 ? 70 : 58);

    const partnerLogos = page.locator('.institutional-strip .institution-link img');
    const partnerCount = await partnerLogos.count();
    for (let i = 0; i < partnerCount; i += 1) {
      const partnerBox = await partnerLogos.nth(i).boundingBox();
      expect(partnerBox).not.toBeNull();
      expect(girBox!.height).toBeGreaterThan(partnerBox!.height + 15);
    }

    await expect.poll(
      () => page.evaluate(() => {
        const topbar = document.querySelector<HTMLElement>('.topbar');
        return Boolean(topbar && topbar.scrollWidth <= topbar.clientWidth + 1);
      }),
    ).toBe(true);
  }
});

for (const lang of ['ru', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${lang.toUpperCase()} ${theme} mode uses localized GIR and institution assets`, async ({ page }) => {
      await page.goto(`/?lang=${lang}&theme=${theme}`);
      await waitForApp(page);

      const assets = brandAssets[lang][theme];
      await expect(page).toHaveTitle(productNames[lang]);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('.header-gir-home [data-gir-logo]')).toHaveAttribute('src', `/static/brand/${assets.gir}`);
      await expect(page.locator('.header-gir-home [data-gir-logo]')).toHaveAttribute('alt', productNames[lang]);
      await expect(page.locator('#sidebar [data-gir-logo]')).toHaveCount(0);

      for (const logo of ['mgimo', 'fnisc', 'priority', 'ministry'] as const) {
        await expect(page.locator(`[data-logo="${logo}"]`).first()).toHaveAttribute('src', `/static/brand/${assets[logo]}`);
      }
    });
  }
}

test('favicon and Onest font assets are active', async ({ page }) => {
  await page.goto('/?lang=ru');
  await waitForApp(page);

  await expect(page.locator('link#favicon')).toHaveAttribute('rel', 'icon');
  await expect(page.locator('link#favicon')).toHaveAttribute('type', 'image/svg+xml');
  await expect(page.locator('link#favicon')).toHaveAttribute('href', '/static/brand/favicon.svg');
  await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute('href', '/static/brand/favicon-32.png');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('16px "Onest"'))).toBeTruthy();
});

test('country and year controls exist once and only inside the context bar', async ({ page }) => {
  await page.goto('/?lang=en&country=RUS');
  await waitForApp(page);

  await expect(page.locator('#countrySelect')).toHaveCount(1);
  await expect(page.locator('#yearSelect')).toHaveCount(1);
  await expect(page.locator('#contextBar #countrySelect')).toHaveCount(1);
  await expect(page.locator('#contextBar #yearSelect')).toHaveCount(1);
  await expect(page.locator('#contextBar #countrySelect')).toHaveValue('RUS');
});
