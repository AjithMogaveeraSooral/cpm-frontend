'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, Phone, Search, Sparkles, Building2, Check, ArrowRight, X } from 'lucide-react';
import { useDataStore, SERVICE_PLANS } from '@/lib/data-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatINR } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/lib/types';

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-sky-100 text-sky-700',
  contacted: 'bg-amber-100 text-amber-700',
  converted: 'bg-cypress-100 text-cypress-700',
  closed: 'bg-slate-200 text-slate-600',
};

const FILTERS: { value: LeadStatus | ''; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
  { value: '', label: 'All' },
];

export default function LeadsPage() {
  const { leads, updateLeadStatus, convertLeadToProperty } = useDataStore();
  const [filter, setFilter] = useState<LeadStatus | ''>('new');
  const [search, setSearch] = useState('');

  // Conversion Modal State
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [selectedPlanTier, setSelectedPlanTier] = useState<'bronze' | 'silver' | 'gold'>('silver');
  const [flatNo, setFlatNo] = useState('Flat B-302');
  const [rent, setRent] = useState('35000');
  const [deposit, setDeposit] = useState('200000');
  const [convertedResult, setConvertedResult] = useState<{ upid: string; id: string } | null>(null);

  const rawRows = leads.filter((l) => (filter ? l.status === filter : true));

  const rows = rawRows.filter((l) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(term) ||
      l.phone.toLowerCase().includes(term) ||
      (l.email && l.email.toLowerCase().includes(term)) ||
      (l.message && l.message.toLowerCase().includes(term))
    );
  });

  const handleOpenConvert = (lead: Lead) => {
    setConvertingLead(lead);
    setConvertedResult(null);
    setSelectedPlanTier('silver');
    setFlatNo('Flat 502');
    setRent('38000');
    setDeposit('200000');
  };

  const handleExecuteConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;

    const newProp = convertLeadToProperty(
      convertingLead.id,
      selectedPlanTier,
      flatNo,
      Number(rent),
      Number(deposit)
    );

    setConvertedResult({ upid: newProp.upid, id: newProp.id });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Property Enquiries & Lead Desk
            <span className="inline-flex items-center gap-1 rounded-full border border-cypress-200 bg-cypress-50 px-2.5 py-0.5 text-xs font-semibold text-cypress-700">
              <Sparkles className="h-3 w-3 text-cypress-600" /> Plan Conversion Ready
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track inquiries from prospects and 1-click convert owner leads into onboarded properties with service plans.
          </p>
        </div>
        <span className="text-sm font-semibold text-slate-500">{rows.length} submissions</span>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value || 'all'}
              onClick={() => setFilter(f.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.value
                  ? 'bg-cypress-gradient text-white shadow-soft'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, details..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-cypress-500 focus:outline-none"
          />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Prospect Name</th>
                <th className="px-4 py-3">Contact Channels</th>
                <th className="px-4 py-3">Requirements / Property Message</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions & Plan Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((l) => {
                const cleanPhone = l.phone.replace(/[^0-9]/g, '');
                const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const isOwnerInterest = l.message?.includes('[Property Owner Interest]');

                return (
                  <tr key={l.id} className="align-top hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{l.name}</div>
                      {isOwnerInterest ? (
                        <span className="mt-1 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                          Property Owner Lead
                        </span>
                      ) : (
                        <span className="mt-1 inline-block rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          General Prospect
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <a
                          href={`tel:${l.phone}`}
                          className="flex items-center gap-1.5 font-mono text-xs text-slate-700 hover:text-cypress-700 font-medium"
                        >
                          <Phone className="h-3.5 w-3.5 text-cypress-600" />
                          {l.phone}
                        </a>
                        {l.email && (
                          <a
                            href={`mailto:${l.email}`}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cypress-700"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {l.email}
                          </a>
                        )}
                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                            `Hello ${l.name}, this is Cypress Property Management contacting you regarding your property requirement.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp Chat
                        </a>
                      </div>
                    </td>

                    <td className="max-w-[20rem] px-4 py-3">
                      <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {l.message || 'No details provided.'}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(l.created_at)}</td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[l.status]}`}>
                        {l.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {/* 1-Click Convert to Property & Plan */}
                        {l.status !== 'converted' && (
                          <button
                            type="button"
                            onClick={() => handleOpenConvert(l)}
                            className="inline-flex items-center gap-1 rounded-lg bg-cypress-gradient px-2.5 py-1 text-xs font-bold text-white shadow-soft hover:opacity-95"
                          >
                            <Building2 className="h-3 w-3" />
                            Convert to Property & Plan
                          </button>
                        )}

                        {/* Quick Mark Contacted */}
                        {l.status === 'new' && (
                          <button
                            type="button"
                            onClick={() => updateLeadStatus(l.id, 'contacted')}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Mark Contacted
                          </button>
                        )}

                        {/* Quick Close */}
                        {l.status !== 'closed' && (
                          <button
                            type="button"
                            onClick={() => updateLeadStatus(l.id, 'closed')}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
                          >
                            Close
                          </button>
                        )}

                        {l.status === 'converted' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <Check className="h-3.5 w-3.5" /> Onboarded & Active
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-400">No submissions matching filter.</p>
        )}
      </Card>

      {/* Plan Conversion Modal */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cypress-gradient text-white">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Convert Lead into Onboarded Property</h3>
                  <p className="text-xs text-slate-500">
                    Lead: {convertingLead.name} ({convertingLead.phone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConvertingLead(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!convertedResult ? (
              <form onSubmit={handleExecuteConvert} className="mt-4 space-y-4">
                <div className="rounded-xl bg-cypress-50/70 p-3 border border-cypress-100 text-xs text-cypress-900">
                  <p className="font-semibold">Automated Plan Onboarding Workflow:</p>
                  <p className="text-[11px] text-cypress-700 mt-0.5">
                    Upon conversion, this property is assigned a Unique Property ID (UPID), marked with initial <strong>Vacant</strong> status, listed on the marketplace, and tagged with owner legal agreements.
                  </p>
                </div>

                {/* Service Plan Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Management Service Plan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SERVICE_PLANS.map((plan) => (
                      <button
                        key={plan.tier}
                        type="button"
                        onClick={() => setSelectedPlanTier(plan.tier as any)}
                        className={`rounded-xl border p-2.5 text-left transition-all ${
                          selectedPlanTier === plan.tier
                            ? 'border-cypress-600 bg-cypress-50/60 ring-2 ring-cypress-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-xs font-bold text-slate-900">{plan.name}</span>
                        <span className="block text-[11px] font-extrabold text-cypress-700 mt-0.5">
                          {plan.commission_pct}% commission
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-1">{plan.sla_hours}h SLA</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Flat / Unit Number</label>
                    <input
                      type="text"
                      required
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Rent (₹/mo)</label>
                    <input
                      type="number"
                      required
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Security Deposit (₹)</label>
                    <input
                      type="number"
                      required
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="secondary" onClick={() => setConvertingLead(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Building2 className="h-4 w-4" /> Convert & Onboard Property
                  </Button>
                </div>
              </form>
            ) : (
              <div className="my-4 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Property Successfully Onboarded!</h4>
                <p className="font-mono text-sm font-bold text-cypress-700 bg-cypress-50 py-1.5 px-3 rounded-lg border border-cypress-200 inline-block">
                  {convertedResult.upid}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Assigned plan: <strong>{selectedPlanTier.toUpperCase()}</strong>. The property is currently <strong>Vacant</strong> and actively displayed on the rental marketplace.
                </p>

                <div className="pt-3 flex justify-center gap-3">
                  <Link href={`/properties/${convertedResult.id}`}>
                    <Button>
                      View Property Details <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  <Button variant="secondary" onClick={() => setConvertingLead(null)}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
