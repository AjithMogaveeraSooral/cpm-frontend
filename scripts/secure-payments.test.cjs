// Run with node --test scripts/secure-payments.test.cjs. Uses existing TypeScript
// and Zustand dependencies; transpiles source in memory, with no live network.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { create } = require('zustand');

const id = '11111111-1111-4111-8111-111111111111';
const record = (extra = {}) => ({
  id, property_id: 'property', property_upid: 'DB-UPID', tenant_id: 'user-a',
  tenant_name: 'DB Tenant', period: 'September 2026', amount: 100, method: 'upi',
  payment_date: '2026-09-15', status: 'awaiting_verification', created_at: '2026-09-15T00:00:00Z', ...extra,
});
const input = record({ id: undefined, status: undefined, created_at: undefined });
class ApiError extends Error {
  constructor(statusOrMessage, code = 'test_error', message) {
    super(typeof statusOrMessage === 'number' ? message : statusOrMessage);
    this.status = typeof statusOrMessage === 'number' ? statusOrMessage : 400;
    this.code = code;
  }
}

function evaluate(relative, stubs = {}, globals = {}) {
  const filename = path.join(__dirname, '..', relative);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const context = vm.createContext({
    module, exports: module.exports, console, Error, Set, Map, ...globals,
    require: (name) => Object.hasOwn(stubs, name) ? stubs[name] : require(name),
  });
  new vm.Script(source, { filename }).runInContext(context);
  return module.exports;
}

function setup(legacy = []) {
  // Real persist middleware consults this storage; legacy records must be
  // discarded by the store's merge, not merely excluded from future writes.
  const values = new Map([['cpm-data-store-v3', JSON.stringify({ state: { rentPayments: legacy, rentPaymentsLoaded: true }, version: 0 })]]);
  // Recent Node versions expose a getter-only localStorage global.
  Object.defineProperty(global, 'localStorage', { configurable: true, value: {
    getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: (k) => values.delete(k),
  } });
  global.window = { localStorage: global.localStorage };
  const auth = create(() => ({ status: 'authenticated', user: { id: 'user-a', roles: ['tenant'] } }));
  const api = { get: async () => ({ data: [] }), post: async () => ({ data: record() }) };
  let legacyReads = 0;
  const { useDataStore } = evaluate('src/lib/data-store.ts', {
    './auth-store': { useAuth: auth }, './api-client': { api, ApiError },
    './media-idb': { idbLoadAllAttachments: async () => ({}), idbSaveAttachment: async () => {} },
    './payments-idb': { clearLegacyRentPayments: async () => {}, idbLoadRentPayments: async () => { legacyReads++; return legacy; }, idbSaveRentPayment: async () => { throw new Error('unexpected IDB write'); } },
  });
  return { store: useDataStore, auth, api, legacyReads: () => legacyReads, values };
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('legacy persist/IDB records are never hydrated or merged into server lists', async () => {
  const h = setup([record({ id: 'pay-legacy', tenant_id: 'previous-user', status: 'verified' })]);
  assert.equal(h.store.getState().rentPayments.length, 0);
  assert.equal(h.store.getState().rentPaymentsLoaded, false);
  h.api.get = async () => ({ data: [record()] });
  await h.store.getState().loadRentPayments();
  assert.equal(h.store.getState().rentPayments.length, 1);
  assert.equal(h.store.getState().rentPayments[0].id, id);
  assert.equal(h.legacyReads(), 0);
  const persisted = JSON.parse(h.values.get('cpm-data-store-v3')).state;
  assert.equal(Object.hasOwn(persisted, 'rentPayments'), false);
});

test('submission HTTP and network failures reject without fabricating success', async () => {
  for (const failure of [new ApiError('active tenancy required'), new ApiError('HTTP 500'), new TypeError('Failed to fetch')]) {
    const h = setup();
    h.api.post = async () => { throw failure; };
    await assert.rejects(h.store.getState().submitRentPayment(input), failure instanceof ApiError ? (e) => e === failure : /could not be confirmed.*Reconnect/);
    assert.equal(h.store.getState().rentPayments.length, 0);
  }
});

test('failed decision does not approve or reject locally', async () => {
  const h = setup();
  h.store.setState({ rentPayments: [record()] });
  h.api.post = async () => { throw new ApiError('conflict: already decided'); };
  await assert.rejects(h.store.getState().updateRentPaymentStatus(id, 'verified'), /conflict/);
  assert.equal(h.store.getState().rentPayments[0].status, 'awaiting_verification');
  h.api.post = async () => { throw new TypeError('network unavailable'); };
  await assert.rejects(h.store.getState().updateRentPaymentStatus(id, 'rejected'), /Reconnect/);
  assert.equal(h.store.getState().rentPayments[0].status, 'awaiting_verification');
});

test('successful submission and decision use server records only', async () => {
  const h = setup();
  h.api.post = async () => ({ data: record() });
  const result = await h.store.getState().submitRentPayment({ ...input, tenant_name: 'Forged' });
  assert.equal(result.tenant_name, 'DB Tenant');
  assert.equal(result.id, id);
  h.api.post = async () => ({ data: record({ status: 'verified', amount: 110 }) });
  await h.store.getState().updateRentPaymentStatus(id, 'verified');
  assert.equal(h.store.getState().rentPayments[0].status, 'verified');
  assert.equal(h.store.getState().rentPayments[0].amount, 110);
});

test('malformed success responses reject rather than claim payment success', async () => {
  const h = setup();
  for (const data of [undefined, { id: 'pay-local', status: 'awaiting_verification' }, record({ status: 'verified' })]) {
    h.api.post = async () => ({ data });
    await assert.rejects(h.store.getState().submitRentPayment(input));
    assert.equal(h.store.getState().rentPayments.length, 0);
  }
  h.store.setState({ rentPayments: [record()] });
  h.api.post = async () => ({ data: record({ status: 'rejected' }) });
  await assert.rejects(h.store.getState().updateRentPaymentStatus(id, 'verified'), /Unexpected decision/);
  assert.equal(h.store.getState().rentPayments[0].status, 'awaiting_verification');
});

test('loading clears stale records immediately and after HTTP/network failure', async () => {
  const h = setup();
  h.store.setState({ rentPayments: [record()], rentPaymentsLoaded: true });
  const request = deferred(); h.api.get = () => request.promise;
  const load = h.store.getState().loadRentPayments();
  assert.equal(h.store.getState().rentPayments.length, 0);
  request.reject(new TypeError('network offline'));
  await assert.rejects(load, /Reconnect/);
  assert.equal(h.store.getState().rentPayments.length, 0);
  assert.equal(h.store.getState().rentPaymentsLoaded, false);
});

test('account switching clears state and ignores a previous account late load', async () => {
  const h = setup(); const request = deferred(); h.api.get = () => request.promise;
  const load = h.store.getState().loadRentPayments();
  h.auth.setState({ user: { id: 'user-b', roles: ['tenant'] } });
  h.store.setState({ rentPayments: [record({ tenant_id: 'user-b' })], rentPaymentsLoaded: true });
  request.resolve({ data: [record()] });
  await assert.rejects(load, /session changed/);
  assert.equal(h.store.getState().rentPayments[0].tenant_id, 'user-b');
  h.auth.setState({ status: 'unauthenticated', user: null });
  assert.equal(h.store.getState().rentPayments.length, 0);
});

test('logout and login to the same account still invalidate in-flight mutations', async () => {
  const h = setup(); const request = deferred(); h.api.post = () => request.promise;
  const submit = h.store.getState().submitRentPayment(input);
  h.auth.setState({ status: 'unauthenticated', user: null });
  h.auth.setState({ status: 'authenticated', user: { id: 'user-a', roles: ['tenant'] } });
  request.resolve({ data: record() });
  await assert.rejects(submit, /session changed/);
  assert.equal(h.store.getState().rentPayments.length, 0);
});

test('late previous-user decision cannot modify a new user list', async () => {
  const h = setup(); h.store.setState({ rentPayments: [record()] });
  const request = deferred(); h.api.post = () => request.promise;
  const decision = h.store.getState().updateRentPaymentStatus(id, 'verified');
  h.auth.setState({ user: { id: 'user-b', roles: ['tenant'] } });
  request.resolve({ data: record({ status: 'verified' }) });
  await assert.rejects(decision, /session changed/);
  assert.equal(h.store.getState().rentPayments.length, 0);
});

test('duplicate submission and decision calls are blocked while requests are pending', async () => {
  const h = setup(); const request = deferred(); let calls = 0;
  h.api.post = () => { calls++; return request.promise; };
  const first = h.store.getState().submitRentPayment(input);
  await assert.rejects(h.store.getState().submitRentPayment(input), /already in progress/);
  assert.equal(calls, 1);
  request.resolve({ data: record() }); await first;
  const decisionRequest = deferred(); h.api.post = () => { calls++; return decisionRequest.promise; };
  const decision = h.store.getState().updateRentPaymentStatus(id, 'verified');
  await assert.rejects(h.store.getState().updateRentPaymentStatus(id, 'rejected'), /already in progress/);
  assert.equal(calls, 2);
  decisionRequest.resolve({ data: record({ status: 'verified' }) }); await decision;
});

test('legacy local IDs and resets never send a decision to the server', async () => {
  const h = setup(); let calls = 0; h.api.post = async () => { calls++; return { data: record() }; };
  h.store.setState({ rentPayments: [record({ id: 'pay-legacy' }), record()] });
  await assert.rejects(h.store.getState().updateRentPaymentStatus('pay-legacy', 'verified'), /Legacy local records/);
  await assert.rejects(h.store.getState().updateRentPaymentStatus(id, 'awaiting_verification'), /final/);
  assert.equal(calls, 0);
});

test('unauthenticated operations fail without contacting the API', async () => {
  const h = setup(); let calls = 0; h.api.get = h.api.post = async () => { calls++; return {}; };
  h.auth.setState({ status: 'unauthenticated', user: null });
  await assert.rejects(h.store.getState().loadRentPayments(), /Sign in/);
  await assert.rejects(h.store.getState().submitRentPayment(input), /Sign in/);
  await assert.rejects(h.store.getState().updateRentPaymentStatus(id, 'verified'), /Sign in/);
  assert.equal(calls, 0);
});

test('pagination is loaded from the server without merging local records', async () => {
  const h = setup(); const pages = [];
  h.api.get = async (_, options) => {
    const page = options.query.page; pages.push(page);
    return { data: [record({ id: page === 1 ? id : '22222222-2222-4222-8222-222222222222' })], pagination: { total_pages: 2 } };
  };
  await h.store.getState().loadRentPayments();
  assert.deepEqual(pages, [1, 2]);
  assert.equal(h.store.getState().rentPayments.length, 2);
});

test('legacy IndexedDB adapter cannot return or persist payment records', async () => {
  let opens = 0;
  const idb = evaluate('src/lib/payments-idb.ts', {}, { indexedDB: { open() { opens++; throw new Error('must not read'); } } });
  assert.equal((await idb.idbLoadRentPayments()).length, 0);
  await assert.rejects(idb.idbSaveRentPayment(record()), /disabled/);
  assert.equal(opens, 0);
});

test('HTTP auth, server and conflict errors retain their type with actionable guidance', async () => {
  for (const status of [401, 409, 500]) {
    const h = setup();
    h.api.post = async () => { throw new ApiError(status, 'server_code', 'Server message'); };
    await assert.rejects(h.store.getState().submitRentPayment(input), (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, status);
      assert.equal(error.code, 'server_code');
      assert.match(error.message, status === 401 ? /Sign in again/ : /Reload payments before retrying/);
      return true;
    });
  }
});

test('old account loading failure does not clear the new account data', async () => {
  const h = setup(); const request = deferred(); h.api.get = () => request.promise;
  const oldLoad = h.store.getState().loadRentPayments();
  h.auth.setState({ user: { id: 'user-b', roles: ['tenant'] } });
  h.api.get = async () => ({ data: [record({ tenant_id: 'user-b' })] });
  await h.store.getState().loadRentPayments();
  request.reject(new TypeError('offline'));
  await assert.rejects(oldLoad);
  assert.equal(h.store.getState().rentPayments[0].tenant_id, 'user-b');
  assert.equal(h.store.getState().rentPaymentsLoaded, true);
});

test('list response started before a successful mutation cannot overwrite it', async () => {
  const h = setup(); const request = deferred(); h.api.get = () => request.promise;
  const load = h.store.getState().loadRentPayments();
  await h.store.getState().submitRentPayment(input);
  request.resolve({ data: [] }); await load;
  assert.equal(h.store.getState().rentPayments[0].id, id);
});

test('malformed payment lists fail closed instead of reporting an empty success', async () => {
  for (const data of [undefined, {}, 'bad response']) {
    const h = setup(); h.api.get = async () => ({ data });
    await assert.rejects(h.store.getState().loadRentPayments(), /Invalid payment list/);
    assert.equal(h.store.getState().rentPaymentsLoaded, false);
    assert.equal(h.store.getState().rentPayments.length, 0);
  }
});