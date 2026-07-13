import { test, expect } from '@playwright/test';

async function waitForAppReady(page: any) {
  await page.waitForFunction(() => (window as any).__GIIP_READY__ === true, undefined, { timeout: 60_000 });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
}

async function waitForReady(page: any) {
  await waitForAppReady(page);
  await expect(page.locator('.card').first()).toBeVisible({ timeout: 30_000 });
  await page.waitForFunction(() => Array.from(document.images).every((image) => {
    const img = image as HTMLImageElement;
    const rect = img.getBoundingClientRect();
    const affectsViewport = rect.bottom >= 0 && rect.top <= window.innerHeight
      && rect.right >= 0 && rect.left <= window.innerWidth;
    return !affectsViewport || (img.complete && img.naturalWidth > 0);
  }));
  if (await page.locator('.map-wrap').count()) {
    await expect(page.locator('.map-viz').first()).toBeVisible({ timeout: 30_000 });
  }
  await page.waitForTimeout(350);
}

async function waitForLanding(page: any) {
  await waitForAppReady(page);
  await expect(page.locator('.landing-page')).toBeVisible();
  await expect(page.locator('img[data-landing-hero]')).toBeVisible();
  await page.waitForFunction(() => Array.from(document.images).filter((image) => {
    const rect = image.getBoundingClientRect();
    return rect.bottom >= 0 && rect.top <= window.innerHeight;
  }).every((image) => image.complete && image.naturalWidth > 0));
  await page.waitForTimeout(350);
}

const shot = {
  fullPage: false,
  animations: 'disabled' as const,
  caret: 'hide' as const,
};

test('landing viewport visual snapshot', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}`, { waitUntil: 'domcontentloaded' });
  await waitForLanding(page);
  await expect(page).toHaveScreenshot('landing-viewport.png', shot);
});

test('country profile viewport visual snapshot', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}&country=RUS`, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);
  await expect(page).toHaveScreenshot('country-profile-viewport.png', shot);
});

test('HTEI viewport visual snapshot', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}&index=HTEI`, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);
  await expect(page.locator('#hteiMode')).toBeVisible({ timeout: 30_000 });
  await expect(page).toHaveScreenshot('index-htei-viewport.png', shot);
});

test('HTEI ASOF diagnostic visual snapshot', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}&index=HTEI`, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);
  await page.locator('#hteiMode').selectOption('asof_diagnostic');
  await expect(page.locator('body')).toContainText(lang === 'ru' ? 'Диагностический ASOF-профиль' : 'Diagnostic ASOF profile');
  await expect(page).toHaveScreenshot('htei-asof-diagnostic.png', shot);
});

test('country excluded from Comparable falls back to unranked ASOF visual snapshot', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}&index=HTEI&country=AFG`, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);
  await expect(page.locator('body')).toContainText(lang === 'ru' ? 'Место не присваивается' : 'No rank is assigned');
  await expect(page).toHaveScreenshot('country-asof-fallback.png', shot);
});

test('historical HCI status visual snapshot', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}&index=HCI_PLUS`, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);
  await expect(page.locator('body')).toContainText(lang === 'ru' ? 'Исторический HCI' : 'Historical HCI');
  await expect(page).toHaveScreenshot('index-hci-historical.png', shot);
});

test('derived QS country aggregation visual snapshot', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}&index=QS_ET`, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);
  await expect(page.locator('body')).toContainText(lang === 'ru' ? 'Авторская страновая агрегация' : 'country aggregation');
  await expect(page).toHaveScreenshot('index-qs-derived.png', shot);
});

test('exact four-item ToR acceptance visual snapshot', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}#acceptance`, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);
  await expect(page.locator('.acceptance-item')).toHaveCount(4);
  await expect(page).toHaveScreenshot('tor-acceptance.png', shot);
});

test('methodology and release blockers visual snapshot', async ({ page }, testInfo) => {
  const lang = testInfo.project.name.includes('en') ? 'en' : 'ru';
  await page.goto(`/?lang=${lang}#methodology`, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);
  await expect(page.locator('body')).toContainText(lang === 'ru' ? 'Готовность к передаче заказчику' : 'Customer release readiness');
  await expect(page).toHaveScreenshot('methodology-readiness.png', shot);
});
