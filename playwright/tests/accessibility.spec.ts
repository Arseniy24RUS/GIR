import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const lang of ['ru', 'en'] as const) {
  test(`accessibility basics pass in ${lang.toUpperCase()} mode`, async ({ page }) => {
    await page.goto(`/?lang=${lang}&country=RUS`);
    await expect(page.locator('#countrySelect')).toBeVisible({ timeout: 30_000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(300);
    await page.addScriptTag({ content: axeSource });
    const results = await page.evaluate(async () => {
      return await (window as any).axe.run({
        include: [['.shell']],
        exclude: [['.map-viz'], ['.matrix-table tbody'], ['.ranking-table tbody']]
      }, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }
      });
    });
    const serious = results.violations.filter((violation: any) => ['serious', 'critical'].includes(violation.impact));
    expect(serious).toEqual([]);
  });
}

test('landing passes serious and critical WCAG checks', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}`);
  await expect(page.locator('.landing-page')).toBeVisible({ timeout: 30_000 });
  await page.addScriptTag({ content: axeSource });
  const results = await page.evaluate(async () => {
    return await (window as any).axe.run({ include: [['.shell']] }, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }
    });
  });
  const serious = results.violations.filter((violation: any) => ['serious', 'critical'].includes(violation.impact));
  expect(serious).toEqual([]);
});
