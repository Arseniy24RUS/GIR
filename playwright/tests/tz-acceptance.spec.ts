import { test, expect } from '@playwright/test';

test('MGIMO ToR acceptance page contains exactly four original task/result pairs', async ({ page, request }) => {
  const api = await request.get('/api/acceptance/tz?lang=ru');
  expect(api.ok()).toBeTruthy();
  const payload = await api.json();
  expect(payload.summary.items_total).toBe(4);
  expect(payload.items.map((x: any) => [x.id, x.result_id])).toEqual([
    ['2.1','3.1.2'], ['2.2','3.2.1'], ['2.3','3.3.1'], ['2.4','3.4.1']
  ]);
  expect(JSON.stringify(payload)).not.toContain('8/8');
  await page.goto('/?lang=ru');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => (window as any).routeTo('acceptance'));
  await expect(page.locator('.acceptance-item')).toHaveCount(4, { timeout: 30_000 });
  await expect(page.locator('body')).toContainText('3.4.1');
  await expect(page.locator('body')).toContainText('Создана интегрированная база данных');
});
