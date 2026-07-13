import { expect, test } from '@playwright/test';

test.describe('Stage 5 Data Lab', () => {
  test('catalog, explorer and file library form one usable workflow', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

    await page.goto('/data-lab');
    await expect(page).toHaveTitle(/Data|Данные/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/Доказательная база|Evidence base/)).toBeVisible();

    await page.getByRole('button', { name: /Data Explorer/i }).click();
    await expect(page.locator('#dl-explorer-main')).toBeVisible();
    await page.getByRole('button', { name: /Построить|Run analysis/ }).first().click();
    await expect(page.locator('.dl-visual')).toBeVisible();
    await expect(page.locator('.dl-table tbody tr').first()).toBeVisible();

    await page.getByRole('button', { name: /Файлы|Files/ }).click();
    await expect(page.locator('.dl-file-row').first()).toBeVisible();
    await page.locator('.dl-file-action').first().click();
    await expect(page.locator('#dl-dialog[open]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#dl-dialog')).not.toHaveAttribute('open', '');

    expect(errors).toEqual([]);
  });

  test('mobile view has no document-level horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/data-lab');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 4);
    expect(overflow).toBeFalsy();
  });
});
