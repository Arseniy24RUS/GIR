import { test, expect } from '@playwright/test';

test('HTEI v5 exposes comparable and ASOF modes without ranking diagnostic profiles', async ({ page, request }) => {
  const asof = await request.get('/api/htei/v5/profile/RUS?mode=asof_diagnostic');
  expect(asof.ok()).toBeTruthy();
  const asofData = await asof.json();
  expect(asofData.profile.rank).toBeNull();
  expect(asofData.profile.eligible_for_ranking).toBe(0);

  const core = await request.get('/api/htei/v5/ranking?mode=comparable_core&limit=10');
  const coreData = await core.json();
  expect(coreData.total).toBeGreaterThanOrEqual(30);
  expect(coreData.ranking.every((r: any) => r.rank != null)).toBeTruthy();

  await page.goto('/?index=HTEI&lang=ru');
  await expect(page.locator('#hteiMode')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#rankingPageSize')).toBeVisible();
  await page.locator('#hteiMode').selectOption('asof_diagnostic');
  await expect(page.locator('body')).toContainText('Диагностический ASOF-профиль');
  await expect(page.locator('body')).toContainText('Место не присваивается');
  await expect(page.locator('.asof-coverage-card')).toBeVisible();
  await expect(page.locator('.asof-coverage-table .rank-pill')).toHaveCount(0);
  await expect(page.locator('.asof-coverage-table thead')).not.toContainText('#');
});

test('methodology page distinguishes official scores, derived aggregation and project index', async ({ page }) => {
  await page.goto('/?lang=ru');
  await expect(page.locator('#nav .nav-group')).toHaveCount(4, { timeout: 30_000 });
  await page.evaluate(() => (window as any).routeTo('methodology'));
  await expect(page.locator('body')).toContainText('HCI+ 2026');
  await expect(page.locator('body')).toContainText('QS Engineering & Technology');
  await expect(page.locator('body')).toContainText('HTEI v6');
});

test('ranking UI renders a bounded page rather than all countries', async ({ page }) => {
  await page.goto('/?index=HTEI&lang=ru');
  await expect(page.locator('.ranking-table tbody tr')).toHaveCount(25, { timeout: 30_000 });
  await page.locator('#rankingPageSize').selectOption('50');
  await expect(page.locator('.ranking-table tbody tr')).toHaveCount(50);
});

test('scientific release aliases expose stable integration contracts', async ({ request }) => {
  const endpoints = [
    '/api/htei/v5?iso3=RUS&mode=asof_diagnostic',
    '/api/htei/v5/validation',
    '/api/index-methodology',
    '/api/index-methodology/HTEI',
    '/api/policy-brief/RUS',
    '/api/governance/licenses',
    '/api/governance/external-reviews',
  ];
  for (const endpoint of endpoints) {
    const response = await request.get(endpoint);
    expect(response.ok(), `${endpoint} must be available`).toBeTruthy();
  }
});
