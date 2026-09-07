'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LifeBuoy,
  Plus,
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Tv,
  HelpCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Ticket } from '@/lib/types';

const CATEGORY_ICONS: Record<Ticket['category'], typeof Zap> = {
  electrical: Zap,
  plumber: Wrench,
  carpenter: Hammer,
  painting: Paintbrush,
  appliance: Tv,
  general: HelpCircle,
};

const STATUS_BADGES: Record<Ticket['status'], { label: string; cls: string }> = {
  open: { label: 'Open · Notified', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  cypress_acknowledged: { label: 'Cypress Acknowledged · Team Assigned', cls: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  owner_approval_pending: { label: 'Requires Owner Approval', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
  in_progress: { label: 'In Progress · Work Underway', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
  resolved: { label: 'Work Resolved · Awaiting Tenant', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  closed: { label: 'Closed · Tenant Verified', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  rejected: { label: 'Declined by Owner', cls: 'bg-red-100 text-red-700 border-red-200' },
};

export default function TicketsPage() {
  const { currentRole, tickets, properties, raiseTicket } = useDataStore();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showRaiseModal, setShowRaiseModal] = useState(false);

  // Form State for Raise Ticket
  const [propId, setPropId] = useState(properties[0]?.id || '');
  const [category, setCategory] = useState<Ticket['category']>('electrical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Ticket['priority']>('medium');

  const isAdmin = currentRole === 'cypress_admin';
  const isOwner = currentRole === 'owner';
  const isTenant = currentRole === 'tenant';

  // Role filtering
  const visibleTickets = tickets.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    raiseTicket({
      propertyId: propId,
      category,
      title,
      description,
      priority,
    });

    setTitle('');
    setDescription('');
    setShowRaiseModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Maintenance & Service Tickets
            <span className="inline-flex items-center gap-1 rounded-full border border-cypress-200 bg-cypress-50 px-2.5 py-0.5 text-xs font-semibold text-cypress-700">
              <ShieldCheck className="h-3 w-3 text-cypress-600" /> Plan SLA Protected
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin && 'Dispatch vendor technicians, verify plan coverage, and monitor owner approvals.'}
            {isOwner && 'Review maintenance requests, authorize chargeable work, and monitor property condition.'}
            {isTenant && 'Raise tickets for electrical, plumbing, carpentry, or appliances and track resolution.'}
          </p>
        </div>

        <Button onClick={() => setShowRaiseModal(true)}>
          <Plus className="h-4 w-4" /> Raise Maintenance Ticket
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'electrical', 'plumber', 'carpenter', 'appliance', 'painting', 'general'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition ${
                filterCategory === cat
                  ? 'bg-cypress-gradient text-white shadow-soft'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Trades' : cat}
            </button>
          ))}
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open · Notified</option>
          <option value="cypress_acknowledged">Cypress Acknowledged</option>
          <option value="owner_approval_pending">Owner Approval Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed · Verified</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {visibleTickets.map((t) => {
          const Icon = CATEGORY_ICONS[t.category] || HelpCircle;
          const badge = STATUS_BADGES[t.status] || { label: t.status, cls: 'bg-slate-100 text-slate-700' };

          return (
            <Link key={t.id} href={`/tickets/${t.id}`}>
              <Card className="group p-4 transition-all duration-200 hover:border-cypress-400 hover:shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-cypress-100 group-hover:text-cypress-800 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cypress-700">
                          {t.property_upid}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-bold uppercase text-slate-600">
                          {t.category}
                        </span>
                        {t.plan_covered && (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                            Covered in Plan
                          </span>
                        )}
                        {t.status === 'owner_approval_pending' && (
                          <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.2 text-[10px] font-bold text-rose-800">
                            Est. ₹{t.estimated_cost} · Approval Pending
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-cypress-800 transition-colors mt-1">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> SLA: {t.sla_hours}h ({formatDate(t.created_at)})
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}

        {visibleTickets.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <LifeBuoy className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-800">No maintenance tickets</h3>
            <p className="text-xs text-slate-500 mt-1">
              No tickets found matching the selected category and status filters.
            </p>
          </div>
        )}
      </div>

      {/* Raise Ticket Modal */}
      {showRaiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cypress-gradient text-white">
                  <LifeBuoy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Raise Maintenance Ticket</h3>
                  <p className="text-xs text-slate-500">Both Property Owner and Cypress will be immediately notified</p>
                </div>
              </div>
              <button onClick={() => setShowRaiseModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Property</label>
                <select
                  value={propId}
                  onChange={(e) => setPropId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.upid} — Flat {p.flat_no}, {p.apartment_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Category / Trade</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 capitalize"
                  >
                    <option value="electrical">⚡ Electrical (Switch, MCB, Wiring)</option>
                    <option value="plumber">🔧 Plumbing (Taps, Pipes, Drain)</option>
                    <option value="carpenter">🔨 Carpentry (Doors, Locks, Wood)</option>
                    <option value="appliance">📺 Appliance (AC, Geyser, Chimney)</option>
                    <option value="painting">🎨 Painting & Wall Seepage</option>
                    <option value="general">🧹 General Maintenance & Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 capitalize"
                  >
                    <option value="low">Low (Routine)</option>
                    <option value="medium">Medium (Standard 48h SLA)</option>
                    <option value="high">High (Urgent 24h SLA)</option>
                    <option value="emergency">Emergency (Safety Hazard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Summary / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master bathroom geyser not heating water"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe when the problem started, symptoms, any sparking or leak details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="rounded-xl bg-cypress-50/80 border border-cypress-100 p-3 text-cypress-900 space-y-1">
                <p className="font-semibold">Cypress SLA Protocol:</p>
                <p className="text-[11px] text-cypress-700">
                  Cypress Operations will acknowledge the ticket, evaluate plan coverage, dispatch an authorized technician, and notify the tenant upon job completion.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <Button type="button" variant="secondary" onClick={() => setShowRaiseModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <LifeBuoy className="h-4 w-4" /> Raise Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
