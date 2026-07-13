import { test, expect } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

async function openMethodology(page: import('@playwright/test').Page, lang: 'ru' | 'en' = 'ru', theme: 'dark' | 'light' = 'dark') {
  await page.goto(`/?lang=${lang}&theme=${theme}#methodology`);
  await expect(page.locator('html')).toHaveAttribute('data-page', 'methodology', { timeout: 30_000 });
  await expect(page.locator('.methodology-wiki')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true', { timeout: 30_000 });
}

test('methodology is an independent bilingual documentation surface', async ({ page }) => {
  const appDataRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/app-data') appDataRequests.push(request.url());
  });

  await openMethodology(page, 'ru', 'dark');

  await expect(page.locator('#contextBar')).toBeHidden();
  await expect(page.locator('.method-hero h1')).toContainText('Методология');
  await expect(page.locator('.method-chapter-nav [data-method-chapter]')).toHaveCount(30);
  await expect(page.locator('[data-method-route]')).toHaveCount(4);
  await expect(page.locator('.method-scale-grid > div')).toHaveCount(8);
  await expect(page.locator('.method-index-list [data-method-index]')).toHaveCount(8);
  await expect(page.locator('body')).not.toContainText('PLAYWRIGHT_EVIDENCE_INVALID');
  await expect(page.locator('body')).not.toContainText('hash mismatch');
  expect(appDataRequests).toEqual([]);

  await page.locator('#langBtn').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.method-hero h1')).toContainText('Methodology');
  await expect(page.locator('.method-chapter-nav [data-method-chapter]')).toHaveCount(21);
  await expect(page.locator('.method-hero-figure img')).toHaveAttribute('src', /\/en-dark\/01_taxonomy\.png$/);

  await page.locator('#themeBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.method-hero-figure img')).toHaveAttribute('src', /\/en-light\/01_taxonomy\.png$/);
  expect(appDataRequests).toEqual([]);
});

test('search, chapter navigation, continuous reading and figure dialog are keyboard operable', async ({ page }) => {
  await openMethodology(page, 'ru', 'dark');

  await page.locator('#methodSearch').fill('proxy');
  await expect(page.locator('#methodSearchResults button').first()).toBeVisible();
  await page.locator('#methodSearchResults button').first().click();
  await expect(page.locator('.method-chapter h2').first()).toBeVisible();

  await page.locator('[data-method-index="HTEI"]').click();
  await expect(page.locator('.method-chapter h2').first()).toContainText('HTEI');

  await page.locator('[data-method-view="continuous"]').click();
  await expect(page.locator('.method-continuous .method-chapter')).toHaveCount(30);
  await expect(page.locator('.method-continuous .method-figure')).toHaveCount(9);
  await page.locator('[data-method-view="chapter"]').click();

  const trigger = page.locator('.method-hero-figure');
  await trigger.focus();
  await trigger.click();
  const dialog = page.locator('#methodFigureDialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('[data-method-dialog-close]')).toBeFocused();

  // The single-image state has one focusable control, so Tab must remain trapped.
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-method-dialog-close]')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('[data-method-dialog-close]')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('methodology remains readable without document-level horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openMethodology(page, 'ru', 'dark');

  await expect(page.locator('.method-hero h1')).toBeVisible();
  await expect(page.locator('.method-hero-figure')).toBeVisible();
  await expect(page.locator('.method-chapter')).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.scrollingElement?.clientWidth ?? document.documentElement.clientWidth,
    scrollWidth: document.scrollingElement?.scrollWidth ?? document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 4);
});
