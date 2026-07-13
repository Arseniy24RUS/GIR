import { test, expect } from '@playwright/test';

test('cross-index matrix supports group, metric, sorting, CSV and country drill-down', async ({ page, request }) => {
  const api = await request.get('/api/cross-matrix?year=2026&group=BRICS&metric=rank&sort_index=HTEI&sort_metric=rank&sort_dir=asc&lang=ru');
  expect(api.ok()).toBeTruthy();
  const payload = await api.json();
  expect(payload.group).toBe('BRICS');
  expect(payload.metric).toBe('rank');
  expect(payload.sort_index).toBe('HTEI');
  expect(payload.countries.length).toBeGreaterThan(0);
  const ranks = payload.countries.map((country: any) => country.indices.HTEI.rank);
  expect(ranks).toEqual([...ranks].sort((a: number, b: number) => a - b));

  await page.goto('/?lang=en');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => (window as any).routeTo('matrix'));
  await expect(page.locator('#matrixGroup')).toBeVisible({ timeout: 30_000 });
  await page.locator('#matrixGroup').selectOption('BRICS');
  await expect(page.locator('.matrix-table tbody tr')).toHaveCount(payload.countries.length);
  await page.locator('#matrixMetric').selectOption('score');
  await expect(page.locator('.matrix-table .cell-rank').first()).toContainText(/\d/);
  await page.locator('.table-head-btn').filter({ hasText: /HTEI|High-Tech/i }).first().click();
  await expect(page.locator('.table-head-btn').filter({ hasText: /HTEI|High-Tech/i }).first()).toContainText(/↑|↓/);

  const csvHref = await page.locator('a[download^="cross-matrix"]').getAttribute('href');
  expect(csvHref || '').toContain('/api/cross-matrix.csv');
  expect(csvHref || '').toContain('sort_index=HTEI');

  await page.locator('.country-link').first().click();
  await expect(page.locator('h1').first()).toContainText(/Country command center/i, { timeout: 30_000 });
});
