'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { formatINR, formatDate } from '@/lib/utils';
import type { Property } from '@/lib/types';

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['property', params.id],
    queryFn: async () => (await api.get<Property>(`/properties/${params.id}`)).data,
    enabled: !!params.id,
  });

  if (isLoading) return <p className="text-slate-500">Loading…</p>;
  if (error || !data) return <p className="text-red-600">Could not load property.</p>;

  const fields: Array<[string, string | number]> = [
    ['UPID', data.upid],
    ['Type', `${data.bhk} BHK · ${data.property_type}`],
    ['Flat', data.flat_no],
    ['Furnishing', data.furnishing],
    ['Monthly rent', formatINR(data.monthly_rent)],
    ['Deposit', formatINR(data.deposit)],
    ['Occupancy', data.occupancy_status],
    ['Listed', data.is_listed ? 'Yes' : 'No'],
    ['Registered', formatDate(data.created_at)],
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Property {data.upid}</h1>
      <p className="mb-6 text-sm text-slate-500">Version {data.version}</p>
      <Card>
        <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
          {fields.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wide text-slate-400">{k}</dt>
              <dd className="text-sm font-medium capitalize text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
