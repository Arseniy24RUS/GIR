import { test, expect } from '@playwright/test';

async function openPage(page, route: 'htei-model' | 'policy-center', lang = 'ru') {
  await page.goto(`/?lang=${lang}&country=RUS&year=2026#${route}`);
  await page.waitForFunction(() => (window as any).__GIIP_READY__ === true, null, { timeout: 45_000 });
}

test.describe('Stage 4 — training-system model', () => {
  test('renders four-block analytical workspace and international universe', async ({ page }) => {
    await openPage(page, 'htei-model');
    await expect(page.locator('.training-page')).toBeVisible();
    await expect(page.locator('.s4-block-card')).toHaveCount(4);
    await expect(page.locator('.s4-component-row')).toHaveCount(13);
    await expect(page.locator('.s4-source-card')).toHaveCount(8);
    await expect(page.locator('.s4-ranking-table tbody tr')).toHaveCount(25);
    await expect(page.locator('.s4-ranking-panel')).toContainText('135');
    await expect(page.locator('.s4-contribution-panel')).toContainText(/41[,.]97|41[,.]9/);

    const benchmark = page.locator('[data-s4-benchmark="BRICS5"]');
    await benchmark.dispatchEvent('click');
    await expect(page.locator('[data-s4-benchmark="BRICS5"]')).toHaveAttribute('aria-pressed', 'true');

    const search = page.locator('#s4RankingSearch');
    await search.fill('Германия');
    await expect(page.locator('.s4-ranking-table tbody tr')).toHaveCount(1);
    await expect(page.locator('.s4-ranking-table tbody')).toContainText('Германия');
  });

  test('component evidence opens an accessible provenance drawer', async ({ page }) => {
    await openPage(page, 'htei-model');
    const trigger = page.locator('.s4-component-group[open] [data-s4-provenance]').first();
    await trigger.focus();
    await trigger.click();
    await expect(page.locator('#drawer')).toHaveClass(/open/);
    await expect(page.locator('#drawer .prov-list')).toBeVisible();
    await expect(page.locator('#drawerClose')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#drawer')).not.toHaveClass(/open/);
    await expect(trigger).toBeFocused();
  });
});

test.describe('Stage 4 — Russia recommendations centre', () => {
  test('connects diagnosis, roadmap, KPIs, actors and all eight measures', async ({ page }) => {
    await openPage(page, 'policy-center');
    await expect(page.locator('.policy-page')).toBeVisible();
    await expect(page.locator('.s4-strand-card')).toHaveCount(4);
    await expect(page.locator('.s4-roadmap-row')).toHaveCount(8);
    await expect(page.locator('.s4-kpi-table tbody tr')).toHaveCount(8);
    await expect(page.locator('.s4-action-card')).toHaveCount(8);
    await expect(page.locator('.s4-actor-list > div')).toHaveCount(12);
    await expect(page.locator('.context-fixed')).toHaveCount(2);
    await expect(page.locator('.policy-page')).toContainText('2026–2030');
    await expect(page.locator('.policy-page')).toContainText(/не утверждённый|не утверждённым/i);

    const firstStrand = page.locator('[data-s4-strand]').nth(1);
    await firstStrand.dispatchEvent('click');
    await expect(page.locator('[data-s4-strand]').nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.s4-action-card')).toHaveCount(3);

    await page.locator('[data-s4-strand="all"]').dispatchEvent('click');
    await page.locator('#s4PolicyHorizon').selectOption('short');
    const shortCount = await page.locator('.s4-action-card').count();
    expect(shortCount).toBeGreaterThan(0);
    expect(shortCount).toBeLessThan(8);
  });

  test('mobile layouts do not overflow the document', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile projects only');
    await openPage(page, 'policy-center');
    const overflow = await page.evaluate(() => document.scrollingElement!.scrollWidth > document.scrollingElement!.clientWidth + 4);
    expect(overflow).toBeFalsy();
  });
});
