import { test, expect } from '@playwright/test';

test('index page has provenance drawer/source metadata', async ({ page }) => {
  await page.goto('/?lang=ru&country=RUS&year=2026&index=HDI');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });

  const provenanceButton = page.locator('button[onclick^="openProvenance"]').first();
  await expect(provenanceButton).toBeVisible({ timeout: 30_000 });
  await provenanceButton.click();

  const drawer = page.locator('#drawer');
  await expect(drawer).toHaveAttribute('aria-hidden', 'false', { timeout: 30_000 });
  await expect(drawer).toContainText(/UNDP|World Bank|WIPO|ITU|Portulans|QS/);
  await expect(drawer).toContainText(/SHA-256|Snapshot|Снапшот|Получено/i);
});

test('no placeholder strings appear in UI', async ({ page }) => {
  await page.goto('/?lang=ru&country=RUS&year=2026');
  await expect(page.locator('#nav button').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('body')).not.toContainText(/placeholder|TODO|TBD|lorem|mock|fake|synthetic|generated|demo|sample|seed|example country|example score|заглушка|демо-данные|сгенерировано|пример страны|пример значения/i);
  await expect(page.locator('body')).toContainText(/QS|официальный|endpoint/i);
});
