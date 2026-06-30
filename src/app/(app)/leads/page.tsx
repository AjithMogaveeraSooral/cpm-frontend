'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone } from 'lucide-react';
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

// The funnel transition a lead can move to next.
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

  const rows = data?.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Property Enquiries</h1>
          <p className="mt-1 text-sm text-slate-500">Interest submitted by prospects from the public website.</p>
        </div>
        {data?.pagination && <span className="text-sm text-slate-500">{data.pagination.total_items} total</span>}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === f.value
                ? 'bg-cypress-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {actionError && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p>}
      {isLoading && <p className="text-slate-500">Loading enquiries…</p>}
      {error && <p className="text-red-600">Could not load enquiries.</p>}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Prospect</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((l) => (
              <tr key={l.id} className="align-top hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{l.name}</td>
                <td className="px-4 py-3">
                  <a
                    href={`tel:${l.phone}`}
                    className="flex items-center gap-1.5 font-mono text-xs text-slate-700 hover:text-cypress-700"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {l.phone}
                  </a>
                  {l.email && (
                    <a
                      href={`mailto:${l.email}`}
                      className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 hover:text-cypress-700"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {l.email}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{l.property_upid || '—'}</td>
                <td className="max-w-[18rem] px-4 py-3 text-slate-600">{l.message || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(l.created_at)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[l.status]}`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {NEXT_STATUS[l.status].map((opt) => (
                      <button
                        key={opt.value}
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ id: l.id, status: opt.value })}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-cypress-300 hover:bg-cypress-50 hover:text-cypress-700 disabled:opacity-50"
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
            ))}
          </tbody>
        </table>
        {!isLoading && rows.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-400">No enquiries to show.</p>
        )}
      </Card>
    </div>
  );
}
