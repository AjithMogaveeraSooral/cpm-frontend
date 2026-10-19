import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const src = fileURLToPath(new URL('../../', import.meta.url));

// Test the actual TS modules without adding a test runner or compiling into source.
function loadModule(file, env = {}, dependencies = {}) {
  const code = ts.transpileModule(readFileSync(join(src, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, URL, process: { env },
    require: (name) => {
      assert.ok(name in dependencies, `Unexpected runtime import: ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}

test('unconfigured deployment invents neither a canonical nor business contacts', () => {
  const { siteConfig, pageMetadata, whatsappUrl } = loadModule('lib/site-config.ts');
  for (const key of ['url', 'phone', 'email', 'whatsapp']) assert.equal(siteConfig[key], undefined);
  assert.equal(pageMetadata('Title', 'Description', '/').alternates, undefined);
  assert.equal(whatsappUrl('/'), undefined);
});

test('canonical URLs use the configured origin and optional deployment base path', () => {
  const { siteUrl, pageMetadata } = loadModule('lib/site-config.ts', { NEXT_PUBLIC_SITE_URL: 'https://example.com/cypress/' });
  assert.equal(siteUrl('/'), 'https://example.com/cypress/');
  assert.equal(pageMetadata('Title', 'Description', '/about').alternates.canonical, 'https://example.com/cypress/about');
});

test('invalid, local and credential-bearing site origins are rejected', () => {
  for (const url of ['not a URL', 'http://localhost:3000', 'http://127.0.0.1', 'http://[::1]', 'http://host.local', 'https://user:password@example.com', 'javascript:alert(1)']) {
    assert.equal(loadModule('lib/site-config.ts', { NEXT_PUBLIC_SITE_URL: url }).siteConfig.url, undefined, url);
  }
});

test('contact validation suppresses malformed contact actions', () => {
  const { siteConfig } = loadModule('lib/site-config.ts', { NEXT_PUBLIC_CONTACT_PHONE: 'pending', NEXT_PUBLIC_CONTACT_EMAIL: 'not an email', NEXT_PUBLIC_WHATSAPP_NUMBER: '123' });
  assert.equal(siteConfig.phone, undefined);
  assert.equal(siteConfig.email, undefined);
  assert.equal(siteConfig.whatsapp, undefined);
});

test('configured WhatsApp messages are contextual and do not include personal query data', () => {
  const { whatsappUrl } = loadModule('lib/site-config.ts', { NEXT_PUBLIC_WHATSAPP_NUMBER: '+1 (202) 555-0123' });
  const nri = new URL(whatsappUrl('/owners/nri-property-management?email=private@example.com'));
  assert.equal(nri.hostname, 'wa.me');
  assert.equal(nri.pathname, '/12025550123');
  assert.match(nri.searchParams.get('text'), /NRI property management/);
  assert.doesNotMatch(nri.href, /private|email/);
  assert.match(new URL(whatsappUrl('/owners/plans-pricing')).searchParams.get('text'), /Bronze, Silver and Gold/);
  assert.match(new URL(whatsappUrl('/tenants/services')).searchParams.get('text'), /rental homes and tenant services/);
});

test('pricing illustrations and service tiers match the supplied schedule', () => {
  const { plans } = loadModule('lib/site-content.ts');
  const expected = [['5%', 'Shared manager', 'Up to 2', 'Photos', '72 hours'], ['10%', 'Dedicated manager', 'Up to 4', 'Photos', '48 hours'], ['15%', 'Senior manager', 'Up to 6', 'Photos + video', '24 hours']];
  plans.forEach((plan, index) => {
    assert.equal(JSON.stringify([plan.rate, plan.manager, plan.visits, plan.reports, plan.response]), JSON.stringify(expected[index]));
    const fee = Number(plan.fee.replace(/[^0-9]/g, ''));
    assert.equal(fee, 30000 * parseFloat(plan.rate) / 100);
    assert.equal(Number(plan.balance.replace(/[^0-9]/g, '')), 30000 - fee);
  });
});

test('sitemap omits an unconfigured origin and the duplicate welcome route', () => {
  let config = loadModule('lib/site-config.ts');
  assert.equal(loadModule('app/sitemap.ts', {}, { '@/lib/site-config': config }).default().length, 0);
  config = loadModule('lib/site-config.ts', { NEXT_PUBLIC_SITE_URL: 'https://example.com' });
  const entries = loadModule('app/sitemap.ts', {}, { '@/lib/site-config': config }).default();
  assert.equal(entries.length, config.publicRoutes.length);
  assert.ok(entries.every(({ url }) => url.startsWith('https://example.com/')));
  assert.ok(!entries.some(({ url }) => /\/(welcome|dashboard|owners|tenants)$/.test(url)));
});

test('robots exclude current private pages without blocking public owner/tenant subroutes', () => {
  const config = loadModule('lib/site-config.ts');
  const { rules } = loadModule('app/robots.ts', {}, { '@/lib/site-config': config }).default();
  assert.ok(rules.disallow.includes('/owners$'));
  assert.ok(rules.disallow.includes('/tenants$'));
  assert.ok(!rules.disallow.includes('/owners'));
  assert.ok(!rules.disallow.includes('/tenants'));
  for (const route of ['/dashboard', '/properties', '/tenancies', '/invoices', '/tickets', '/profile', '/approvals', '/leads', '/notifications']) assert.ok(rules.disallow.includes(route));
});

function routeMap() {
  const app = join(src, 'app');
  const routes = new Map();
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/^page\.(tsx?|jsx?)$/.test(entry.name)) {
        const route = '/' + relative(app, dirname(full)).split('/').filter((part) => part && !part.startsWith('(')).join('/');
        assert.ok(!routes.has(route), `Conflicting route: ${route}`);
        routes.set(route, full);
      }
    }
  }
  walk(app);
  return routes;
}

test('public navigation has no route collisions and never targets the legacy directories', () => {
  const routes = routeMap();
  assert.ok(routes.get('/owners').includes('(app)'));
  assert.ok(routes.get('/tenants').includes('(app)'));
  const { navigation } = loadModule('lib/site-content.ts');
  for (const { links } of navigation) for (const { href } of links) {
    assert.ok(!['/owners', '/tenants'].includes(href));
    // This alias belongs to the parent integration workstream.
    if (href !== '/tenants/find-property') assert.ok(routes.has(href), href);
  }
});

test('root is marketing rather than an auth redirect and welcome shares its content', () => {
  const root = readFileSync(join(src, 'app/page.tsx'), 'utf8');
  const welcome = readFileSync(join(src, 'app/(public)/welcome/page.tsx'), 'utf8');
  assert.match(root, /MarketingShell/);
  assert.match(root, /MarketingHome/);
  assert.doesNotMatch(root, /useAuth|router\.replace|redirect\(/);
  assert.match(welcome, /export default MarketingHome/);
});