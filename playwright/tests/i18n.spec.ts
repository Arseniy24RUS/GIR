import { test, expect } from '@playwright/test';

const ruLabels = [
  'Индекс человеческого развития',
  'Индекс человеческого капитала',
  'Индекс глобальной конкурентоспособности талантов',
  'Глобальный инновационный индекс',
  'Индекс развития ИКТ',
  'QS: инженерия и технологии',
  'Индекс занятости в высокотехнологичных отраслях'
];

const enLabels = [
  'Human Development Index',
  'Human Capital Index',
  'Global Talent Competitiveness Index',
  'Global Innovation Index',
  'ICT Development Index',
  'QS Engineering & Technology',
  'High-Tech Employment Index'
];

const forbiddenRuPrimary = ['Human Development Index', 'ICT Development Index'];
const forbiddenEnPrimary = ['Индекс человеческого развития', 'Глобальный инновационный индекс', 'Индекс развития ИКТ'];

test('RU mode uses Russian primary labels', async ({ page }) => {
  await page.goto('/?lang=ru');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });
  await expect(page).toHaveTitle('GIR — Глобальный рейтинг индексов');
  for (const label of ruLabels) await expect(page.locator('#nav')).toContainText(label);
  for (const label of forbiddenRuPrimary) await expect(page.locator('body')).not.toContainText(label);
});

test('EN mode uses English labels', async ({ page }) => {
  await page.goto('/?lang=en');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });
  await expect(page).toHaveTitle('GIR — Global Index Ranker');
  for (const label of enLabels) await expect(page.locator('#nav')).toContainText(label);
  for (const label of forbiddenEnPrimary) await expect(page.locator('body')).not.toContainText(label);
});
