import { test, expect } from '@playwright/test';

const hteiUrl = (params = '') => `/?country=RUS&year=2026&lang=ru&theme=dark&htei_mode=proxy_extended${params}#index-HTEI`;

test('HTEI workspace exposes modes, components, uncertainty and international ranking', async ({ page }) => {
  await page.goto(hteiUrl());
  await expect(page.locator('.htei-workspace')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('.htei-mode-card')).toHaveCount(4);
  await expect(page.locator('.htei-component')).toHaveCount(6);
  await expect(page.locator('.htei-score-line strong')).toHaveText(/54[,.]9/);
  await expect(page.locator('.htei-position-line')).toContainText(/25/);
  await expect(page.locator('#htei-quality')).toContainText('2019–2025');
  await expect(page.locator('[data-htei-comparison]')).toHaveCount(2);
  await expect(page.locator('.htei-ranking-table tbody tr')).toHaveCount(25);
});

test('unavailable strict mode explains the limitation instead of silently switching', async ({ page }) => {
  await page.goto(hteiUrl());
  await expect(page.locator('.htei-workspace')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('.htei-mode-card.is-active')).toHaveAttribute('data-htei-mode', 'proxy_extended');
  await page.locator('[data-htei-mode="direct_core"]').click();
  await expect(page.locator('#toast.visible')).toContainText(/отсутствует|набор|прям/i);
  await expect(page.locator('.htei-mode-card.is-active')).toHaveAttribute('data-htei-mode', 'proxy_extended');
});

test('component provenance is keyboard accessible and closes with Escape', async ({ page }) => {
  await page.goto(hteiUrl());
  await expect(page.locator('.htei-workspace')).toBeVisible({ timeout: 45_000 });
  const trigger = page.locator('.htei-component .htei-evidence-button').first();
  await trigger.focus();
  await trigger.click();
  await expect(page.locator('#drawer.open .prov-list')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('#drawer')).toContainText('SHA-256');
  await expect(page.locator('.drawer-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#drawer')).not.toHaveClass(/open/);
  await expect(trigger).toBeFocused();
});

test('ASOF profile remains unranked', async ({ page }) => {
  await page.goto('/?country=RUS&year=2026&lang=ru&theme=dark&htei_mode=asof_diagnostic#index-HTEI');
  await expect(page.locator('.htei-workspace')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('.htei-position-line')).toContainText('место не присваивается');
  await expect(page.locator('.htei-mode-card.is-active')).toHaveAttribute('data-htei-mode', 'asof_diagnostic');
  await expect(page.locator('.htei-ranking-table thead')).not.toContainText('Место');
});

test('mobile first viewport prioritises the result and has no document overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(hteiUrl());
  await expect(page.locator('.htei-workspace')).toBeVisible({ timeout: 45_000 });
  const resultBox = await page.locator('.htei-result-card').boundingBox();
  const narrativeBox = await page.locator('.htei-hero-main').boundingBox();
  expect(resultBox).not.toBeNull();
  expect(narrativeBox).not.toBeNull();
  expect(resultBox!.y).toBeLessThan(narrativeBox!.y);
  const overflow = await page.evaluate(() => document.scrollingElement!.scrollWidth > document.scrollingElement!.clientWidth + 4);
  expect(overflow).toBe(false);
});
