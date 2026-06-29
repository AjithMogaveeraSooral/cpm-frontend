'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Ticket } from '@/lib/types';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-cypress-100 text-cypress-700',
  closed: 'bg-slate-100 text-slate-600',
  escalated: 'bg-red-100 text-red-700',
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'text-slate-500',
  medium: 'text-amber-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
};

export default function TicketsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => api.get<Ticket[]>('/tickets', { query: { page: 1, page_size: 50 } }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Maintenance Tickets</h1>
        {data?.pagination && (
          <span className="text-sm text-slate-500">{data.pagination.total_items} total</span>
        )}
      </div>

      {isLoading && <p className="text-slate-500">Loading tickets…</p>}
      {error && <p className="text-red-600">Could not load tickets.</p>}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">SLA Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.data?.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{t.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-cypress-700">{t.property_upid}</td>
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
        {data?.data?.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-400">No tickets yet.</p>
        )}
      </Card>
    </div>
  );
}
