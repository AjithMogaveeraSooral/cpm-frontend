'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatINR } from '@/lib/utils';
import type { Property } from '@/lib/types';

export default function PropertiesPage() {
  const { hasRole } = useAuth();
  const canAdd = hasRole('owner', 'cypress_admin', 'app_admin');
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await api.get<Property[]>('/properties', { query: { page: 1, page_size: 50 } });
      return res;
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Properties</h1>
        <div className="flex items-center gap-4">
          {data?.pagination && (
            <span className="text-sm text-slate-500">{data.pagination.total_items} total</span>
          )}
          {canAdd && (
            <Link href="/properties/new">
              <Button>
                <Plus className="h-4 w-4" /> Add property
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isLoading && <p className="text-slate-500">Loading properties…</p>}
      {error && <p className="text-red-600">Could not load properties.</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.data?.map((p) => (
          <Link key={p.id} href={`/properties/${p.id}`}>
            <Card className="h-full transition hover:border-cypress-300 hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-xs text-cypress-700">{p.upid}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-600">
                  {p.occupancy_status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {p.bhk} BHK · {p.property_type}
              </h3>
              <p className="text-sm text-slate-500">Flat {p.flat_no}</p>
              <p className="mt-3 text-xl font-semibold text-cypress-700">{formatINR(p.monthly_rent)}/mo</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
