'use client';

import { useEffect, useState } from 'react';
import { Download, FileText, Plus, Printer, Receipt, ShieldCheck, Sparkles, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatINR, formatDate } from '@/lib/utils';
import { RentReceiptGenerator } from '@/components/rent-receipt-generator';
import type { RentReceipt } from '@/lib/types';
import type { RentPayment } from '@/lib/payment';

// openReceipt opens an uploaded receipt (stored as a base64 data URL) in a new
// tab. Browsers block navigating to data: URLs, so convert to a Blob URL first.
function openReceipt(dataUrl?: string) {
  if (!dataUrl) return;
  try {
    const [meta, base64] = dataUrl.split(',');
    const contentType = meta.match(/data:(.*?);base64/)?.[1] ?? 'application/octet-stream';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: contentType }));
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    /* ignore malformed data URL */
  }
}

export default function InvoicesPage() {
  const { user } = useAuth();
  const {
    currentRole,
    receipts,
    rentHistory,
    properties,
    rentPayments,
    loadRentPayments,
    updateRentPaymentStatus,
  } = useDataStore();
  const [activeTab, setActiveTab] = useState<'receipts' | 'payments' | 'ledger' | 'maintenance'>('receipts');
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [viewReceipt, setViewReceipt] = useState<RentReceipt | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const isAdmin = currentRole === 'cypress_admin';
  const isOwner = currentRole === 'owner';
  const isTenant = currentRole === 'tenant';

  // Rent payments are stored durably in IndexedDB; hydrate them on mount.
  useEffect(() => {
    loadRentPayments();
  }, [loadRentPayments]);

  // Payments visible to the current user: admin sees all; owner sees payments
  // for properties they own; tenant sees their own submissions.
  const ownedPropertyIds = new Set(
    properties
      .filter(
        (p) =>
          p.owner_id === user?.id ||
          (user?.full_name && p.owner_name?.toLowerCase().includes(user.full_name.toLowerCase())),
      )
      .map((p) => p.id),
  );
  const visiblePayments = rentPayments.filter((p) => {
    if (isAdmin) return true;
    if (isTenant) return p.tenant_id === user?.id;
    if (isOwner) return ownedPropertyIds.has(p.property_id);
    return false;
  });
  const pendingCount = visiblePayments.filter((p) => p.status === 'awaiting_verification').length;

  const handleDecision = async (payment: RentPayment, status: RentPayment['status']) => {
    setPendingAction(payment.id);
    try {
      await updateRentPaymentStatus(payment.id, status);
    } finally {
      setPendingAction(null);
    }
  };

  // Filter based on authenticated user
  const visibleReceipts = receipts.filter((r) => {
    if (isAdmin) return true;
    if (isOwner) {
      if (!user) return true;
      return (
        r.owner_id === user.id ||
        (user.full_name && r.owner_name?.toLowerCase().includes(user.full_name.toLowerCase()))
      );
    }
    if (isTenant) {
      if (!user) return true;
      return (
        r.tenant_id === user.id ||
        (user.full_name && r.tenant_name?.toLowerCase().includes(user.full_name.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            Rent Receipts & Financial Ledger
            <span className="inline-flex items-center gap-1 rounded-full border border-cypress-200 bg-cypress-50 px-2.5 py-0.5 text-xs font-semibold text-cypress-700">
              <ShieldCheck className="h-3.5 w-3.5 text-cypress-600" /> HRA & Society Tax Verified
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin && 'Generate official rent receipts, track monthly association maintenance, and audit tenant payment records.'}
            {isOwner && 'View monthly rent payouts, association maintenance records, advance security deposits, and receipts.'}
            {isTenant && 'Download official rent receipts for HRA tax exemption proof and monitor maintenance dues.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button onClick={() => setGeneratorOpen(true)}>
              <Plus className="h-4 w-4" /> Generate Rent Receipt
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('receipts')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'receipts'
              ? 'border-cypress-600 text-cypress-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Rent Receipts ({visibleReceipts.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`relative pb-3 border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-cypress-600 text-cypress-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {isAdmin ? 'Payment Approvals' : 'My Payments'} ({visiblePayments.length})
          {pendingCount > 0 && (
            <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'ledger'
              ? 'border-cypress-600 text-cypress-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Rent Payment History & Advance
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'maintenance'
              ? 'border-cypress-600 text-cypress-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Association Maintenance Tracking
        </button>
      </div>

      {/* Tab 1: Rent Receipts */}
      {activeTab === 'receipts' && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Property / UPID</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Landlord (PAN)</th>
                  <th className="px-4 py-3 text-right">Rent Paid</th>
                  <th className="px-4 py-3 text-right">Association Maint.</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800">
                      {r.receipt_no}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-cypress-700">
                      {r.property_upid}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.month_year}</td>
                    <td className="px-4 py-3 text-slate-700">{r.tenant_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {r.owner_name} <span className="font-mono text-[10px] text-slate-400">({r.owner_pan || 'PAN Verified'})</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatINR(r.rent_amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-600">
                      {r.maintenance_amount ? formatINR(r.maintenance_amount) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-cypress-800">
                      {formatINR(r.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setViewReceipt(r)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-cypress-400 hover:bg-cypress-50 shadow-soft"
                      >
                        <Printer className="h-3 w-3 text-cypress-600" /> View & Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleReceipts.length === 0 && (
            <p className="px-4 py-10 text-center text-slate-400">No rent receipts generated yet.</p>
          )}
        </Card>
      )}

      {/* Tab: Rent Payment Approvals (offline payments submitted by tenants) */}
      {activeTab === 'payments' && (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isAdmin ? 'Tenant Rent Payment Approvals' : 'My Submitted Rent Payments'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAdmin
                  ? 'Verify each offline payment against the Cypress bank statement, then approve or reject.'
                  : 'Track the verification status of the payments you submitted.'}
              </p>
            </div>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                <Clock className="h-3.5 w-3.5" /> {pendingCount} awaiting verification
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Property / UPID</th>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Paid On</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Receipt</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visiblePayments.map((p) => {
                  const badge =
                    p.status === 'verified'
                      ? { cls: 'bg-emerald-100 text-emerald-800', Icon: CheckCircle2, label: 'Approved' }
                      : p.status === 'rejected'
                        ? { cls: 'bg-red-100 text-red-700', Icon: XCircle, label: 'Rejected' }
                        : { cls: 'bg-amber-100 text-amber-800', Icon: Clock, label: 'Awaiting verification' };
                  const busy = pendingAction === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-cypress-700">{p.property_upid}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{p.tenant_name}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.period}</td>
                      <td className="px-4 py-3 text-xs capitalize text-slate-600">{p.method.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.reference || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(p.payment_date)}</td>
                      <td className="px-4 py-3 text-right font-bold text-cypress-800">{formatINR(p.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        {p.receipt_data_url ? (
                          <button
                            onClick={() => openReceipt(p.receipt_data_url)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-cypress-400 hover:bg-cypress-50"
                          >
                            <Eye className="h-3 w-3 text-cypress-600" /> View
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.cls}`}
                        >
                          <badge.Icon className="h-3 w-3" /> {badge.label}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          {p.status === 'awaiting_verification' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                disabled={busy}
                                onClick={() => handleDecision(p, 'verified')}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                <CheckCircle2 className="h-3 w-3" /> Approve
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => handleDecision(p, 'rejected')}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                              >
                                <XCircle className="h-3 w-3" /> Reject
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <button
                                disabled={busy}
                                onClick={() => handleDecision(p, 'awaiting_verification')}
                                className="text-xs font-semibold text-slate-400 hover:text-slate-600 disabled:opacity-60"
                              >
                                Reset
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {visiblePayments.length === 0 && (
            <p className="px-4 py-10 text-center text-slate-400">
              {isAdmin ? 'No tenant payments submitted yet.' : 'You have not submitted any rent payments yet.'}
            </p>
          )}
        </Card>
      )}

      {/* Tab 2: Rent Payment History & Advance Ledger */}
      {activeTab === 'ledger' && (
        <Card className="overflow-hidden p-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Prestige Falcon City (A-804) — Rent & Advance Ledger</h3>
              <p className="text-xs text-slate-500">Security Deposit with Owner: ₹2,50,000 · Monthly Rent: ₹42,000</p>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">
              Account Good Standing
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Rental Month</th>
                  <th className="px-4 py-3">Rent Due</th>
                  <th className="px-4 py-3">Society Maintenance</th>
                  <th className="px-4 py-3">Security Deposit Advance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Receipt Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.period}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{formatINR(item.rent_amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatINR(item.maintenance_amount)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatINR(item.advance_balance)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          item.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.paid_at || 'Due 5th'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-cypress-700">
                      {item.receipt_no || 'Pending Verification'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Association Maintenance Tracking */}
      {activeTab === 'maintenance' && (
        <Card className="overflow-hidden p-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Apartment Association Maintenance Payments</h3>
            <p className="text-xs text-slate-500">
              Recorded per property agreement: whether maintenance is paid directly by the Owner or Tenant.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Property / UPID</th>
                  <th className="px-4 py-3">Association / Society Name</th>
                  <th className="px-4 py-3">Monthly Charge</th>
                  <th className="px-4 py-3">Payer (Per Agreement)</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Society Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((p) => {
                  const m = p.association_maintenance;
                  if (!m) return null;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{p.flat_no} {p.apartment_name}</div>
                        <div className="font-mono text-xs text-cypress-700">{p.upid}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-700">{m.society_name}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{formatINR(m.amount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                            m.payer === 'tenant'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          Paid by {m.payer}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                            m.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(m.due_date)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">
                        {m.receipt_no || 'Awaiting Upload'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Generator Modal */}
      <RentReceiptGenerator isOpen={generatorOpen} onClose={() => setGeneratorOpen(false)} />

      {/* View & Print Modal for a specific receipt */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-slate-900">Rent Receipt Preview</h3>
              <button onClick={() => setViewReceipt(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="rounded-xl border-2 border-slate-800 p-6 text-xs text-slate-800">
              <div className="flex justify-between border-b-2 border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 uppercase">Cypress Property Management</h4>
                  <p className="text-[10px] text-slate-500">Official Rent Receipt for HRA Tax Proof</p>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-cypress-800">{viewReceipt.receipt_no}</span>
                  <p className="text-[10px] text-slate-400">{viewReceipt.payment_date}</p>
                </div>
              </div>

              <div className="my-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Tenant (Payee)</p>
                  <p className="font-bold text-sm text-slate-900">{viewReceipt.tenant_name}</p>
                  <p className="text-slate-600">Month: {viewReceipt.month_year}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Landlord (PAN)</p>
                  <p className="font-bold text-sm text-slate-900">{viewReceipt.owner_name}</p>
                  <p className="font-mono text-slate-600">PAN: {viewReceipt.owner_pan || 'ABCDE1234F'}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase text-slate-400">Property</p>
                <p className="font-mono font-bold text-cypress-700">{viewReceipt.property_upid}</p>
                <p className="text-slate-600">{viewReceipt.property_address}</p>
              </div>

              <div className="rounded-lg bg-slate-100 p-3 flex justify-between font-bold text-sm">
                <span>Total Received</span>
                <span className="text-cypress-800">{formatINR(viewReceipt.total_amount)}</span>
              </div>

              <div className="mt-3 flex justify-between text-[11px] text-slate-500">
                <span>Mode: {viewReceipt.payment_mode} (Ref: {viewReceipt.transaction_id})</span>
                <span className="font-bold text-emerald-700">✓ Verified by Cypress Admin</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print / Save PDF
              </Button>
              <Button variant="secondary" onClick={() => setViewReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
