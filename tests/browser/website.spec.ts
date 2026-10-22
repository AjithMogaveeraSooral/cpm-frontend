import { expect, test, type Page } from '@playwright/test';

test('redesigned public pages fit mobile screens without horizontal overflow', async ({ page }) => {
  for (const path of ['/about', '/contact', '/owner-services', '/owners/plans-pricing', '/owners/nri-property-management', '/owners/faqs', '/tenants/faqs', '/tenants/services', '/owner-inquiry', '/tenant-inquiry', '/tenants/find-property']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} overflow at ${width}px`).toBe(true);
    }
  }
});

test('pricing calculator updates fees and balances when rent and plan change', async ({ page }) => {
  await page.goto('/owners/plans-pricing');
  const calculator = page.getByRole('region', { name: 'Estimate Your Monthly Management Fee' });
  await calculator.getByLabel('Monthly Rent (₹)', { exact: true }).fill('50000');
  await expect(calculator.getByText('₹2,500', { exact: true })).toBeVisible();
  await expect(calculator.getByText('₹47,500', { exact: true })).toBeVisible();
  await calculator.getByRole('button', { name: /Gold/ }).click();
  await expect(calculator.getByRole('button', { name: /Gold/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(calculator.getByText('₹7,500', { exact: true })).toBeVisible();
  await expect(calculator.getByText('₹42,500', { exact: true })).toBeVisible();
});

test('owner FAQ search filters questions and recovers from no matches', async ({ page }) => {
  await page.goto('/owners/faqs');
  const search = page.getByRole('searchbox', { name: 'Search owner questions' });
  await search.fill('onboarding fee');
  const question = page.locator('summary').filter({ hasText: 'Is there an onboarding fee?' });
  await question.click();
  await expect(page.getByText(/All three plans have ₹0 onboarding fees/)).toBeVisible();
  await search.fill('zzzz-no-matching-question');
  await expect(page.getByText(/No questions match/)).toBeVisible();
  await search.fill('');
  await expect(question).toBeVisible();
});

async function ownerForm(page: Page, name = 'Browser Test') {
  await page.goto('/owner-inquiry?plan=gold');
  await page.getByLabel('Full name', { exact: true }).fill(name);
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByLabel('Email', { exact: true }).fill('browser@example.com');
  await page.getByLabel('Property locality').fill('Whitefield');
  await page.getByLabel('Apartment / property name').fill('Browser Test Property');
  await page.getByLabel('Property type', { exact: true }).selectOption('Apartment');
  await page.getByLabel('BHK', { exact: true }).selectOption({ index: 2 });
  await page.getByLabel('Furnishing', { exact: true }).selectOption({ index: 1 });
  await page.getByLabel('Occupancy status').selectOption('Vacant');
  await page.getByLabel('Preferred plan').selectOption('Gold');
  await page.getByRole('checkbox').check();
}

test('marketing home and mobile menus fit small screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your Property.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByText('Menu', { exact: true }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByText('Owners', { exact: true }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Plans & Pricing' }).click();
  await expect(page).toHaveURL(/plans-pricing/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Simple Plans.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('reviewed landing uses supplied branding, portrait and functional calls to action', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const logo = page.getByRole('banner').getByRole('img', { name: 'Cypress Property Management Software' });
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.locator('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(logo).toHaveCSS('mask-image', /cypress-logo/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  for (const id of ['services', 'why-us', 'application', 'how-it-works', 'plans', 'nri-support', 'founder', 'faqs']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  for (const rate of ['5%', '10%', '15%']) await expect(page.locator('#plans').getByText(rate, { exact: true })).toBeVisible();
  for (const response of ['72-hour response', '48-hour response', '24-hour response']) {
    await expect(page.locator('#plans')).toContainText(response);
  }
  const portrait = page.locator('#founder').getByRole('img', { name: 'Sudish Kumar S, founder of Cypress' });
  await portrait.scrollIntoViewIfNeeded();
  await expect(portrait).toBeVisible();
  await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('#application').getByRole('link', { name: 'Explore the Application' })).toHaveAttribute('href', '/about/application');
  await expect(page.locator('#founder')).toContainText('Founder, Cypress Property Management Services');
  await page.getByRole('navigation', { name: 'About Us footer links' }).getByRole('link', { name: 'Why I Started Cypress' }).click();
  await expect(page).toHaveURL(/about\/founder/);
  await expect(page.getByRole('img', { name: 'Sudish Kumar S, founder of Cypress' })).toBeVisible();
  await page.getByRole('banner').getByRole('link', { name: 'Cypress Property Management home' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Complete Peace of Mind.');
});

test('landing FAQ disclosures work with keyboard and narrow layouts do not overflow', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `overflow at ${width}px`).toBe(true);
  }
  const ownerGroup = page.locator('#faqs > div > div > details').first();
  const summary = ownerGroup.locator(':scope > summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(ownerGroup).toHaveAttribute('open', '');
  const question = ownerGroup.getByText('Is there an onboarding fee?', { exact: true });
  await question.click();
  await expect(ownerGroup.getByText(/All three plans have ₹0 onboarding fees/)).toBeVisible();
  await expect(ownerGroup.getByRole('link', { name: 'All Owner FAQs' })).toHaveAttribute('href', '/owners/faqs');
  const tenantGroup = page.locator('#faqs > div > div > details').nth(1);
  await tenantGroup.locator(':scope > summary').click();
  await expect(tenantGroup.getByRole('link', { name: 'All Tenant FAQs' })).toHaveAttribute('href', '/tenants/faqs');
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('anonymous visitor can browse real API results and open a redacted detail page', async ({ page }) => {
  await page.goto('/tenants/find-property');
  await expect(page.getByText('Browser Test Property', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: /View Details/i }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Browser Test Property');
  await expect(page.getByRole('link', { name: /Schedule a Visit/i }).first()).toHaveAttribute('href', /intent=visit/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /explore\/CPM-BLR-WFD-TEST-A101/);
});

test('owner inquiry displays success only after server acceptance', async ({ page }) => {
  await ownerForm(page);
  const accepted = page.waitForResponse((response) => response.url().includes('/public/leads') && response.status() === 201);
  await page.getByRole('button', { name: 'Submit Property Enquiry' }).click();
  await accepted;
  await expect(page.getByText('test-enquiry-reference')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your enquiry has been received.' })).toBeVisible();
});

test('failed inquiry retains user input and never claims success', async ({ page }) => {
  await ownerForm(page, 'Failure Test');
  await page.getByRole('button', { name: 'Submit Property Enquiry' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'could not confirm acceptance' })).toBeVisible();
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Failure Test');
  await expect(page.getByText('Your enquiry has been received.')).toHaveCount(0);
});

test('unknown property API returns 404 and the streamed page is unavailable and noindex', async ({ page, request }) => {
  const response = await request.get('/api/v1/public/properties/CPM-BLR-WFD-TEST-MISSING');
  expect(response.status()).toBe(404);
  await page.goto('/explore/CPM-BLR-WFD-TEST-MISSING');
  // Next.js can stream a 200 shell before notFound resolves. Verify the actual
  // unavailable UI and noindex directive rather than treating a shell as a listing.
  await expect(page.getByRole('heading', { name: 'This home is not available' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('link', { name: /Schedule a Visit/i })).toHaveCount(0);
});