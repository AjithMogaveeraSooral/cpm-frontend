'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { formatINR, formatDate } from '@/lib/utils';

interface Tenancy {
  id: string;
  property_upid: string;
  tenant_name: string;
  monthly_rent: number;
  deposit: number;
  status: string;
  start_date: string;
  end_date?: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-cypress-100 text-cypress-700',
  proposed: 'bg-amber-100 text-amber-700',
  terminated: 'bg-slate-100 text-slate-600',
  expired: 'bg-red-100 text-red-700',
};

export default function TenanciesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tenancies'],
    queryFn: async () => api.get<Tenancy[]>('/tenancies', { query: { page: 1, page_size: 50 } }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Tenancies</h1>
        {data?.pagination && (
          <span className="text-sm text-slate-500">{data.pagination.total_items} total</span>
        )}
      </div>

      {isLoading && <p className="text-slate-500">Loading tenancies…</p>}
      {error && <p className="text-red-600">Could not load tenancies.</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data?.data?.map((t) => (
          <Card key={t.id}>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs text-cypress-700">{t.property_upid}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  STATUS_STYLES[t.status] ?? 'bg-slate-100 text-slate-600'
                }`}
              >
                {t.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{t.tenant_name}</h3>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-cypress-700">{formatINR(t.monthly_rent)}/mo</span>
              <span className="text-slate-500">Deposit {formatINR(t.deposit)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {formatDate(t.start_date)}
              {t.end_date ? ` – ${formatDate(t.end_date)}` : ' – ongoing'}
            </p>
          </Card>
        ))}
      </div>
      {data?.data?.length === 0 && <p className="text-slate-400">No tenancies yet.</p>}
    </div>
  );
}
