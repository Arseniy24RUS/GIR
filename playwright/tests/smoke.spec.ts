import { test, expect } from '@playwright/test';

test('app loads and has major navigation', async ({ page }) => {
  await page.goto('/?lang=ru');
  await expect(page).toHaveTitle('GIR — Глобальный рейтинг индексов');
  await expect(page.locator('[data-gir-logo]').first()).toHaveAttribute('alt', 'GIR — Глобальный рейтинг индексов');
  await expect(page.locator('#nav .nav-group')).toHaveCount(4, { timeout: 30_000 });
});

test('health API is ok', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(JSON.stringify(json).toLowerCase()).toContain('ok');
});
