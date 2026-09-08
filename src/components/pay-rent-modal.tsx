'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Building2,
  Landmark,
  Smartphone,
  UploadCloud,
  ShieldCheck,
  CheckCircle2,
  FileText,
  IndianRupee,
} from 'lucide-react';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import {
  PAYMENT_PROVIDERS,
  getPaymentProvider,
  type PaymentMethod,
} from '@/lib/payment';
import type { Property } from '@/lib/types';

interface PayRentModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  tenantId: string;
  tenantName: string;
}

// CopyField renders a labelled value with a one-tap copy button so tenants can
// accurately copy bank/UPI details into their banking app.
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        title={`Copy ${label}`}
        className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-cypress-700"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

const MAX_RECEIPT_MB = 15;

export function PayRentModal({ isOpen, onClose, property, tenantId, tenantName }: PayRentModalProps) {
  const submitRentPayment = useDataStore((s) => s.submitRentPayment);

  const period = useMemo(
    () => new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    [],
  );

  const [method, setMethod] = useState<PaymentMethod>('offline_bank_transfer');
  const [amount, setAmount] = useState(String(property.monthly_rent || ''));
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState<{ name: string; dataUrl: string; type: string; sizeKb: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const provider = getPaymentProvider(method);
  const instructions = provider.getInstructions({
    amount: Number(amount) || property.monthly_rent || 0,
    propertyUpid: property.upid,
    period,
    payerName: tenantName,
  });

  const handleReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const ok = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!ok) {
      setError('Receipt must be an image or PDF.');
      return;
    }
    if (file.size > MAX_RECEIPT_MB * 1024 * 1024) {
      setError(`Receipt exceeds the ${MAX_RECEIPT_MB}MB limit.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setReceipt({
        name: file.name,
        dataUrl: String(reader.result),
        type: file.type,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
      });
    reader.onerror = () => setError('Could not read the receipt. Please try again.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError(null);
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }
    if (!receipt) {
      setError('Please upload your payment receipt / screenshot.');
      return;
    }
    setSubmitting(true);
    try {
      await submitRentPayment({
        property_id: property.id,
        property_upid: property.upid,
        tenant_id: tenantId,
        tenant_name: tenantName,
        period,
        amount: amt,
        method,
        reference: reference.trim() || undefined,
        payment_date: paymentDate,
        notes: notes.trim() || undefined,
        receipt_name: receipt.name,
        receipt_data_url: receipt.dataUrl,
        receipt_content_type: receipt.type,
        receipt_size_kb: receipt.sizeKb,
        paid_to: instructions.bank,
      });
      setDone(true);
    } catch {
      setError('Could not save your payment. Your device storage may be full — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative my-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-cypress-gradient px-5 py-4 text-white">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold">
                <IndianRupee className="h-4 w-4" /> Pay Rent — {period}
              </h3>
              <p className="mt-0.5 text-xs text-white/80">
                {property.flat_no}
                {property.apartment_name ? `, ${property.apartment_name}` : ''} · UPID {property.upid}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {done ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Payment submitted for verification</h4>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                We&apos;ve recorded your {formatINR(Number(amount))} payment for {period}. Cypress will verify the
                receipt against the bank account and issue your official rent receipt.
              </p>
              <Button className="mt-6" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5">
              {/* Amount + UPID */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-cypress-200 bg-cypress-50 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-cypress-700">Rent Due</p>
                  <p className="text-2xl font-bold text-cypress-900">{formatINR(Number(amount) || 0)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Payment Reference (UPID)
                  </p>
                  <p className="text-lg font-bold text-slate-800">{property.upid}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Quote this in your transfer remarks.</p>
                </div>
              </div>

              {/* Method selector */}
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-700">Choose how you paid</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {PAYMENT_PROVIDERS.map((p) => {
                    const active = method === p.method;
                    const Icon = p.method === 'upi' ? Smartphone : p.method === 'online_gateway' ? Building2 : Landmark;
                    return (
                      <button
                        key={p.method}
                        type="button"
                        disabled={!p.enabled}
                        onClick={() => p.enabled && setMethod(p.method)}
                        className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                          active
                            ? 'border-cypress-500 bg-cypress-50 ring-1 ring-cypress-500'
                            : 'border-slate-200 bg-white hover:border-cypress-300'
                        } ${!p.enabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'}`}
                      >
                        <Icon className="h-4 w-4 text-cypress-700" />
                        <span className="text-xs font-bold text-slate-800">{p.label}</span>
                        {!p.enabled && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                            Coming soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment instructions */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-cypress-600" /> Cypress Collection Account
                </p>

                {instructions.kind === 'upi' ? (
                  <div className="space-y-2">
                    <CopyField label="UPI ID" value={instructions.upiId || ''} />
                    {instructions.upiDeepLink && (
                      <a
                        href={instructions.upiDeepLink}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cypress-700 hover:text-cypress-900"
                      >
                        <Smartphone className="h-3.5 w-3.5" /> Open UPI app to pay
                      </a>
                    )}
                  </div>
                ) : (
                  instructions.bank && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <CopyField label="Beneficiary" value={instructions.bank.beneficiaryName} />
                      <CopyField label="Account Number" value={instructions.bank.accountNumber} />
                      <CopyField label="IFSC" value={instructions.bank.ifsc} />
                      <CopyField label="Bank" value={instructions.bank.bankName} />
                      {instructions.bank.branch && <CopyField label="Branch" value={instructions.bank.branch} />}
                      <CopyField label="UPI ID" value={instructions.bank.upiId} />
                    </div>
                  )
                )}
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800">{instructions.note}</p>
              </div>

              {/* Payment details form */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Amount Paid</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-cypress-400 focus:outline-none focus:ring-1 focus:ring-cypress-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Date Paid</span>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-cypress-400 focus:outline-none focus:ring-1 focus:ring-cypress-400"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">
                    Transaction / UTR Reference <span className="font-normal text-slate-400">(optional)</span>
                  </span>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. UPI Ref 4023xxxx or NEFT UTR"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-cypress-400 focus:outline-none focus:ring-1 focus:ring-cypress-400"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">
                    Notes <span className="font-normal text-slate-400">(optional)</span>
                  </span>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything Cypress should know"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-cypress-400 focus:outline-none focus:ring-1 focus:ring-cypress-400"
                  />
                </label>
              </div>

              {/* Receipt upload */}
              <div>
                <p className="mb-1.5 text-xs font-semibold text-slate-600">Upload Payment Receipt / Screenshot</p>
                {receipt ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="truncate text-sm font-semibold text-emerald-900">{receipt.name}</span>
                      <span className="shrink-0 text-[11px] text-emerald-700">({receipt.sizeKb} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceipt(null)}
                      className="shrink-0 rounded-lg p-1 text-emerald-700 hover:bg-emerald-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-cypress-400 hover:bg-cypress-50/40">
                    <UploadCloud className="h-6 w-6 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">Click to upload (image or PDF)</span>
                    <span className="text-[11px] text-slate-400">Max {MAX_RECEIPT_MB}MB</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleReceipt} />
                  </label>
                )}
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button variant="secondary" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} loading={submitting}>
                  Submit Payment
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
