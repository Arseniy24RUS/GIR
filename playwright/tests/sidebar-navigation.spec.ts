import { test, expect, type Page } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

async function waitForNavigation(page: Page) {
  await expect(page.locator('#nav .nav-group')).toHaveCount(4, { timeout: 30_000 });
  await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true', { timeout: 30_000 });
  await expect(page.locator('#nav .nav-item').first()).toBeVisible();
}

test('wide desktop landing uses a compact rail and persists an explicit user expansion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?lang=ru');
  await waitForNavigation(page);

  const root = page.locator('html');
  const toggle = page.locator('#sidebarToggle');
  await expect(root).toHaveAttribute('data-sidebar', 'collapsed');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#nav .nav-copy').first()).toBeHidden();
  await expect(page.locator('.header-gir-home')).toBeVisible();

  await toggle.click();
  await expect(root).toHaveAttribute('data-sidebar', 'expanded');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#nav .nav-copy').first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('gir-sidebar'))).toBe('expanded');

  await page.reload();
  await waitForNavigation(page);
  await expect(root).toHaveAttribute('data-sidebar', 'expanded');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
});

test('wide desktop analytics expands automatically when no sidebar preference exists', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?lang=ru');
  await waitForNavigation(page);
  await page.evaluate(() => localStorage.removeItem('gir-sidebar'));

  await page.locator('#nav .nav-item[aria-label="Профиль страны"]').click();
  await expect(page).toHaveURL(/#country$/);
  await expect(page.locator('#contextBar')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('html')).toHaveAttribute('data-sidebar', 'expanded');
  await expect(page.locator('#nav .nav-copy').first()).toBeVisible();
});

test('desktop sidebar scrolls with the document and has no independent scrollbar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?lang=ru');
  await waitForNavigation(page);

  const sidebar = page.locator('#sidebar');
  await expect(sidebar).toHaveCSS('position', 'relative');
  await expect(sidebar).toHaveCSS('overflow-y', 'visible');
  const initialY = await sidebar.evaluate((element) => element.getBoundingClientRect().y);
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect.poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().y)).toBeLessThan(initialY - 400);
});

test('1280 desktop defaults to a collapsed sidebar with coded index items', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/?lang=ru');
  await waitForNavigation(page);

  const innovation = page.locator('#nav .nav-item[aria-label="Глобальный инновационный индекс"]');
  await expect(page.locator('html')).toHaveAttribute('data-sidebar', 'collapsed');
  await expect(page.locator('#sidebarToggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(innovation.locator('.nav-code')).toHaveText('GII');
  await expect(innovation.locator('.nav-code')).toBeVisible();
  const hciPlusCode = page.locator('#nav .nav-item[onclick="routeTo(\'index-HCI_PLUS\')"] .nav-code');
  await expect(hciPlusCode).toHaveText('HCI+');
  const codeBox = await hciPlusCode.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, fontWeight: Number(style.fontWeight) };
  });
  expect(codeBox.width).toBe(codeBox.height);
  expect(codeBox.fontWeight).toBeGreaterThanOrEqual(700);
  await expect(innovation.locator('.nav-copy')).toBeHidden();
  await expect(innovation).toHaveAttribute('title', 'Глобальный инновационный индекс');
  await expect(innovation).toHaveAttribute('aria-label', 'Глобальный инновационный индекс');
});

test('tablet uses a collapsed rail that opens as an overlay', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1024 });
  await page.goto('/?lang=en');
  await waitForNavigation(page);

  const root = page.locator('html');
  const toggle = page.locator('#sidebarToggle');
  const backdrop = page.locator('#sidebarBackdrop');
  await expect(root).toHaveAttribute('data-sidebar', 'collapsed');
  await expect(root).not.toHaveClass(/sidebar-overlay-open/);
  await expect(page.locator('#mobileMenuBtn')).toBeHidden();
  await expect(page.locator('#nav .nav-code').first()).toBeVisible();
  await expect(page.locator('#nav .nav-copy').first()).toBeHidden();

  await toggle.click();
  await expect(root).toHaveClass(/sidebar-overlay-open/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(backdrop).toBeVisible();
  await expect(page.locator('#nav .nav-copy').first()).toBeVisible();
  await expect(page.locator('#sidebar')).toHaveCSS('overflow-y', 'auto');

  await backdrop.click({ position: { x: 880, y: 20 } });
  await expect(root).not.toHaveClass(/sidebar-overlay-open/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('mobile drawer closes from backdrop and Escape and returns focus to its trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?lang=en');
  await waitForNavigation(page);

  const root = page.locator('html');
  const menu = page.locator('#mobileMenuBtn');
  const backdrop = page.locator('#sidebarBackdrop');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(root).not.toHaveClass(/sidebar-overlay-open/);

  await menu.click();
  await expect(root).toHaveClass(/sidebar-overlay-open/);
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(backdrop).toBeVisible();
  await expect(page.locator('#sidebar a, #sidebar button').first()).toBeFocused();

  await backdrop.click({ position: { x: 380, y: 20 } });
  await expect(root).not.toHaveClass(/sidebar-overlay-open/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();

  await menu.click();
  await page.keyboard.press('Escape');
  await expect(root).not.toHaveClass(/sidebar-overlay-open/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
});

test('route clicks update the hash and expose one aria-current navigation item', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?lang=ru');
  await waitForNavigation(page);

  const landing = page.locator('#nav .nav-item[aria-label="Главная"]');
  const country = page.locator('#nav .nav-item[aria-label="Профиль страны"]');
  const innovation = page.locator('#nav .nav-item[aria-label="Глобальный инновационный индекс"]');
  await expect(landing).toHaveAttribute('aria-current', 'page');
  await expect(country).not.toHaveAttribute('aria-current', 'page');

  await innovation.click();
  await expect(page).toHaveURL(/#index-GII$/);
  await expect(innovation).toHaveAttribute('aria-current', 'page');
  await expect(landing).not.toHaveAttribute('aria-current', 'page');
  await expect(country).not.toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#nav .nav-item[aria-current="page"]')).toHaveCount(1);
  await expect(page.locator('#contextBar')).toContainText('Глобальный инновационный индекс');
});

for (const viewport of [
  { name: 'wide desktop', width: 1440, height: 1000 },
  { name: 'compact desktop', width: 1280, height: 900 },
  { name: 'tablet rail', width: 900, height: 1024 },
  { name: 'mobile drawer', width: 390, height: 844 },
]) {
  test(`${viewport.name} has no horizontal page overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/?lang=en&country=RUS');
    await waitForNavigation(page);

    const dimensions = await page.evaluate(() => ({
      viewport: (document.scrollingElement || document.documentElement).clientWidth,
      document: (document.scrollingElement || document.documentElement).scrollWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 4);
  });
}
