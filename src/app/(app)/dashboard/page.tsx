'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  FileClock,
  Home,
  LifeBuoy,
  Receipt,
  Sparkles,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  KeyRound,
  UserCheck,
  IndianRupee,
  Clock,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { StatCard } from '@/components/ui/card';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { formatINR, formatDate } from '@/lib/utils';
import { PayRentModal } from '@/components/pay-rent-modal';
import { rentDueInfo, currentPeriodLabel } from '@/lib/payment';

// openReceipt opens an uploaded receipt (base64 data URL) in a new tab. Browsers
// block navigating directly to data: URLs, so convert to a Blob URL first.
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

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    currentRole,
    properties,
    tickets,
    leads,
    receipts,
    renewalAlerts,
    loadPropertiesFromApi,
    rentPayments,
    loadRentPayments,
    updateRentPaymentStatus,
  } = useDataStore();
  const [payRentOpen, setPayRentOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Resolve the effective role from the account's actual roles, falling back to
  // the persisted portal selection. This guarantees tenant content (incl. Pay
  // Rent) renders for tenant accounts even before the layout syncs currentRole.
  const roles = user?.roles ?? [];
  const resolvedRole = roles.includes(currentRole as (typeof roles)[number])
    ? currentRole
    : roles.includes('cypress_admin') || roles.includes('app_admin')
      ? 'cypress_admin'
      : roles.includes('owner')
        ? 'owner'
        : roles.includes('tenant')
          ? 'tenant'
          : currentRole;

  const isAdmin = resolvedRole === 'cypress_admin';
  const isOwner = resolvedRole === 'owner';
  const isTenant = resolvedRole === 'tenant';

  // Properties are sourced from the database on mount so the dashboard reflects
  // the tenant's actual connected property (not stale/persisted data).
  useEffect(() => {
    loadPropertiesFromApi();
  }, [loadPropertiesFromApi]);

  // Rent payments are stored durably in IndexedDB; hydrate them on mount.
  useEffect(() => {
    loadRentPayments();
  }, [loadRentPayments]);

  // Resolve the property the logged-in tenant is connected to.
  const tenantProperty = isTenant
    ? properties.find(
        (p) =>
          p.active_tenant_id === user?.id ||
          (user?.mobile && p.active_tenant_phone?.includes(user.mobile)) ||
          (user?.full_name && p.active_tenant_name?.toLowerCase().includes(user.full_name.toLowerCase())),
      ) ??
      // Fallback: if the tenant can see exactly one property (e.g. their own
      // unit returned by the API), treat it as their rented home.
      (properties.length === 1 ? properties[0] : undefined)
    : undefined;

  // This tenant's rent payments (newest first), for the dashboard history.
  const myPayments = isTenant
    ? rentPayments.filter((p) => p.tenant_id === user?.id || (tenantProperty && p.property_id === tenantProperty.id))
    : [];

  // Rent-cycle status for the current month.
  const dueInfo = rentDueInfo();
  const period = currentPeriodLabel();
  const paidThisPeriod =
    isTenant && myPayments.some((p) => p.period === period && p.status !== 'rejected');

  const tenantPropertyLabel = tenantProperty
    ? [tenantProperty.flat_no, tenantProperty.apartment_name].filter(Boolean).join(', ') ||
      tenantProperty.upid
    : undefined;

  const occupiedCount = properties.filter((p) => p.occupancy_status === 'occupied').length;
  const vacantCount = properties.filter((p) => p.occupancy_status === 'vacant').length;
  const openTickets = tickets.filter((t) => t.status !== 'closed');
  const activeAlert = renewalAlerts[0];

  // Tenant rent payments awaiting the Cypress admin's approval (newest first).
  const adminPendingPayments = isAdmin
    ? rentPayments
        .filter((p) => p.status === 'awaiting_verification')
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    : [];

  const handleDecision = async (paymentId: string, status: 'verified' | 'rejected') => {
    setPendingAction(paymentId);
    try {
      await updateRentPaymentStatus(paymentId, status);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {isAdmin && 'Cypress Operations Console'}
            {isOwner && 'Property Owner Dashboard'}
            {isTenant && 'Tenant Resident Portal'}
            <span className="rounded-full bg-cypress-50 border border-cypress-200 px-2.5 py-0.5 text-xs font-bold text-cypress-800">
              {isAdmin ? 'Admin View' : isOwner ? 'Landlord View' : 'Resident View'}
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin && 'Live metrics across all managed Bangalore apartments, maintenance tickets, and rent verifications.'}
            {isOwner && 'Overview of your owned properties, rental yield, tenant lease agreements, and service plans.'}
            {isTenant && 'Manage your tenancy, raise maintenance tickets, and view official rent receipts.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Cypress Operations Active
          </span>
        </div>
      </div>

      {/* Renewal Notification Banner */}
      {activeAlert && (isAdmin || isOwner) && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-soft">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Service Plan Renewal Notification: {activeAlert.property_name}
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Plan ({activeAlert.plan_tier}) is set to expire in <strong>{activeAlert.days_left} days</strong>. Both Owner and Cypress Admin are alerted.
              </p>
            </div>
          </div>
          <Link
            href={`/properties/${activeAlert.property_id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-amber-700 shrink-0"
          >
            Review & Renew Plan <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ADMIN STATS */}
      {isAdmin && (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatCard
              label="Total Properties"
              value={properties.length}
              hint={`${vacantCount} vacant · ${occupiedCount} occupied`}
              icon={Building2}
              accent="cypress"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Active Tenancies"
              value={occupiedCount}
              hint="100% agreement compliance"
              icon={Users}
              accent="sky"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Open Tickets"
              value={openTickets.length}
              hint="Under 24h SLA"
              icon={LifeBuoy}
              accent="amber"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="New Inquiries"
              value={leads.filter((l) => l.status === 'new').length}
              hint="Owner onboarding leads"
              icon={FileClock}
              accent="gold"
            />
          </StaggerItem>
        </Stagger>
      )}

      {/* ADMIN: Pending rent payment approvals (tenant offline "Pay Rent" submissions) */}
      {isAdmin && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <IndianRupee className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Rent Payment Approvals</h3>
                <p className="text-xs text-slate-500">
                  {adminPendingPayments.length > 0
                    ? `${adminPendingPayments.length} tenant payment${adminPendingPayments.length > 1 ? 's' : ''} awaiting your verification`
                    : 'All tenant payments have been reviewed'}
                </p>
              </div>
            </div>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-cypress-400 hover:bg-cypress-50"
            >
              View all payments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {adminPendingPayments.length === 0 ? (
            <div className="flex items-center gap-2 px-5 py-8 text-sm text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              No rent payments pending approval right now.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {adminPendingPayments.slice(0, 6).map((p) => {
                const busy = pendingAction === p.id;
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{p.tenant_name || 'Tenant'}</span>
                        <span className="font-mono text-[11px] font-bold text-cypress-700">{p.property_upid}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                        <span className="font-bold text-cypress-800">{formatINR(p.amount)}</span>
                        <span>{p.period}</span>
                        <span className="capitalize">{p.method.replace(/_/g, ' ')}</span>
                        {p.payment_date && <span>Paid {formatDate(p.payment_date)}</span>}
                        {p.reference && <span className="font-mono">Ref {p.reference}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.receipt_data_url && (
                        <button
                          onClick={() => openReceipt(p.receipt_data_url)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-cypress-400 hover:bg-cypress-50"
                        >
                          Receipt
                        </button>
                      )}
                      <button
                        disabled={busy}
                        onClick={() => handleDecision(p.id, 'verified')}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => handleDecision(p.id, 'rejected')}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* OWNER STATS */}
      {isOwner && (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatCard
              label="Owned Properties"
              value={2}
              hint="Prestige Falcon City & Sobha Dream Acres"
              icon={Home}
              accent="cypress"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Monthly Rental Inflow"
              value={70000}
              hint="Deposited 5th of each month"
              icon={Receipt}
              accent="sky"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Active Service Plan"
              value={1}
              hint="Gold NRI Prime Plan"
              icon={ShieldCheck}
              accent="gold"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Tickets Requiring Approval"
              value={tickets.filter((t) => t.status === 'owner_approval_pending').length}
              hint="Chargeable maintenance"
              icon={AlertTriangle}
              accent="rose"
            />
          </StaggerItem>
        </Stagger>
      )}

      {/* TENANT STATS */}
      {isTenant && (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatCard
              label="My Rented Home"
              value={tenantProperty ? 1 : 0}
              hint={tenantPropertyLabel || 'No property connected yet'}
              icon={Home}
              accent="cypress"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Monthly Rent"
              value={tenantProperty ? formatINR(tenantProperty.monthly_rent) : '—'}
              hint={
                !tenantProperty
                  ? 'No active lease'
                  : paidThisPeriod
                    ? `Paid for ${period}`
                    : `${dueInfo.label} · due ${formatDate(dueInfo.dueDate.toISOString())}`
              }
              icon={Receipt}
              accent="sky"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="My Active Tickets"
              value={openTickets.length}
              hint="Track electrician & carpentry"
              icon={LifeBuoy}
              accent="amber"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Verified Receipts"
              value={receipts.length}
              hint="HRA Tax Exemption ready"
              icon={CheckCircle2}
              accent="gold"
            />
          </StaggerItem>
        </Stagger>
      )}

      {/* TENANT: PAY RENT */}
      {isTenant && (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Pay Rent CTA */}
          <div className="lg:col-span-1 rounded-2xl border border-cypress-200 bg-gradient-to-br from-cypress-50 to-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cypress-gradient text-white shadow-soft">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pay Rent</h3>
                <p className="text-[11px] text-slate-500">Offline transfer · upload receipt</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-cypress-900">
              {tenantProperty ? formatINR(tenantProperty.monthly_rent) : '—'}
            </p>
            <p className="mb-3 mt-0.5 text-xs text-slate-500">
              {period} rent{tenantProperty ? ` · UPID ${tenantProperty.upid}` : ''}
            </p>

            {/* Days-left / due status */}
            {paidThisPeriod ? (
              <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" /> Paid for {period}
              </div>
            ) : (
              <div
                className={`mb-4 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${
                  dueInfo.overdue
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : dueInfo.daysLeft <= 3
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Clock className="h-3.5 w-3.5" /> {dueInfo.label} · Due {formatDate(dueInfo.dueDate.toISOString())}
              </div>
            )}

            <button
              type="button"
              disabled={!tenantProperty}
              onClick={() => setPayRentOpen(true)}
              className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cypress-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IndianRupee className="h-4 w-4" /> {paidThisPeriod ? 'Pay Again' : 'Pay Rent Now'}
            </button>
            {!tenantProperty && (
              <p className="mt-2 text-center text-[11px] text-slate-400">
                No connected property yet. Contact Cypress to link your tenancy.
              </p>
            )}
          </div>

          {/* Recent payments */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Rent Payments</h3>
              <Link href="/invoices" className="text-xs font-semibold text-cypress-700 hover:text-cypress-900">
                View receipts
              </Link>
            </div>
            {myPayments.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No payments yet. Use “Pay Rent Now” to submit your first payment.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {myPayments.slice(0, 4).map((p) => {
                  const badge =
                    p.status === 'verified'
                      ? { cls: 'bg-emerald-50 text-emerald-700', Icon: CheckCircle2, label: 'Verified' }
                      : p.status === 'rejected'
                        ? { cls: 'bg-red-50 text-red-700', Icon: XCircle, label: 'Rejected' }
                        : { cls: 'bg-amber-50 text-amber-700', Icon: Clock, label: 'Awaiting verification' };
                  return (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {formatINR(p.amount)} · {p.period}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          Paid {formatDate(p.payment_date)} · {p.method.replace(/_/g, ' ')}
                          {p.reference ? ` · Ref ${p.reference}` : ''}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.cls}`}
                      >
                        <badge.Icon className="h-3 w-3" /> {badge.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Quick Action Navigation Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <Link href="/properties">
          <div className="card-premium p-5 hover:border-cypress-400 hover:shadow-card transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cypress-50 text-cypress-700">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isAdmin ? 'Properties & UPID Directory' : isOwner ? 'My Properties & Vault' : 'My Rented Flat'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Access documents folder, pre-inspection photos/videos, inventory list, and association maintenance.
            </p>
          </div>
        </Link>

        <Link href="/invoices">
          <div className="card-premium p-5 hover:border-cypress-400 hover:shadow-card transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Rent Receipts & Ledger</h3>
            </div>
            <p className="text-xs text-slate-500">
              {isAdmin ? 'Generate HRA-compliant rent receipts and audit maintenance payments.' : 'View rent history, advance deposits, and download official receipts.'}
            </p>
          </div>
        </Link>

        <Link href="/tickets">
          <div className="card-premium p-5 hover:border-cypress-400 hover:shadow-card transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Maintenance & Service Tickets</h3>
            </div>
            <p className="text-xs text-slate-500">
              5-step lifecycle: Raised $\to$ Cypress Acknowledged $\to$ Owner Approval $\to$ Resolved $\to$ Tenant Verified.
            </p>
          </div>
        </Link>
      </div>

      {/* Pay Rent modal (tenant) */}
      {isTenant && tenantProperty && payRentOpen && (
        <PayRentModal
          isOpen={payRentOpen}
          onClose={() => setPayRentOpen(false)}
          property={tenantProperty}
          tenantId={user?.id ?? ''}
          tenantName={user?.full_name ?? 'Tenant'}
        />
      )}
    </div>
  );
}
