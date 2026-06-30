'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Property, Ticket } from '@/lib/types';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-cypress-100 text-cypress-700',
  closed: 'bg-slate-100 text-slate-600',
  rejected: 'bg-slate-200 text-slate-600',
  escalated: 'bg-red-100 text-red-700',
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'text-slate-500',
  medium: 'text-amber-600',
  high: 'text-orange-600',
  emergency: 'text-red-600',
};

const STATUS_FILTERS = ['', 'open', 'assigned', 'in_progress', 'resolved', 'closed', 'escalated'];

export default function TicketsPage() {
  const [propertyId, setPropertyId] = useState('');
  const [status, setStatus] = useState('');

  const propertiesQ = useQuery({
    queryKey: ['properties', 'for-tickets'],
    queryFn: () => api.get<Property[]>('/properties', { query: { page: 1, page_size: 100 } }),
  });
  const properties = useMemo(() => propertiesQ.data?.data ?? [], [propertiesQ.data]);

  // The selected property's UPID drives the (UPID-scoped) ticket listing.
  const upid = useMemo(
    () => properties.find((p) => p.id === propertyId)?.upid ?? '',
    [properties, propertyId],
  );

  const ticketsQ = useQuery({
    queryKey: ['tickets', upid, status],
    queryFn: () =>
      api.get<Ticket[]>('/tickets', {
        query: { upid, status, page: 1, page_size: 50 },
      }),
    enabled: !!upid,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Maintenance Tickets</h1>
        <Link href="/tickets/new">
          <Button>
            <Plus className="h-4 w-4" /> Raise ticket
          </Button>
        </Link>
      </div>

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Property</label>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cypress-500 focus:outline-none focus:ring-1 focus:ring-cypress-500"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              <option value="">Select a property…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.upid} · {p.bhk} BHK {p.flat_no}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cypress-500 focus:outline-none focus:ring-1 focus:ring-cypress-500 disabled:bg-slate-50 disabled:text-slate-400"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!upid}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === '' ? 'All statuses' : s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {!upid && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-slate-500">
          Select a property to view its maintenance tickets.
        </p>
      )}

      {upid && ticketsQ.isLoading && <p className="text-slate-500">Loading tickets…</p>}
      {upid && ticketsQ.error && <p className="text-red-600">Could not load tickets.</p>}

      {upid && !ticketsQ.isLoading && !ticketsQ.error && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SLA Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ticketsQ.data?.data?.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link href={`/tickets/${t.id}`} className="hover:text-cypress-700">
                      {t.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{t.category}</td>
                  <td className={`px-4 py-3 font-medium capitalize ${PRIORITY_STYLES[t.priority] ?? ''}`}>
                    {t.priority}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_STYLES[t.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(t.sla_due_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ticketsQ.data?.data?.length === 0 && (
            <p className="px-4 py-8 text-center text-slate-400">No tickets for this property yet.</p>
          )}
        </Card>
      )}
    </div>
  );
}
