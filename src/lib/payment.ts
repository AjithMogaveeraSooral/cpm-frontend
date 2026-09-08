// Payment configuration and provider abstraction for rent collection.
//
// Today rent is collected OFFLINE: the tenant transfers money to the Cypress
// bank account / UPI ID (quoting the property UPID as the reference) and uploads
// a receipt, which Cypress admin later verifies. This module is deliberately
// structured around a `PaymentProvider` interface so an online payment gateway
// (Razorpay, Stripe, etc.) can be added later WITHOUT touching the UI: implement
// a new provider with `createCheckout` and register it in PAYMENT_PROVIDERS.

// BankAccountDetails describes the beneficiary account tenants pay into.
export interface BankAccountDetails {
  beneficiaryName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch?: string;
  accountType?: string;
  upiId: string;
}

// Public payment details are configurable via env (they are not secrets), with
// sensible defaults for local/demo use.
export const CYPRESS_BANK_ACCOUNT: BankAccountDetails = {
  beneficiaryName: process.env.NEXT_PUBLIC_PAY_BENEFICIARY || 'Cypress Property Management Pvt Ltd',
  accountNumber: process.env.NEXT_PUBLIC_PAY_ACCOUNT_NO || '007200011223344',
  ifsc: process.env.NEXT_PUBLIC_PAY_IFSC || 'HDFC0000072',
  bankName: process.env.NEXT_PUBLIC_PAY_BANK || 'HDFC Bank',
  branch: process.env.NEXT_PUBLIC_PAY_BRANCH || 'Whitefield, Bengaluru',
  accountType: process.env.NEXT_PUBLIC_PAY_ACCOUNT_TYPE || 'Current Account',
  upiId: process.env.NEXT_PUBLIC_PAY_UPI || 'cypresspm@hdfcbank',
};

// PaymentMethod enumerates the ways a tenant can settle rent. Offline methods
// are live today; `online_gateway` is reserved for future integration.
export type PaymentMethod = 'offline_bank_transfer' | 'upi' | 'online_gateway';

// PaymentStatus tracks an offline payment through Cypress verification.
export type PaymentStatus = 'awaiting_verification' | 'verified' | 'rejected';

// RentPayment is a tenant-submitted rent payment record.
export interface RentPayment {
  id: string;
  property_id: string;
  property_upid: string;
  tenant_id: string;
  tenant_name: string;
  period: string; // e.g. "September 2026"
  amount: number;
  method: PaymentMethod;
  reference?: string; // UTR / UPI transaction ref quoted by the tenant
  payment_date: string; // ISO date the tenant made the transfer
  status: PaymentStatus;
  notes?: string;
  // Uploaded proof-of-payment (stored durably in IndexedDB as a data URL).
  receipt_name?: string;
  receipt_data_url?: string;
  receipt_content_type?: string;
  receipt_size_kb?: number;
  // Snapshot of the account paid into, for the tenant's record.
  paid_to?: BankAccountDetails;
  created_at: string;
}

// PaymentInstructions is what the UI renders to tell a tenant how to pay.
export interface PaymentInstructions {
  kind: 'bank_transfer' | 'upi' | 'redirect';
  bank?: BankAccountDetails;
  upiId?: string;
  // A UPI deep-link the tenant can tap to open their UPI app pre-filled.
  upiDeepLink?: string;
  reference: string; // property UPID — quoted so Cypress can reconcile
  amount: number;
  note: string;
}

// PaymentContext carries the details a provider needs to build instructions or,
// in future, initiate an online checkout.
export interface PaymentContext {
  amount: number;
  propertyUpid: string;
  period: string;
  payerName?: string;
}

// CheckoutSession is the (future) result of initiating an online payment.
export interface CheckoutSession {
  provider: PaymentMethod;
  redirectUrl?: string;
  orderId?: string;
}

// PaymentProvider is the extension point. Offline providers implement
// `getInstructions`; an online gateway would additionally implement
// `createCheckout` to hand off to a hosted checkout / SDK.
export interface PaymentProvider {
  readonly method: PaymentMethod;
  readonly label: string;
  readonly description: string;
  readonly enabled: boolean;
  getInstructions(ctx: PaymentContext): PaymentInstructions;
  createCheckout?(ctx: PaymentContext): Promise<CheckoutSession>;
}

// buildUpiDeepLink assembles a UPI intent URL (BHIM/GPay/PhonePe understand it).
function buildUpiDeepLink(upiId: string, name: string, amount: number, note: string): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

const bankTransferProvider: PaymentProvider = {
  method: 'offline_bank_transfer',
  label: 'Bank Transfer (NEFT / IMPS / RTGS)',
  description: 'Transfer to the Cypress account below, then upload your receipt.',
  enabled: true,
  getInstructions: (ctx) => ({
    kind: 'bank_transfer',
    bank: CYPRESS_BANK_ACCOUNT,
    reference: ctx.propertyUpid,
    amount: ctx.amount,
    note: `Quote your property UPID ${ctx.propertyUpid} in the transfer remarks so we can reconcile your ${ctx.period} rent.`,
  }),
};

const upiProvider: PaymentProvider = {
  method: 'upi',
  label: 'UPI (GPay / PhonePe / BHIM)',
  description: 'Pay to our UPI ID, then upload the payment screenshot.',
  enabled: true,
  getInstructions: (ctx) => ({
    kind: 'upi',
    upiId: CYPRESS_BANK_ACCOUNT.upiId,
    upiDeepLink: buildUpiDeepLink(
      CYPRESS_BANK_ACCOUNT.upiId,
      CYPRESS_BANK_ACCOUNT.beneficiaryName,
      ctx.amount,
      `${ctx.propertyUpid} ${ctx.period} rent`,
    ),
    reference: ctx.propertyUpid,
    amount: ctx.amount,
    note: `Use property UPID ${ctx.propertyUpid} as the payment note.`,
  }),
};

// Reserved for future online payment-gateway integration. Disabled until wired.
const onlineGatewayProvider: PaymentProvider = {
  method: 'online_gateway',
  label: 'Card / Net Banking (Online)',
  description: 'Instant online payment — coming soon.',
  enabled: false,
  getInstructions: (ctx) => ({
    kind: 'redirect',
    reference: ctx.propertyUpid,
    amount: ctx.amount,
    note: 'Online payments will be available soon.',
  }),
  // createCheckout: async (ctx) => { /* integrate gateway here */ },
};

// PAYMENT_PROVIDERS is the registry the UI iterates over. Add a gateway here.
export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  bankTransferProvider,
  upiProvider,
  onlineGatewayProvider,
];

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  return PAYMENT_PROVIDERS.find((p) => p.method === method) ?? bankTransferProvider;
}

// ── Rent cycle helpers ─────────────────────────────────────────────────────
// Rent for a given month is due on RENT_DUE_DAY of that month (matches the
// backend rent-cycle default DueDay = 5). Configurable via env.
export const RENT_DUE_DAY = Number(process.env.NEXT_PUBLIC_RENT_DUE_DAY) || 5;

// startOfDay strips the time component for whole-day math.
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// currentPeriodLabel returns the human month-year label used on payments, e.g.
// "September 2026".
export function currentPeriodLabel(ref: Date = new Date()): string {
  return ref.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

// rentDueDate returns the due date for the current month's rent.
export function rentDueDate(ref: Date = new Date()): Date {
  return new Date(ref.getFullYear(), ref.getMonth(), RENT_DUE_DAY);
}

// RentDueInfo summarises how far the current rent period is from its due date.
export interface RentDueInfo {
  dueDate: Date;
  daysLeft: number; // >0 upcoming, 0 due today, <0 overdue
  overdue: boolean;
  // A short, human label like "5 days left", "Due today", "Overdue by 3 days".
  label: string;
}

// rentDueInfo computes days-left / overdue status for this month's rent.
export function rentDueInfo(ref: Date = new Date()): RentDueInfo {
  const due = rentDueDate(ref);
  const daysLeft = Math.round((startOfDay(due).getTime() - startOfDay(ref).getTime()) / 86_400_000);
  const overdue = daysLeft < 0;
  const label =
    daysLeft > 0
      ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
      : daysLeft === 0
        ? 'Due today'
        : `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'}`;
  return { dueDate: due, daysLeft, overdue, label };
}

