import { test, expect } from '@playwright/test';

test('manual light and dark theme controls exist and work', async ({ page }) => {
  await page.goto('/?lang=ru&theme=dark');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });

  const theme = page.locator('#themeBtn');
  const themeIcon = theme.locator('img#themeIcon');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(themeIcon).toBeVisible();
  await expect(themeIcon).toHaveAttribute('src', /\/static\/icons\/sun\.svg$/);
  await expect(theme).toHaveText('');
  await theme.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(themeIcon).toHaveAttribute('src', /\/static\/icons\/moon\.svg$/);
});

test('language toggle is a single state button', async ({ page }) => {
  await page.goto('/?lang=ru');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });

  const lang = page.locator('#langBtn');
  await expect(lang).toHaveText('RU');
  await lang.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(lang).toHaveText('EN');
});
