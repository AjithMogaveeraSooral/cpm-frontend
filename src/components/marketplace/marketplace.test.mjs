import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
function client(fetch, env = {}, browser = true) {
  const exports = {};
  const code = ts.transpileModule(source('lib/public-properties.ts'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, { exports, fetch, URLSearchParams, process: { env }, ...(browser ? { window: {} } : {}) });
  return exports;
}

test('public list sends real text/exact filters, paging and no credentials', async () => {
  const requests = [];
  const api = client(async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ success: true, data: [], meta: { pagination: { page: 2, total_items: 0 } } }) };
  });
  const abort = new AbortController();
  const response = await api.listPublicProperties({ q: ' Whitefield ', city: 'Bengaluru', locality: '', bhk: '2', min_rent: '10000', max_rent: '40000', furnishing: 'semi', property_type: 'apartment', sort: 'rent_asc' }, 2, abort.signal);
  const url = new URL(requests[0].url, 'https://test.example');
  assert.equal(url.pathname, '/api/v1/public/properties');
  assert.equal(url.searchParams.get('q'), 'Whitefield');
  assert.equal(url.searchParams.get('city'), 'Bengaluru');
  assert.equal(url.searchParams.get('city_id'), null);
  assert.equal(url.searchParams.get('bhk'), '2');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('page_size'), '12');
  assert.equal(requests[0].options.credentials, 'omit');
  assert.equal(requests[0].options.cache, 'no-store');
  assert.equal(requests[0].options.headers.Authorization, undefined);
  assert.equal(requests[0].options.signal, abort.signal);
  assert.equal(response.pagination.page, 2);
});

test('SSR details use the configured server backend and encode UPIDs', async () => {
  let requested;
  const api = client(async (url) => {
    requested = url;
    return { ok: true, status: 200, json: async () => ({ success: true, data: { upid: 'reference' } }) };
  }, { API_PROXY_TARGET: 'https://backend.example/' }, false);
  assert.equal((await api.getPublicProperty('reference/unsafe')).upid, 'reference');
  assert.equal(requested, 'https://backend.example/api/v1/public/properties/reference%2Funsafe');
});

test('public 404, failed requests and invalid envelopes never become successful listings', async () => {
  for (const response of [
    { ok: false, status: 404 }, { ok: false, status: 503 },
    { ok: true, status: 200, json: async () => ({ success: false }) },
  ]) {
    const api = client(async () => response);
    await assert.rejects(api.getPublicProperty('CPM-BLR-WFD-PRST-A204'), (error) => error instanceof api.PublicPropertyError);
  }
});

test('marketplace UI stays independent of private stores and invented property media', () => {
  for (const path of ['app/(public)/explore/page.tsx', 'app/(public)/explore/[upid]/page.tsx', 'components/marketplace/explore-marketplace.tsx', 'components/marketplace/property-image.tsx', 'lib/public-properties.ts']) {
    assert.doesNotMatch(source(path), /useDataStore|data-store|city-blr|unsplash|\.flat_no|\.address|\.latitude|\.longitude/);
  }
  assert.match(source('components/marketplace/explore-marketplace.tsx'), /No matching homes right now/);
  assert.match(source('components/marketplace/explore-marketplace.tsx'), /controller\.abort\(\)/);
  assert.match(source('app/(public)/explore/[upid]/page.tsx'), /generateMetadata/);
  assert.match(source('app/(public)/tenants/find-property/page.tsx'), /explore\/page/);
});

test('visit links preserve the property context and interest success follows persistence', () => {
  const api = client(async () => {});
  assert.equal(api.visitURL('CPM-BLR-WFD-PRST-A204'), '/tenant-inquiry?upid=CPM-BLR-WFD-PRST-A204&intent=visit');
  const modal = source('app/(public)/explore/interest-modal.tsx');
  assert.match(modal, /await api\.post<Lead>\('\/public\/leads', body, \{ auth: false \}\);\s*setDone\(true\)/);
  assert.match(modal, /property_upid: propertyUpid/);
  assert.doesNotMatch(modal, /localStorage|setTimeout/);
});