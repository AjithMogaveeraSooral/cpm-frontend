import { expect, test } from '@playwright/test';

test('landing sections use layered stone and sage rather than flat white backgrounds', async ({ page }) => {
  await page.goto('/');
  const backgrounds: string[] = [];
  for (const id of ['services', 'why-us', 'application', 'how-it-works', 'plans', 'nri-support', 'founder', 'faqs']) {
    const section = page.locator(`#${id}`);
    const background = await section.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(background, id).toContain('gradient');
    backgrounds.push(background);
  }
  expect(new Set(backgrounds).size).toBeGreaterThanOrEqual(2);
  const hero = page.getByRole('img', { name: /Contemporary living room/ });
  await expect.poll(() => hero.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  await expect(hero).toHaveCSS('filter', 'none');
});

test('plan photos and prices stay readable at mobile and desktop sizes', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/owners/plans');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const silver = page.getByRole('heading', { name: 'Silver Plan', exact: true }).locator('..');
    const price = silver.getByText('10%', { exact: true });
    await price.scrollIntoViewIfNeeded();
    await expect(price).toBeVisible();
    expect(await price.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(50);
  }
  expect(errors).toEqual([]);
});