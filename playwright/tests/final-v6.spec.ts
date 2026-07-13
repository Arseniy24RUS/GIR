import { test, expect } from '@playwright/test';

test('HTEI v6 separates comparable rankings from non-ranked ASOF diagnostics', async ({ request }) => {
  const asof = await request.get('/api/htei/v6/profile/RUS?mode=asof_diagnostic');
  expect(asof.ok()).toBeTruthy();
  const asofData = await asof.json();
  expect(asofData.available).toBeTruthy();
  expect(asofData.profile.rank).toBeNull();
  expect(asofData.profile.eligible_for_ranking).toBe(0);
  expect(asofData.profile.formula_version).toContain('htei-v6');

  const common = await request.get('/api/htei/v6/ranking?mode=common_support&limit=10');
  expect(common.ok()).toBeTruthy();
  const commonData = await common.json();
  expect(commonData.total).toBeGreaterThanOrEqual(80);
  expect(commonData.ranking.every((r: any) => r.rank != null)).toBeTruthy();
  expect(new Set(commonData.ranking.map((r: any) => r.component_signature)).size).toBe(1);

  const direct = await request.get('/api/htei/v6/ranking?mode=direct_core&limit=10');
  expect(direct.ok()).toBeTruthy();
  const directData = await direct.json();
  expect(directData.total).toBeGreaterThanOrEqual(25);
});

test('HCI and HCI+ have a transparent combined-series contract', async ({ request }) => {
  const response = await request.get('/api/human-capital/combined/RUS');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.primary_edition).toBe('HCI+ 2026');
  expect(data.methodology_break).toBeTruthy();
  expect(data.historical_hci.length).toBeGreaterThanOrEqual(1);
  expect(data.display_series.every((p: any) => p.edition === 'HCI' || p.edition === 'HCI_PLUS_2026')).toBeTruthy();
  expect(data.warning_ru).toContain('разными официальными редакциями');
  expect(data.warning_en).toContain('different official editions');
});

test('current GIR interface exposes final v6 modes and methodological warnings', async ({ page }) => {
  await page.goto('/?index=HTEI&lang=ru');
  await expect(page.locator('#hteiMode')).toBeVisible({ timeout: 30_000 });
  const modes = await page.locator('#hteiMode option').evaluateAll((options) =>
    options.map((option) => (option as HTMLOptionElement).value),
  );
  expect(modes).toContain('common_support');
  await page.locator('#hteiMode').selectOption('asof_diagnostic');
  await expect(page.locator('body')).toContainText('Место не присваивается');
  await expect(page.locator('.asof-coverage-table .rank-pill')).toHaveCount(0);
});

test('Russian and English policy brief fields are semantically localized', async ({ request }) => {
  const response = await request.get('/api/policy-brief/RUS');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  const items = data.items || data.recommendations || data;
  expect(items.length).toBeGreaterThanOrEqual(6);
  for (const item of items) {
    expect(item.title_ru || item.problem_ru).toMatch(/[А-Яа-яЁё]/);
    expect(item.title_en || item.problem_en).not.toMatch(/[А-Яа-яЁё]/);
    expect(item.measure_en || item.recommendation_en || '').not.toMatch(/[А-Яа-яЁё]/);
  }
});

test('acceptance matrix exposes exactly the four original MGIMO ToR result pairs', async ({ request }) => {
  const response = await request.get('/api/acceptance/tz?lang=ru');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.items).toHaveLength(4);
  expect(data.items.map((i: any) => `${i.id}->${i.result_id}`)).toEqual([
    '2.1->3.1.2', '2.2->3.2.1', '2.3->3.3.1', '2.4->3.4.1'
  ]);
});

test('final v6 release readiness never hides outstanding online evidence', async ({ request }) => {
  const response = await request.get('/api/release/readiness');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.version).toBe('GIIP-final-release-v6');
  expect(['final_release_candidate', 'customer_final_release']).toContain(data.readiness_level);
  if (!data.release_ready) {
    expect(data.blockers.length).toBeGreaterThan(0);
  }
});
