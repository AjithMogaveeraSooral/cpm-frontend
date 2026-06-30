'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  CheckCircle2,
  FileClock,
  Home,
  LifeBuoy,
  Receipt,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { StatCard } from '@/components/ui/card';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import type { DashboardSummary } from '@/lib/types';

type Accent = 'cypress' | 'gold' | 'amber' | 'sky' | 'rose';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['report-summary'],
    queryFn: async () => (await api.get<DashboardSummary>('/reports/summary')).data,
  });

  const stats: {
    label: string;
    value: number;
    hint?: string;
    icon: typeof Building2;
    accent: Accent;
  }[] = data
    ? [
        { label: 'Total properties', value: data.properties.total, hint: `${data.properties.listed} listed`, icon: Building2, accent: 'cypress' },
        { label: 'Occupied', value: data.properties.occupied, icon: Home, accent: 'sky' },
        { label: 'Active tenancies', value: data.tenancies.active, hint: `${data.tenancies.proposed} proposed`, icon: Users, accent: 'cypress' },
        { label: 'Open tickets', value: data.tickets.open, hint: `${data.tickets.overdue} overdue`, icon: LifeBuoy, accent: 'amber' },
        { label: 'Escalated tickets', value: data.tickets.escalated, icon: TrendingUp, accent: 'rose' },
        { label: 'Rent to verify', value: data.rent_to_verify, icon: Receipt, accent: 'gold' },
        { label: 'New leads', value: data.new_leads, icon: FileClock, accent: 'sky' },
        { label: 'Active vouchers', value: data.active_vouchers, icon: Sparkles, accent: 'gold' },
      ]
    : [];

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">A live snapshot of your portfolio and operations.</p>
        </div>
        {data && (
          <span className="hidden items-center gap-2 rounded-full border border-cypress-100 bg-cypress-50 px-3 py-1.5 text-xs font-medium text-cypress-700 sm:inline-flex">
            <CheckCircle2 className="h-3.5 w-3.5" /> All systems operational
          </span>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-premium p-5">
              <div className="skeleton mb-3 h-4 w-24" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load dashboard metrics.
        </div>
      )}

      {data && (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <StatCard label={s.label} value={s.value} hint={s.hint} icon={s.icon} accent={s.accent} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
