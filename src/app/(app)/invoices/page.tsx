'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { formatINR, formatDate } from '@/lib/utils';

interface Invoice {
  id: string;
  invoice_no: string;
  property_upid: string;
  tenant_name: string;
  amount: number;
  status: string;
  due_date: string;
  paid_at?: string;
}

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-cypress-100 text-cypress-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function InvoicesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => api.get<Invoice[]>('/invoices', { query: { page: 1, page_size: 50 } }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
        {data?.pagination && (
          <span className="text-sm text-slate-500">{data.pagination.total_items} total</span>
        )}
      </div>

      {isLoading && <p className="text-slate-500">Loading invoices…</p>}
      {error && <p className="text-red-600">Could not load invoices.</p>}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Tenant</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.data?.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{inv.invoice_no}</td>
                <td className="px-4 py-3 font-mono text-xs text-cypress-700">{inv.property_upid}</td>
                <td className="px-4 py-3 text-slate-700">{inv.tenant_name}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{formatINR(inv.amount)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      STATUS_STYLES[inv.status] ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(inv.due_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.data?.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-400">No invoices yet.</p>
        )}
      </Card>
    </div>
  );
}
