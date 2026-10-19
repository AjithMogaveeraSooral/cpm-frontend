import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { z } from 'zod';

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const exports = {};
vm.runInNewContext(ts.transpileModule(source('./inquiry-schema.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports, require: (name) => { assert.equal(name, 'zod'); return { z }; } });
const { inquiryPayload, approvedPlan, localDate } = exports;

const common = { name: ' Test visitor ', phone: '+44 7700 900123', locality: 'Whitefield', bhk: '2 BHK', furnishing: 'Semi-furnished', requirements: 'Parking\nNear transport', consent: true };
const owner = { ...common, email: ' visitor@example.com ', propertyName: 'Test property', propertyType: 'Apartment', occupancy: 'Vacant', plan: 'Silver' };
const tenant = { ...common, budgetMin: '20000', budgetMax: '40000', moveDate: localDate(), upid: 'cpm-blr-wfd-prst-a204' };

test('owner requirements are labelled, trimmed and remain inside the message limit', () => {
  const payload = inquiryPayload('owner', owner, false);
  assert.equal(payload.type, 'enquiry');
  assert.equal(payload.name, 'Test visitor');
  assert.equal(payload.phone, '+447700900123');
  assert.equal(payload.email, 'visitor@example.com');
  assert.match(payload.message, /^\[Property Owner Interest\]/);
  for (const label of ['Locality', 'BHK', 'Furnishing', 'Property name', 'Property type', 'Occupancy', 'Preferred plan', 'Additional requirements', 'Contact consent']) assert.ok(payload.message.includes(`${label}:`));
  assert.ok(inquiryPayload('owner', { ...owner, requirements: 'x'.repeat(2000) }, false).message.length < 5000);
});

test('tenant intent and property context survive submission without requiring an email', () => {
  const payload = inquiryPayload('tenant', tenant, true);
  assert.equal(payload.type, 'visit');
  assert.equal(payload.property_upid, 'CPM-BLR-WFD-PRST-A204');
  assert.equal(payload.email, undefined);
  assert.match(payload.message, /Monthly budget \(INR\): 20000–40000/);
  assert.match(payload.message, /Expected move-in:/);
  assert.equal(inquiryPayload('tenant', { ...tenant, upid: '' }, false).property_upid, undefined);
  assert.equal(inquiryPayload('owner', owner, true).type, 'enquiry');
});

test('international prefixes are preserved rather than rewritten as Indian numbers', () => {
  for (const phone of ['+919876543210', '9876543210', '00447700900123', '+12025550123']) assert.equal(inquiryPayload('owner', { ...owner, phone }, false).phone, phone);
});

test('plan preselection only accepts approved choices', () => {
  assert.equal(approvedPlan('gold'), 'Gold');
  assert.equal(approvedPlan(' SILVER '), 'Silver');
  assert.equal(approvedPlan('free-unlimited'), 'Not sure yet');
  assert.equal(approvedPlan(null), 'Not sure yet');
});

test('invalid contact data, text, select tampering and missing consent are rejected', () => {
  for (const invalid of [
    { name: ' ' }, { name: 'a'.repeat(151) }, { name: 'Name\ninjection' },
    { phone: '123' }, { phone: 'hello+919876543210' }, { phone: '+1234567890123456' },
    { email: 'not-an-email' }, { requirements: 'x'.repeat(2001) }, { requirements: 'bad\x00text' },
    { consent: false }, { plan: 'unlimited' }, { propertyType: 'fake' }, { locality: '' },
  ]) assert.throws(() => inquiryPayload('owner', { ...owner, ...invalid }, false));
});

test('tenant budget/date/UPID constraints reject malformed context', () => {
  for (const invalid of [
    { budgetMin: '-1' }, { budgetMax: '1' }, { budgetMax: 'Infinity' }, { budgetMin: '10.5' },
    { moveDate: '2000-01-01' }, { moveDate: '2099-02-30' }, { moveDate: '' },
    { upid: 'CPM-INVALID' }, { upid: 'x'.repeat(41) },
  ]) assert.throws(() => inquiryPayload('tenant', { ...tenant, ...invalid }, true));
});

test('forms use server acceptance, public auth:false and duplicate-submit protection', () => {
  const form = source('./inquiry-form.tsx');
  assert.match(form, /api\.post<\{ id: string \}>\('\/public\/leads', body, \{ auth: false \}\)/);
  assert.match(form, /if \(submitting\.current \|\| reference\) return/);
  assert.match(form, /setReference\(data\.id\)/);
  assert.doesNotMatch(form, /localStorage|useDataStore|dispatchEvent|console\.(log|info)/);
  for (const kind of ['owner', 'tenant']) {
    const page = source(`../../app/(public)/${kind}-inquiry/page.tsx`);
    assert.match(page, /<Suspense/);
    assert.match(page, /pageMetadata\(/);
    assert.ok(page.includes(`kind="${kind}"`));
  }
});

test('admin desk scopes queries to identity and roles and does not simulate conversion', () => {
  const desk = source('../../app/(app)/leads/page.tsx');
  assert.match(desk, /\['admin-leads', userID, roles\]/);
  assert.match(desk, /gcTime: 0/);
  assert.match(desk, /role === 'app_admin' \|\| role === 'cypress_admin'/);
  assert.match(desk, /api\.get<Lead\[\]>\('\/leads'/);
  assert.match(desk, /api\.patch<Lead>/);
  assert.match(desk, /page_size: pageSize/);
  assert.match(desk, /href="\/properties\/new"/);
  assert.doesNotMatch(desk, /useDataStore|convertLeadToProperty|next: 'converted'|Onboarded & Active/);
});

test('optional site search separates public properties from FAQ results and handles query rendering', () => {
  const page = source('../../app/(public)/search/page.tsx');
  const search = source('../../app/(public)/search/site-search.tsx');
  assert.match(page, /<Suspense/);
  assert.match(page, /pageMetadata\(/);
  assert.match(search, /'\/public\/properties', \{ auth: false/);
  assert.match(search, /q: query, page, page_size: 6/);
  assert.match(search, /ownerFaqs, tenantFaqs/);
  assert.match(search, /FAQ results can still be reviewed below/);
  assert.doesNotMatch(search, /useDataStore|dispatchEvent|console\.(log|info)/);
});