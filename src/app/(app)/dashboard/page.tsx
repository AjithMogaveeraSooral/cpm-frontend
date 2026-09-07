'use client';

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
} from 'lucide-react';
import { useDataStore } from '@/lib/data-store';
import { StatCard } from '@/components/ui/card';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { formatINR } from '@/lib/utils';

export default function DashboardPage() {
  const { currentRole, properties, tickets, leads, receipts, renewalAlerts } = useDataStore();

  const isAdmin = currentRole === 'cypress_admin';
  const isOwner = currentRole === 'owner';
  const isTenant = currentRole === 'tenant';

  const occupiedCount = properties.filter((p) => p.occupancy_status === 'occupied').length;
  const vacantCount = properties.filter((p) => p.occupancy_status === 'vacant').length;
  const openTickets = tickets.filter((t) => t.status !== 'closed');
  const activeAlert = renewalAlerts[0];

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
              value={1}
              hint="Flat A-804, Prestige Falcon City"
              icon={Home}
              accent="cypress"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Monthly Rent"
              value={42000}
              hint="Next due: 5th October 2026"
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
    </div>
  );
}
