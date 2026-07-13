import { test, expect } from '@playwright/test';

const indices = ['HDI', 'HCI_PLUS', 'GTCI', 'GII', 'IDI', 'QS_ET', 'HTEI'];

for (const idx of indices) {
  test(`index page ${idx} exposes formula/components/source`, async ({ page }) => {
    await page.goto(`/?index=${idx}&lang=ru`);
    await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('body')).toContainText(/формул|компонент|источник|рейтинг/i);
  });
}
