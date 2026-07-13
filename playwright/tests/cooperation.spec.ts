import { expect, test, type Page } from '@playwright/test';

const formSubmitEndpoint = 'https://formsubmit.co/ajax/project_office@inno.mgimo.ru';

async function openForm(page: Page) {
  const trigger = page.locator('[data-open-cooperation]');
  await trigger.click();
  await expect(page.locator('#girCooperationDialog')).toBeVisible();
  await expect(page.locator('#girCooperationForm [name="full_name"]')).toBeFocused();
  return trigger;
}

async function completeForm(page: Page) {
  const form = page.locator('#girCooperationForm');
  await form.locator('[name="full_name"]').fill('Alex Morgan');
  await form.locator('[name="phone"]').fill('+7 495 000 00 00');
  await form.locator('[name="email"]').fill('alex.morgan@organization.test');
  await form.locator('[name="organization"]').fill('Research Institute');
  await form.locator('[name="message"]').fill('We would like to discuss an institutional GIR deployment.');
  await form.locator('[name="consent"]').check();
}

test('consent page switches complete locale and theme states', async ({ page }) => {
  await page.goto('/personal-data-consent?lang=ru&theme=dark');

  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('h1')).toHaveText('Согласие на обработку персональных данных');
  await expect(page.locator('[data-consent-brand]')).toHaveAttribute('src', '/static/brand/gir-ru-dark.svg');

  await page.locator('[data-consent-lang-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText('Consent to Personal Data Processing');
  await expect(page.locator('[data-consent-brand]')).toHaveAttribute('src', '/static/brand/gir-en-dark.svg');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('lang'))).toBe('en');

  await page.locator('[data-consent-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('[data-consent-brand]')).toHaveAttribute('src', '/static/brand/gir-en-light.svg');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('light');

  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 2);
});

test('public API is idempotent, validates fields and restores trigger focus', async ({ page }) => {
  await page.goto('/personal-data-consent?lang=en&theme=light');
  const api = await page.evaluate(() => {
    const cooperation = (window as any).GIRCooperation;
    cooperation.init({ getLang: () => 'en' });
    cooperation.init({ getLang: () => 'en' });
    cooperation.bindTriggers(document);
    cooperation.bindTriggers(document);
    return Object.keys(cooperation).sort();
  });
  expect(api).toEqual(['bindTriggers', 'init', 'open', 'updateLocale']);

  const trigger = await openForm(page);
  const form = page.locator('#girCooperationForm');
  await expect(form.locator('[name="project"]')).toHaveValue('GIR — Global Index Ranker');
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[name="full_name"]')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('[data-error-for="full_name"]')).toHaveText('Enter your full name.');
  await expect(form.locator('[name="full_name"]')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.locator('#girCooperationDialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('successful FormSubmit response shows confirmation without external navigation', async ({ page }) => {
  let requestBody = '';
  await page.route(formSubmitEndpoint, async (route) => {
    requestBody = route.request().postData() || '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ success: true }),
    });
  });
  await page.goto('/personal-data-consent?lang=en&theme=dark');
  const trigger = await openForm(page);
  await completeForm(page);

  await page.locator('#girCooperationForm button[type="submit"]').click();
  await expect(page.locator('#girCooperationSuccess')).toBeVisible();
  await expect(page.locator('#girCooperationSuccess h3')).toHaveText('Request submitted');
  await expect(page.locator('#girCooperationSuccess [data-cooperation-close]')).toBeFocused();
  expect(requestBody).toContain('GIR — Global Index Ranker');
  expect(requestBody).toContain('[GIR МГИМО] Новая заявка на сотрудничество');
  expect(requestBody).toContain('source_page');
  expect(requestBody).toContain('language');

  await page.locator('#girCooperationSuccess [data-cooperation-close]').click();
  await expect(trigger).toBeFocused();
});

test('failed FormSubmit response exposes localized e-mail fallback', async ({ page }) => {
  await page.route(formSubmitEndpoint, async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ success: false, message: 'Unavailable' }),
    });
  });
  await page.goto('/personal-data-consent?lang=ru&theme=light');
  await openForm(page);
  await completeForm(page);

  await page.locator('#girCooperationForm button[type="submit"]').click();
  const status = page.locator('#girCooperationStatus');
  await expect(status).toBeVisible();
  await expect(status).toContainText('Не удалось отправить заявку.');
  await expect(status.locator('a')).toHaveText('Написать на project_office@inno.mgimo.ru');
  await expect(status.locator('a')).toHaveAttribute('href', /^mailto:project_office@inno\.mgimo\.ru\?subject=/);
});

test('landing header and hero triggers share the localized cooperation flow', async ({ page }) => {
  await page.route(formSubmitEndpoint, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ success: true }),
    });
  });
  await page.goto('/?lang=en&theme=dark');
  await expect(page.locator('.landing-page')).toBeVisible();

  const headerTrigger = page.locator('#cooperationHeaderBtn');
  await headerTrigger.click();
  await expect(page.locator('#girCooperationDialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(headerTrigger).toBeFocused();

  const heroTrigger = page.locator('.landing-hero [data-open-cooperation]');
  await heroTrigger.click();
  await completeForm(page);
  await page.locator('#girCooperationForm button[type="submit"]').click();
  await expect(page.locator('#girCooperationSuccess h3')).toHaveText('Request submitted');
});
