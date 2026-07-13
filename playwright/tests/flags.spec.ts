import { expect, test, type Locator, type Page } from '@playwright/test';


async function waitForApp(page: Page) {
  await expect(page.locator('#contextBar #countrySelect')).toHaveValue('RUS', { timeout: 30_000 });
}


async function expectLoadedFlag(flag: Locator, expectedPath?: string) {
  await expect(flag).toBeVisible();
  if (expectedPath) await expect(flag).toHaveAttribute('src', expectedPath);
  await expect.poll(
    async () => {
      try {
        await flag.scrollIntoViewIfNeeded({ timeout: 1_500 });
        return await flag.evaluateAll(
          (images) => images.some((image) => {
            const flagImage = image as HTMLImageElement;
            return flagImage.complete && flagImage.naturalWidth > 0 && flagImage.naturalHeight > 0;
          }),
        );
      } catch {
        return false;
      }
    },
    { timeout: 15_000 },
  ).toBe(true);
}


test('country profile loads the local Russia SVG flag', async ({ page }) => {
  await page.goto('/?lang=en&country=RUS');
  await waitForApp(page);

  const flag = page.locator('.cp2-flag .flag-slot.big img.flag-img.big');
  await expectLoadedFlag(flag, '/static/flags/ru.svg');
});


test('cross-index matrix renders local SVG flags for every country row', async ({ page }) => {
  await page.goto('/?lang=en&country=RUS');
  await waitForApp(page);
  await page.evaluate(() => (window as any).routeTo('matrix'));

  const rows = page.locator('.matrix-table tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 30_000 });
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  const flags = rows.locator('td:first-child .flag-slot.inline img.flag-img.inline');
  await expect(flags).toHaveCount(rowCount);
  const sources = await flags.evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  expect(sources.every((source) => /^\/static\/flags\/[a-z]{2}\.svg$/.test(source || ''))).toBe(true);

  const representativeRows = [...new Set([0, Math.floor(rowCount / 2), rowCount - 1])];
  for (const index of representativeRows) {
    await expectLoadedFlag(flags.nth(index));
  }
});


test('mobile country select displays the selected local flag as its background', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?lang=en&country=RUS');
  await waitForApp(page);

  const select = page.locator('#contextBar #countrySelect');
  const display = select.locator('xpath=following-sibling::*[contains(@class, "select-display")]');
  await expect(display).toBeVisible();
  await expect(display).toHaveCSS('background-size', '28px 19px');
  await expect.poll(() => display.evaluate((element) => getComputedStyle(element).backgroundImage)).toContain(
    '/static/flags/ru.svg',
  );
  await expect.poll(() => select.evaluate((element) => getComputedStyle(element).getPropertyValue('--country-flag-url'))).toContain(
    '/static/flags/ru.svg',
  );
});


test('profile flag falls back to ISO3 text when the SVG request is aborted', async ({ page }) => {
  await page.route('**/static/flags/ru.svg', (route) => route.abort('failed'));
  await page.goto('/?lang=en&country=RUS');
  await waitForApp(page);

  const slot = page.locator('.cp2-flag .flag-slot.big');
  await expect(slot).toHaveClass(/\bis-fallback\b/);
  await expect(slot.locator('img')).toHaveCount(0);
  const fallback = slot.locator('.flag-fallback.big');
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveText('RUS');
  await expect(fallback).toHaveAttribute('aria-label', /Russia/i);
});
