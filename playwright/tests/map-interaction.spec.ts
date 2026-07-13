import { test, expect } from '@playwright/test';

const INDEX_CODES = ['HDI', 'HCI_PLUS', 'GTCI', 'GII', 'IDI', 'QS_ET', 'HTEI'];

test('all choropleths use adaptive quantile colors and real-value legends', async ({ page }) => {
  await page.goto('/?lang=en&country=RUS&theme=light');
  await expect(page.locator('.map-viz')).toBeVisible({ timeout: 45_000 });

  for (const code of INDEX_CODES) {
    await page.locator('#mapIndex').selectOption(code);
    const map = page.locator(`.map-viz[data-index="${code}"]`);
    await expect(map).toBeVisible();
    await expect(map).toHaveAttribute('data-scale-mode', 'quantile');
    await expect(map.locator('.map-legend-segment')).toHaveCount(7);

    const scale = await map.evaluate((svg) => {
      const countries = Array.from(svg.querySelectorAll<SVGPathElement>('.map-country[data-score]'));
      return {
        bins: new Set(countries.map((country) => country.dataset.mapBin)).size,
        fills: new Set(countries.map((country) => country.getAttribute('fill'))).size,
        min: Number(svg.getAttribute('data-scale-min')),
        max: Number(svg.getAttribute('data-scale-max')),
      };
    });

    expect(scale.bins, `${code} should occupy the map color range`).toBeGreaterThanOrEqual(6);
    expect(scale.fills, `${code} should render distinct country colors`).toBeGreaterThanOrEqual(6);
    expect(scale.max, `${code} legend should expose a real score range`).toBeGreaterThan(scale.min);
  }
});

test('SVG world map supports click, keyboard focus and shift-click benchmark selection', async ({ page }) => {
  await page.goto('/?lang=en&country=RUS');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.map-viz')).toBeVisible({ timeout: 45_000 });

  const china = page.locator('.map-country[data-iso="CHN"]').first();
  await expect(china).toBeVisible({ timeout: 45_000 });
  await china.click({ modifiers: ['Shift'] });
  await expect(page.locator('#customBenchmark')).toContainText('CHN');

  const india = page.locator('.map-country[data-iso="IND"]').first();
  await expect(india).toBeVisible({ timeout: 30_000 });
  await india.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('body')).toContainText(/India|Country command center/i);
});
