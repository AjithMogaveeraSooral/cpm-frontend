'use client';

import { useEffect, useState } from 'react';
import { BedDouble, MapPin } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import type { PublicProperty } from '@/lib/types';
import { InterestModal } from './interest-modal';

function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

interface InterestTarget {
  upid?: string;
  label?: string;
}

export default function ExplorePage() {
  const [items, setItems] = useState<PublicProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interest, setInterest] = useState<InterestTarget | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get<PublicProperty[]>('/public/properties', {
          auth: false,
          query: { page_size: 24 },
        });
        if (active) setItems(data ?? []);
      } catch (e) {
        if (active) setError(e instanceof ApiError ? e.message : 'Could not load properties');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Available properties</h1>
          <p className="mt-2 text-slate-600">
            Browse homes listed on Cypress. Found something you like? Share your interest — no account needed.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setInterest({})}>
          Enquire now
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-cypress-500 border-t-transparent" />
        </div>
      )}

      {error && !loading && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500">
          No properties are listed right now. Please check back soon.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => {
          const label = `${p.bhk} BHK ${p.property_type.replace('_', ' ')}${
            p.locality || p.city ? ` in ${[p.locality, p.city].filter(Boolean).join(', ')}` : ''
          }`;
          return (
            <div
              key={p.upid}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex h-40 items-center justify-center bg-cypress-50 text-cypress-300">
                <BedDouble className="h-12 w-12" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-cypress-50 px-2.5 py-0.5 text-xs font-medium capitalize text-cypress-700">
                    {p.property_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-slate-400">{p.occupancy_status}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  {p.bhk} BHK · {p.furnishing.replace('_', ' ')}
                </h3>
                {(p.locality || p.city) && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {[p.locality, p.city].filter(Boolean).join(', ')}
                  </p>
                )}
                <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-4">
                  <span className="text-xl font-bold text-slate-900">{formatINR(p.monthly_rent)}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                {p.deposit > 0 && <p className="mt-1 text-xs text-slate-500">Deposit {formatINR(p.deposit)}</p>}
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setInterest({ upid: p.upid, label })}
                >
                  Show interest
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <InterestModal
        open={interest !== null}
        onClose={() => setInterest(null)}
        propertyUpid={interest?.upid}
        propertyLabel={interest?.label}
      />
    </div>
  );
}

