import { test, expect } from '@playwright/test';

test('country profile is a complete analytical workspace', async ({ page }, testInfo) => {
  const english = testInfo.project.name.includes('-en');
  const lang = english ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}&country=RUS#country`);

  const workspace = page.locator('.cp2-page');
  await expect(workspace).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('.cp2-index-card')).toHaveCount(7);
  await expect(page.locator('.cp2-policy')).toHaveCount(8);
  await expect(page.locator('.cp2-jump button')).toHaveCount(7);
  await expect(page.locator('.cp2-country h1')).toContainText(english ? 'Russian Federation' : 'Россия');

  const hci = page.locator('.cp2-index-card').filter({ hasText: 'HCI+' });
  await expect(hci).toContainText('/ 325');
  await expect(page.locator('body')).not.toContainText('AUS, AUT, BEL');
  await expect(page.locator('body')).not.toContainText('Блоки исходного ТЗ');

  const overflow = await page.evaluate(() => document.scrollingElement!.scrollWidth > document.scrollingElement!.clientWidth + 4);
  expect(overflow).toBeFalsy();
});

test('benchmark selection and HTEI v6 provenance are interactive', async ({ page }, testInfo) => {
  const english = testInfo.project.name.includes('-en');
  const lang = english ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}&country=RUS#country`);
  await expect(page.locator('.cp2-page')).toBeVisible({ timeout: 45_000 });

  await page.locator('#cp2Benchmark').selectOption('BRICS');
  await expect(page.locator('.cp2-benchmark h2')).toHaveText(english ? 'BRICS' : 'БРИКС');
  await expect(page.locator('.cp2-peer')).toHaveCount(5);

  const hteiEvidence = page.locator('.cp2-index-card.is-project [data-cp2-provenance]');
  await hteiEvidence.focus();
  await hteiEvidence.click();
  await expect(page.locator('#drawer.open .cp2-prov')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#drawer .drawer-close')).toBeFocused();
  await expect(page.locator('#drawer')).toContainText(/HTEI|HTEI_V6/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#drawer')).not.toHaveClass(/open/);
  await expect(hteiEvidence).toBeFocused();
});
