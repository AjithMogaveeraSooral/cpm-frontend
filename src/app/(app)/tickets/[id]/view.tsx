'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  User,
  Wrench,
  Zap,
  Hammer,
  FileCheck,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate, formatINR } from '@/lib/utils';
import type { Ticket } from '@/lib/types';

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    currentRole,
    tickets,
    properties,
    acknowledgeTicket,
    ownerApproveTicket,
    resolveTicket,
    tenantAcknowledgeTicket,
  } = useDataStore();

  const ticket = tickets.find((t) => t.id === params.id) || tickets[0];

  // Acknowledgment modal state
  const [ackPlanCovered, setAckPlanCovered] = useState(true);
  const [ackCost, setAckCost] = useState('1500');
  const [ackNote, setAckNote] = useState('');

  // Resolution note state
  const [resNote, setResNote] = useState('Technician inspected and replaced faulty parts. Tested under full load.');

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Ticket not found.</p>
        <Link href="/tickets">
          <Button variant="secondary" className="mt-3">
            Back to Tickets
          </Button>
        </Link>
      </div>
    );
  }

  const property = properties.find((p) => p.id === ticket.property_id);
  const isAdmin = currentRole === 'cypress_admin';
  const isOwner = currentRole === 'owner';
  const isTenant = currentRole === 'tenant';

  return (
    <div className="max-w-4xl pb-16">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Tickets
        </Link>
      </div>

      {/* Ticket Header */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-cypress-700 bg-cypress-50 border border-cypress-200 px-2 py-0.5 rounded-lg">
                {ticket.property_upid}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase text-slate-600">
                {ticket.category}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                  ticket.priority === 'emergency'
                    ? 'bg-red-100 text-red-800'
                    : ticket.priority === 'high'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Priority: {ticket.priority}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900">{ticket.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Raised on {formatDate(ticket.created_at)} by <strong>{ticket.created_by_name || 'Tenant'}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block rounded-full border border-cypress-300 bg-cypress-50 px-3 py-1 text-xs font-bold text-cypress-800 capitalize">
              ● {ticket.status.replace(/_/g, ' ')}
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-end gap-1">
              <Clock className="h-3 w-3" /> SLA Due: {formatDate(ticket.sla_due_at)}
            </p>
          </div>
        </div>

        {/* Plan coverage notice */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cypress-600" />
            <span>
              Property Plan: <strong>{property?.plan_name || 'Gold NRI Prime'}</strong>
            </span>
            {ticket.plan_covered ? (
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.2 text-[10px] font-bold">
                Covered in Plan (Zero Owner Surcharge)
              </span>
            ) : (
              <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.2 text-[10px] font-bold">
                Owner Authorization Required
              </span>
            )}
          </div>
          {ticket.estimated_cost && (
            <span className="font-semibold text-slate-700">
              Estimated Cost: <strong className="text-cypress-800">{formatINR(ticket.estimated_cost)}</strong>
            </span>
          )}
        </div>
      </Card>

      {/* Description */}
      <Card className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Issue Description & Symptoms
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {ticket.description}
        </p>
      </Card>

      {/* 5-STAGE WORKFLOW ACTION PANEL */}
      <div className="mb-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Maintenance Lifecycle & Multi-Party Approvals
        </h3>

        {/* STAGE 1: CYPRESS ACKNOWLEDGMENT (Cypress Admin Action) */}
        {ticket.status === 'open' && (
          <Card className="border-indigo-200 bg-indigo-50/40 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">Step 1: Cypress Operations Acknowledgment</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Check whether this repair is covered under the property&apos;s service plan ({property?.plan_name || 'Plan'}), or requires Owner financial approval.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="planCoverage"
                        checked={ackPlanCovered}
                        onChange={() => setAckPlanCovered(true)}
                        className="text-cypress-600"
                      />
                      <span>Covered in Plan (Directly Dispatch Team)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="planCoverage"
                        checked={!ackPlanCovered}
                        onChange={() => setAckPlanCovered(false)}
                        className="text-cypress-600"
                      />
                      <span>Chargeable / Major Repair (Requires Owner Approval)</span>
                    </label>
                  </div>

                  {!ackPlanCovered && (
                    <div className="w-48">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Cost (₹)</label>
                      <input
                        type="number"
                        value={ackCost}
                        onChange={(e) => setAckCost(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-bold"
                      />
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      placeholder="Inspection remarks / dispatch note..."
                      value={ackNote}
                      onChange={(e) => setAckNote(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() =>
                        acknowledgeTicket(ticket.id, ackPlanCovered, ackPlanCovered ? undefined : Number(ackCost), ackNote)
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {ackPlanCovered ? 'Acknowledge & Dispatch Cypress Team' : 'Request Owner Approval for ₹' + ackCost}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STAGE 2: OWNER APPROVAL STEP */}
        {ticket.status === 'owner_approval_pending' && (
          <Card className="border-rose-200 bg-rose-50/40 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Step 2: Owner Financial Authorization Required</h4>
                  <span className="font-extrabold text-rose-800 text-sm">{formatINR(ticket.estimated_cost || 0)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  This work is categorized as a major/chargeable component replacement. The property owner must authorize before Cypress proceeds with vendor purchase and labor.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => ownerApproveTicket(ticket.id, true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-emerald-700"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> Approve Work (₹{ticket.estimated_cost})
                  </button>

                  <button
                    type="button"
                    onClick={() => ownerApproveTicket(ticket.id, false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" /> Decline / Suggest Alternative
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STAGE 3: IN PROGRESS / RESOLUTION (Cypress Admin Action) */}
        {(ticket.status === 'cypress_acknowledged' || ticket.status === 'in_progress') && (
          <Card className="border-sky-200 bg-sky-50/40 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">Step 3: Work Underway & Resolution</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Cypress technician is actively carrying out repair. Once finished, record resolution notes to notify the tenant for sign-off.
                </p>

                <div className="mt-3 space-y-3">
                  <textarea
                    rows={2}
                    value={resNote}
                    onChange={(e) => setResNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  />

                  <Button onClick={() => resolveTicket(ticket.id, resNote)}>
                    <Check className="h-4 w-4" /> Mark Work Resolved & Notify Tenant
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STAGE 4: TENANT ACKNOWLEDGMENT STEP */}
        {ticket.status === 'resolved' && (
          <Card className="border-emerald-200 bg-emerald-50/40 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <FileCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">Step 4: Tenant Verification & Acknowledgment</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  The Cypress team has marked this issue resolved. Tenant confirmation is required to close the ticket.
                </p>

                <div className="mt-4 flex gap-3">
                  <Button onClick={() => tenantAcknowledgeTicket(ticket.id)}>
                    <CheckCircle2 className="h-4 w-4" /> Confirm & Acknowledge Job Done
                  </Button>
                  <button
                    type="button"
                    onClick={() => alert('Re-check request dispatched to Cypress manager.')}
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Request Re-check
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* CLOSED TICKET STATUS */}
        {ticket.status === 'closed' && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>
              Ticket Closed: Maintenance work was verified and acknowledged by tenant. All records archived.
            </span>
          </div>
        )}
      </div>

      {/* Activity Timeline / History */}
      <Card>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Audit Trail & Communication History
        </h3>

        <div className="space-y-4">
          {(ticket.history || []).map((h, idx) => (
            <div key={h.id || idx} className="flex items-start gap-3 text-xs">
              <div className="mt-1 h-2 w-2 rounded-full bg-cypress-600 ring-4 ring-cypress-100 shrink-0" />
              <div className="flex-1 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold text-slate-800">{h.actor_name || 'System'}</span>
                  <span className="text-[10px]">{formatDate(h.created_at)}</span>
                </div>
                <p className="mt-1 text-slate-700">{h.note || `Status updated to ${h.to_status}`}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
