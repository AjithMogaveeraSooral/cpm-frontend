import { expect, test, type Page } from '@playwright/test';

const properties = { total: 12, occupied: 8, vacant: 4, listed: 6 };
const staffReport = {
  users: { total: 20, active: 16, pending: 3, suspended: 1, owners: 5, tenants: 10, cypress_admins: 3, super_admins: 2 },
  properties, tenancies: { active: 8, proposed: 2 }, tickets: { open: 3, escalated: 1, overdue: 2 },
  new_leads: 4, rent_to_verify: 2, payments_to_verify: 3, pending_registrations: 2, active_vouchers: 1,
};

async function portalFixture(page: Page, role = 'app_admin') {
  const user = { id: 'test-admin', mobile: '9000000000', username: 'admin', full_name: 'Test Administrator', roles: [role], permissions: ['*'], status: 'active', locale: 'en' };
  const created: Array<Record<string, unknown>> = [];
  const logins: Array<Record<string, unknown>> = [];
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let data: unknown = [];
    if (url.pathname.endsWith('/auth/login')) {
      logins.push(request.postDataJSON());
      data = { user, tokens: { access_token: 'fixture-access', refresh_token: 'fixture-refresh', token_type: 'Bearer', access_expires_at: '2099-01-01T00:00:00Z', refresh_expires_at: '2099-01-02T00:00:00Z' } };
    } else if (url.pathname.endsWith('/auth/me')) data = user;
    else if (url.pathname.endsWith('/public/reports/summary')) data = { users: 14, owners: 5, tenants: 10, properties };
    else if (url.pathname.endsWith('/reports/summary')) data = staffReport;
    else if (url.pathname.endsWith('/auth/users')) {
      if (request.method() === 'POST') {
        const input = request.postDataJSON();
        data = { id: `created-${created.length}`, ...input, roles: [input.role], status: 'active', created_at: new Date().toISOString() };
        created.push(data as Record<string, unknown>);
      } else data = created.filter((account) => account.role === url.searchParams.get('role'));
    }
    await route.fulfill({ json: { success: true, data, meta: { pagination: { page: 1, page_size: 20, total_items: Array.isArray(data) ? data.length : 0, total_pages: 1 } } } });
  });
  return { created, logins };
}

async function login(page: Page, role = 'app_admin') {
  await page.goto(`/login?role=${role}`);
  await page.getByLabel(role === 'app_admin' ? 'Username or mobile' : 'Mobile', { exact: true }).fill(role === 'app_admin' ? 'admin' : '9000000002');
  await page.getByLabel('Password', { exact: true }).fill('CypressTechAdmin');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
}

test('Super Admin can open all management menus and create Cypress Admins, Owners and Tenants', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const fixture = await portalFixture(page);
  await login(page);
  expect(fixture.logins[0]).toEqual({ username: 'admin', password: 'CypressTechAdmin' });
  await expect(page.getByRole('heading', { name: /^Super Admin Dashboard/ })).toBeVisible();
  for (const href of ['/admins', '/owners', '/tenants', '/properties', '/tickets', '/invoices', '/documents', '/tenancies', '/leads', '/approvals', '/notifications', '/profile']) {
    await expect(page.locator(`#portal-navigation a[href="${href}"]`)).toBeVisible();
  }
  for (const account of [{ path: '/admins', singular: 'Cypress Admin', role: 'cypress_admin' }, { path: '/owners', singular: 'owner', role: 'owner' }, { path: '/tenants', singular: 'tenant', role: 'tenant' }]) {
    await page.goto(account.path);
    await page.getByRole('button', { name: `Add ${account.singular}`, exact: true }).click();
    await page.getByLabel('Full name', { exact: true }).fill(`Test ${account.singular}`);
    await page.getByLabel('Mobile number', { exact: true }).fill('9876543210');
    await page.getByLabel('Password', { exact: true }).fill('AccountPassword123');
    await page.getByLabel('Confirm password', { exact: true }).fill('AccountPassword123');
    await page.getByRole('button', { name: `Create ${account.singular}`, exact: true }).click();
    await expect(page.getByRole('cell', { name: `Test ${account.singular}`, exact: true })).toBeVisible();
    expect(fixture.created.at(-1)?.role).toBe(account.role);
  }
});

test('Cypress Admin retains the operations dashboard without administrator management', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await portalFixture(page, 'cypress_admin');
  await login(page, 'cypress_admin');
  await expect(page.getByRole('heading', { name: /^Cypress Operations Console/ })).toBeVisible();
  await expect(page.locator('#portal-navigation a[href="/admins"]')).toHaveCount(0);
  await page.goto('/admins');
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('heading', { name: /^Cypress Operations Console/ })).toBeVisible();
});

test('live reports and workflow render charts without overflow on desktop and mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await portalFixture(page);
  await login(page);
  const reports = page.getByRole('region', { name: 'Portfolio Reports', exact: true });
  await expect(reports.getByText('20', { exact: true })).toBeVisible();
  await expect(reports.getByRole('img', { name: /8 occupied, 4 vacant/ })).toBeVisible();
  await expect(reports.getByRole('list', { name: 'Property management workflow' })).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await reports.scrollIntoViewIfNeeded();
    await expect(reports.locator('svg.recharts-surface')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await reports.screenshot({ path: `test-results/staff-reports-${width}.png` });
  }
  await page.goto('/');
  const publicReports = page.getByRole('region', { name: 'Cypress in Numbers', exact: true });
  await expect(publicReports.getByText('14', { exact: true })).toBeVisible();
  await expect(publicReports.getByRole('link', { name: 'Property registration' })).toHaveAttribute('href', '/owner-inquiry');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await publicReports.scrollIntoViewIfNeeded();
    await expect(publicReports.locator('svg.recharts-surface')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await publicReports.screenshot({ path: `test-results/public-reports-${width}.png`, style: 'header, a:focus-visible { visibility: hidden !important; }' });
  }
});

test('public reports show unavailable and empty states without fabricated counts', async ({ page }) => {
  await page.route('**/api/v1/public/reports/summary', (route) => route.fulfill({ status: 503, json: { success: false, error: { code: 'unavailable', message: 'Fixture outage' } } }));
  await page.goto('/');
  const reports = page.getByRole('region', { name: 'Cypress in Numbers', exact: true });
  await expect(reports.getByRole('alert')).toContainText('Reports are currently unavailable');
  await expect(reports.getByText('Active Users', { exact: true })).toHaveCount(0);
  await page.unroute('**/api/v1/public/reports/summary');
  await page.route('**/api/v1/public/reports/summary', (route) => route.fulfill({ json: { success: true, data: { users: 0, owners: 0, tenants: 0, properties: { total: 0, occupied: 0, vacant: 0, listed: 0 } } } }));
  await reports.getByRole('button', { name: 'Refresh reports' }).click();
  await expect(reports.getByText('No properties registered')).toBeVisible();
});

test('updated login and reports support reduced motion and password visibility without hydration errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await portalFixture(page);
  await page.goto('/login?role=app_admin');
  const password = page.getByLabel('Password', { exact: true });
  await password.fill('CypressTechAdmin');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: 'Show password', exact: true }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await expect(password).toHaveValue('CypressTechAdmin');
    await page.getByRole('button', { name: 'Hide password', exact: true }).click();
    await expect(password).toHaveAttribute('type', 'password');
    await expect.poll(() => page.locator('img[src*="hd-maintenance-kitchen"]').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/login-updated-${width}.png` });
  }
  await login(page);
  const reports = page.getByRole('region', { name: 'Portfolio Reports', exact: true });
  await expect(reports.getByText('20', { exact: true })).toBeVisible();
  const metric = reports.locator('dl').first().locator(':scope > div').first();
  expect(await metric.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  await expect(reports.locator('svg.recharts-surface')).toHaveCount(2);
  expect(errors).toEqual([]);
});