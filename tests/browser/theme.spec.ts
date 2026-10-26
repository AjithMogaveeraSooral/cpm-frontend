import { test, expect } from '@playwright/test';

const themes = [
  ['green', 'Cypress Green'], ['ocean', 'Ocean Blue'], ['royal', 'Royal Purple'],
  ['sunset', 'Sunset Amber'], ['teal', 'Deep Teal'], ['rose', 'Ruby Rose'],
  ['indigo', 'Sapphire Indigo'], ['gold', 'Honey Gold'], ['berry', 'Orchid Berry'],
  ['slate', 'Carbon Slate'],
] as const;

test('landing theme selector updates accents and both logos without changing content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const content = await page.locator('main').textContent();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const logo = page.locator('header').getByRole('img', { name: 'Cypress Property Management', exact: true });
  const greenLogo = await logo.screenshot();

  for (const [id, label] of themes) {
    await page.getByRole('button', { name: 'Change theme' }).click();
    await page.getByRole('menuitemradio', { name: label, exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.locator('html').getAttribute('data-theme')).toBe(id === 'green' ? null : id);
    expect(await page.evaluate(() => localStorage.getItem('cpm-theme'))).toBe(id);
    // Button colours transition briefly; wait for the selected palette to settle.
    await expect.poll(() => page.locator('#nri-support a').evaluate(element => {
      const channels = getComputedStyle(document.documentElement).getPropertyValue('--cypress-900').trim().split(/\s+/).join(', ');
      return getComputedStyle(element).color === `rgb(${channels})`;
    })).toBe(true);
    const colours = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const colour = (level: number) => `rgb(${root.getPropertyValue(`--cypress-${level}`).trim().split(/\s+/).join(', ')})`;
      return {
        accent: getComputedStyle(document.querySelector('h1 em')!).color,
        expected: colour(700),
        logos: Array.from(document.querySelectorAll('header [role="img"], footer [role="img"]')).map(element => getComputedStyle(element).backgroundImage),
        logoColour: colour(600),
        nri: getComputedStyle(document.querySelector('#nri-support a')!).color,
        expectedNri: colour(900),
      };
    });
    expect(colours.accent).toBe(colours.expected);
    expect(colours.nri).toBe(colours.expectedNri);
    expect(colours.logos).toHaveLength(2);
    for (const gradient of colours.logos) expect(gradient).toContain(colours.logoColour);
    expect(await page.locator('main').textContent()).toBe(content);
    if (id === 'ocean') expect((await logo.screenshot()).equals(greenLogo)).toBe(false);
  }
  expect(errors).toEqual([]);
});

test('theme persists across routes and reloads; Cypress Green can be restored', async ({ page }) => {
  await page.goto('/welcome');
  await page.getByRole('button', { name: 'Change theme' }).click();
  await expect(page.getByRole('menuitemradio', { name: 'Cypress Green', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('menuitemradio', { name: 'Ocean Blue', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
  await page.goto('/owner-services');
  await page.getByRole('button', { name: 'Change theme' }).click();
  await expect(page.getByRole('menuitemradio', { name: 'Ocean Blue', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('menuitemradio', { name: 'Cypress Green', exact: true }).click();
  await page.reload();
  expect(await page.locator('html').getAttribute('data-theme')).toBeNull();
});

test('mobile picker fits the viewport and supports keyboard selection and dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/welcome');
  const trigger = page.getByRole('button', { name: 'Change theme' });
  await trigger.click();
  await expect(page.getByRole('menuitemradio', { name: 'Cypress Green', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const menu = await page.getByRole('menu', { name: 'Color theme' }).boundingBox();
    expect(menu!.x).toBeGreaterThanOrEqual(0);
    expect(menu!.x + menu!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.keyboard.press('Escape');
  }
});

test('invalid preferences and unavailable storage fall back safely to green', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cpm-theme', 'invalid-theme'));
  await page.goto('/');
  expect(await page.locator('html').getAttribute('data-theme')).toBeNull();
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
  });
  await page.reload();
  await page.getByRole('button', { name: 'Change theme' }).click();
  await expect(page.getByRole('menuitemradio', { name: 'Cypress Green', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('menuitemradio', { name: 'Ocean Blue', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
});