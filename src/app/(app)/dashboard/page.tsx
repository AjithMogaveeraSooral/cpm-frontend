'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { StatCard } from '@/components/ui/card';
import type { DashboardSummary } from '@/lib/types';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['report-summary'],
    queryFn: async () => (await api.get<DashboardSummary>('/reports/summary')).data,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Dashboard</h1>

      {isLoading && <p className="text-slate-500">Loading metrics…</p>}
      {error && <p className="text-red-600">Could not load dashboard metrics.</p>}

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total properties" value={data.properties.total} hint={`${data.properties.listed} listed`} />
          <StatCard label="Occupied" value={data.properties.occupied} />
          <StatCard label="Active tenancies" value={data.tenancies.active} hint={`${data.tenancies.proposed} proposed`} />
          <StatCard label="Open tickets" value={data.tickets.open} hint={`${data.tickets.overdue} overdue`} />
          <StatCard label="Escalated tickets" value={data.tickets.escalated} />
          <StatCard label="Rent to verify" value={data.rent_to_verify} />
          <StatCard label="New leads" value={data.new_leads} />
          <StatCard label="Active vouchers" value={data.active_vouchers} />
        </div>
      )}
    </div>
  );
}
