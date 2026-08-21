'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, MessageCircle, Phone, Search, Sparkles } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
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

const NEXT_STATUS: Record<LeadStatus, { value: LeadStatus; label: string }[]> = {
  new: [
    { value: 'contacted', label: 'Mark contacted' },
    { value: 'closed', label: 'Close' },
  ],
  contacted: [
    { value: 'converted', label: 'Mark converted' },
    { value: 'closed', label: 'Close' },
  ],
  converted: [{ value: 'closed', label: 'Close' }],
  closed: [],
};

export default function LeadsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<LeadStatus | ''>('new');
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['leads', filter],
    queryFn: async () => api.get<Lead[]>('/leads', { query: filter ? { status: filter } : {} }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) =>
      api.patch(`/leads/${id}/status`, { status }),
    onSuccess: () => {
      setActionError(null);
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (e) => setActionError(e instanceof ApiError ? e.message : 'Could not update lead'),
  });

  const rawRows = data?.data ?? [];

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

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Property Enquiries & Owner Interest
            <span className="inline-flex items-center gap-1 rounded-full border border-cypress-200 bg-cypress-50 px-2.5 py-0.5 text-xs font-semibold text-cypress-700">
              <Sparkles className="h-3 w-3 text-cypress-600" /> Offline Contact Desk
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Prospect submissions from Contact Us & Property Owner Onboarding requests.
          </p>
        </div>
        {data?.pagination && <span className="text-sm text-slate-500">{data.pagination.total_items} total</span>}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value || 'all'}
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === f.value
                  ? 'bg-cypress-600 text-white shadow-sm'
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
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
          />
        </div>
      </div>

      {actionError && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p>}
      {isLoading && <p className="text-slate-500">Loading enquiries…</p>}
      {error && <p className="text-red-600">Could not load enquiries.</p>}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Prospect Name</th>
                <th className="px-4 py-3">Offline Contact Channels</th>
                <th className="px-4 py-3">Interest & Property Details</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Offline Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((l) => {
                const cleanPhone = l.phone.replace(/[^0-9]/g, '');
                const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const isOwnerInterest = l.message?.includes('[Property Owner Interest]');

                return (
                  <tr key={l.id} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{l.name}</div>
                      {isOwnerInterest ? (
                        <span className="mt-1 inline-block rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Property Owner
                        </span>
                      ) : (
                        <span className="mt-1 inline-block rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
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
                            `Hello ${l.name}, this is Cypress Property Management reaching out regarding your interest.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline pt-0.5"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Chat on WhatsApp
                        </a>
                      </div>
                    </td>

                    <td className="max-w-[22rem] px-4 py-3">
                      <div className="rounded-lg bg-slate-50/90 p-2.5 border border-slate-100 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                        {l.message || 'No description provided.'}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(l.created_at)}</td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize shadow-soft ${
                          STATUS_STYLES[l.status]
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {NEXT_STATUS[l.status].map((opt) => (
                          <button
                            key={opt.value}
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ id: l.id, status: opt.value })}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-soft transition hover:border-cypress-300 hover:bg-cypress-50 hover:text-cypress-700 disabled:opacity-50"
                          >
                            {opt.label}
                          </button>
                        ))}
                        {NEXT_STATUS[l.status].length === 0 && (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && rows.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-400">No interest submissions found matching criteria.</p>
        )}
      </Card>
    </div>
  );
}

