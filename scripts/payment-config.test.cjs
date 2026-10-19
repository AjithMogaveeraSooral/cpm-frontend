const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');

function config(env = {}) {
  const source = readFileSync(path.join(__dirname, '../src/lib/payment.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, process: { env }, URLSearchParams });
  return exports;
}

test('missing collection configuration never publishes sample accounts or payment links', () => {
  const payment = config();
  assert.equal(payment.CYPRESS_BANK_ACCOUNT.accountNumber, '');
  assert.equal(payment.CYPRESS_BANK_ACCOUNT.upiId, '');
  assert.ok(payment.PAYMENT_PROVIDERS.every((provider) => !provider.enabled));
  const context = { amount: 100, propertyUpid: 'TEST', period: 'January 2026' };
  assert.equal(payment.getPaymentProvider('upi').getInstructions(context).upiDeepLink, undefined);
  assert.equal(payment.getPaymentProvider('offline_bank_transfer').getInstructions(context).bank, undefined);
});

test('only valid configured offline methods are enabled; online stays disabled', () => {
  const payment = config({
    NEXT_PUBLIC_PAY_BENEFICIARY: 'Test beneficiary', NEXT_PUBLIC_PAY_BANK: 'Test bank',
    NEXT_PUBLIC_PAY_ACCOUNT_NO: '123456789012', NEXT_PUBLIC_PAY_IFSC: 'TEST0123456',
    NEXT_PUBLIC_PAY_UPI: 'test@example',
  });
  assert.equal(payment.getPaymentProvider('offline_bank_transfer').enabled, true);
  assert.equal(payment.getPaymentProvider('upi').enabled, true);
  assert.equal(payment.getPaymentProvider('online_gateway').enabled, false);
  const url = new URL(payment.getPaymentProvider('upi').getInstructions({ amount: 123.45, propertyUpid: 'TEST', period: 'January 2026' }).upiDeepLink);
  assert.equal(url.searchParams.get('pa'), 'test@example');
  assert.equal(url.searchParams.get('am'), '123.45');
});

test('malformed collection configuration remains disabled', () => {
  const payment = config({ NEXT_PUBLIC_PAY_BENEFICIARY: 'Test', NEXT_PUBLIC_PAY_BANK: 'Test', NEXT_PUBLIC_PAY_ACCOUNT_NO: 'pending', NEXT_PUBLIC_PAY_IFSC: 'invalid', NEXT_PUBLIC_PAY_UPI: 'not-a-upi' });
  assert.ok(payment.PAYMENT_PROVIDERS.every((provider) => !provider.enabled));
});