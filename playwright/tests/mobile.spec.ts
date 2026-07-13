import { test, expect } from '@playwright/test';

test('mobile/tablet layout exposes navigation and country profile without horizontal overflow', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}&country=RUS`);
  await expect(page.locator('#contextBar #countrySelect')).toHaveValue('RUS', { timeout: 30_000 });
  await expect(page.locator('#countrySelect')).toHaveCount(1);
  await expect(page.locator('#yearSelect')).toHaveCount(1);
  const overflow = await page.evaluate(() => {
    const root = document.scrollingElement || document.documentElement;
    return root.scrollWidth > root.clientWidth + 4;
  });
  expect(overflow).toBeFalsy();
  await expect(page.locator('h1').first()).toContainText(lang === 'ru' ? 'Россия' : 'Russia');
});
