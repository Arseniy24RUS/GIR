import { test, expect } from '@playwright/test';

test('stage 7 comparison workspace supports profiles, relationships, trends and exact matrix', async ({ page }) => {
  await page.goto('/?lang=ru&year=2026');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => (window as any).routeTo('matrix'));

  await expect(page.locator('#s7Title')).toContainText(/Сравнение стран|Country comparison/, { timeout: 30_000 });
  await expect(page.locator('#matrixGroup')).toBeVisible();
  await expect(page.locator('#s7Profiles')).toBeVisible();
  await expect(page.locator('#s7Relationships')).toBeVisible();
  await expect(page.locator('#s7Trends')).toBeVisible();
  await expect(page.locator('#s7Matrix')).toBeVisible();

  expect(await page.locator('.s7-profile-point').count()).toBeGreaterThanOrEqual(35);
  expect(await page.locator('.s7-scatter-point').count()).toBeGreaterThanOrEqual(15);
  await expect(page.locator('.s7-corr-cell')).toHaveCount(49);
  await expect(page.locator('.matrix-table tbody tr')).toHaveCount(19);

  await page.locator('#matrixGroup').selectOption('BRICS');
  await expect(page.locator('.matrix-table tbody tr')).toHaveCount(5);
  await page.locator('#matrixMetric').selectOption('score');
  await expect(page.locator('.matrix-table .cell-rank').first()).toContainText(/\d/);

  await page.locator('#s7ScatterX').selectOption('HDI');
  await page.locator('#s7ScatterY').selectOption('GII');
  await expect(page.locator('.s7-scatter-figure h3')).toContainText(/HDI|ИЧР/);

  const correlation = page.locator('.s7-corr-cell[data-s7-corr-x="GII"][data-s7-corr-y="HDI"]');
  await correlation.click();
  await expect(page.locator('#s7ScatterX')).toHaveValue('GII');
  await expect(page.locator('#s7ScatterY')).toHaveValue('HDI');

  await page.locator('#s7TrendIndex').selectOption('HDI');
  await expect(page.locator('.s7-trend-chart')).toBeVisible();
  await page.locator('[data-s7-trend-metric="rank"]').click();
  await expect(page.locator('[data-s7-trend-metric="rank"]')).toHaveAttribute('aria-pressed', 'true');

  const csvHref = await page.locator('a[download^="cross-matrix"]').getAttribute('href');
  expect(csvHref || '').toContain('/api/cross-matrix.csv');
  expect(csvHref || '').toContain('sort_index=');

  await page.locator('.matrix-table .cell-rank').first().click();
  await expect(page.locator('#drawer.open .drawer-panel')).toBeVisible();
  await page.locator('.drawer-close').click();

  await page.locator('.country-link').first().click();
  await expect(page.locator('h1').first()).toContainText(/Панель ЛПР|Country command center/, { timeout: 30_000 });
});

test('stage 7 mobile layout has no document overflow and preserves chart alternatives', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile-'), 'mobile project only');
  await page.goto('/?lang=ru&year=2026');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => (window as any).routeTo('matrix'));
  await expect(page.locator('#s7Title')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.s7-accessible-data')).toHaveCount(3);
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.scrollingElement?.scrollWidth || 0,
    clientWidth: document.scrollingElement?.clientWidth || 0,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 4);
});
