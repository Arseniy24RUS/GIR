import { test, expect } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

async function waitForLanding(page: any) {
  await expect(page.locator('html')).toHaveAttribute('data-page', 'landing');
  await expect(page.locator('#view.landing-view .landing-page')).toBeVisible();
  await expect(page.locator('[data-landing-summary][aria-busy="false"]')).toBeVisible({ timeout: 30_000 });
}

test('landing leads with the research value and a live evidence snapshot', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto('/?lang=ru&theme=dark');
  await waitForLanding(page);

  await expect(page.locator('.landing-hero h1')).toHaveText('Глобальная аналитика человеческого капитала и технологических кадров');
  await expect(page.locator('#contextBar')).toBeHidden();
  await expect(page.locator('#countrySelect')).toHaveCount(0);
  await expect(page.locator('#yearSelect')).toHaveCount(0);
  await expect(page.locator('#nav .nav-item[aria-label="Главная"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#nav .nav-item', { hasText: 'Приёмка' })).toHaveCount(0);

  await expect(page.locator('[data-landing-htei-score] strong')).toHaveText('54,9');
  await expect(page.locator('.gir-landing__result-metrics')).toContainText('25');
  await expect(page.locator('.gir-landing__result-metrics')).toContainText('из 105');
  await expect(page.locator('.gir-landing__result-metrics')).toContainText('91%');
  await expect(page.locator('.gir-landing__result-metrics')).toContainText('6 / 6');
  await expect(page.locator('.gir-landing__component-row')).toHaveCount(6);
  await expect(page.locator('.gir-landing__component-profile')).toContainText('Технологические профессии');
  await expect(page.locator('.gir-landing__component-profile')).toContainText('Технологические результаты экономики');
  await expect(page.locator('.gir-landing__insight-panel')).toContainText('87 место из 135');

  for (const metric of ['225', '1990–2026', '10 076', '36 945', '18 569', '275', '159']) {
    await expect(page.locator('.gir-landing__scale')).toContainText(metric);
  }
  await expect(page.locator('.gir-landing__scale-item')).toHaveCount(6);
  await expect(page.locator('.gir-landing__route-item')).toHaveCount(5);
  await expect(page.locator('.gir-landing__index-item')).toHaveCount(7);
  await expect(page.locator('.gir-landing__evidence-step')).toHaveCount(5);
  await expect(page.locator('.gir-landing__trust-metric')).toHaveCount(4);

  for (const internalLabel of ['Python-тест', 'Playwright-сценар', 'FastAPI', 'строк кода']) {
    await expect(page.locator('.landing-page')).not.toContainText(internalLabel);
  }

  expect(requests.filter((url) => url.includes('/api/landing-summary'))).toHaveLength(1);
  expect(requests.filter((url) => url.includes('/api/app-data'))).toHaveLength(0);
});

for (const lang of ['ru', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`landing is complete in ${lang.toUpperCase()} ${theme}`, async ({ page }) => {
      await page.goto(`/?lang=${lang}&theme=${theme}`);
      await waitForLanding(page);

      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('img[data-landing-hero]')).toBeVisible();
      await expect(page.locator('img[data-landing-hero]')).toHaveAttribute('src', new RegExp(`hero-${theme}\\.png$`));
      await expect(page.locator('picture[data-asset-role="hero"] source[type="image/webp"]')).toHaveAttribute('srcset', new RegExp(`hero-${theme}\\.webp$`));
      await expect(page.locator('[data-landing-product]')).toHaveCount(3);

      const productAssets = await page.locator('picture[data-asset-role="product-screen"]').evaluateAll((pictures) => pictures.map((picture) => ({
        name: picture.getAttribute('data-asset-name'),
        locale: picture.getAttribute('data-locale'),
        theme: picture.getAttribute('data-theme'),
        png: picture.querySelector('img')?.getAttribute('src'),
        webp: picture.querySelector('source[type="image/webp"]')?.getAttribute('srcset'),
      })));
      expect(productAssets.map((asset) => asset.name)).toEqual(['country', 'htei', 'matrix']);
      expect(productAssets.every((asset) => asset.locale === lang && asset.theme === theme)).toBeTruthy();
      expect(productAssets.every((asset) => asset.png?.endsWith(`-${lang}-${theme}.png`))).toBeTruthy();
      expect(productAssets.every((asset) => asset.webp?.endsWith(`-${lang}-${theme}.webp`))).toBeTruthy();
      await expect(page.locator('[data-open-cooperation]').first()).toBeVisible();
      await expect(page.locator('[data-route-target="country"]').first()).toBeVisible();

      if (lang === 'ru') {
        await expect(page.locator('.landing-hero h1')).toHaveText('Глобальная аналитика человеческого капитала и технологических кадров');
        await expect(page.locator('#cooperationHeaderBtn')).toHaveAttribute('aria-label', 'Сотрудничество');
        await expect(page.locator('.gir-landing__snapshot')).toContainText('Что платформа показывает уже сейчас');
      } else {
        await expect(page.locator('.landing-hero h1')).toHaveText('Global intelligence on human capital and technology workforce');
        await expect(page.locator('#cooperationHeaderBtn')).toHaveAttribute('aria-label', 'Cooperation');
        await expect(page.locator('.gir-landing__snapshot')).toContainText('What the platform already reveals');
      }
    });
  }
}

test('landing routes into the analytical shell and the home mark returns to the public entry', async ({ page }) => {
  await page.goto('/?lang=en&theme=light');
  await waitForLanding(page);
  await page.locator('[data-route-target="country"]').first().click();
  await expect(page).toHaveURL(/#country$/);
  await expect(page.locator('#contextBar #countrySelect')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#view .landing-page')).toHaveCount(0);

  await page.locator('.header-gir-home').click();
  await expect(page).toHaveURL(/#landing$/);
  await waitForLanding(page);
  await expect(page.locator('#contextBar')).toBeHidden();

  await page.goto('/?lang=en&country=DEU');
  await expect(page.locator('#countrySelect')).toHaveValue('DEU', { timeout: 30_000 });
  await expect(page.locator('html')).toHaveAttribute('data-page', 'country');

  await page.goto('/?lang=en&index=HTEI');
  await expect(page.locator('#hteiMode')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('html')).toHaveAttribute('data-page', 'index-HTEI');
});
