'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { History, UserPlus } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LocationPicker } from '@/components/ui/location-picker';
import { formatINR, formatDate } from '@/lib/utils';
import type { AdminUser, Property, Tenancy } from '@/lib/types';

const TENANCY_STATUS_STYLES: Record<string, string> = {
  active: 'bg-cypress-100 text-cypress-700',
  approved: 'bg-cypress-100 text-cypress-700',
  proposed: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  ended: 'bg-slate-100 text-slate-600',
};

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('cypress_admin', 'app_admin');

  const { data, isLoading, error } = useQuery({
    queryKey: ['property', params.id],
    queryFn: async () => (await api.get<Property>(`/properties/${params.id}`)).data,
    enabled: !!params.id,
  });

  // Owner directory (admin only) to resolve the owner's display name.
  const ownersQ = useQuery({
    queryKey: ['admin-users', 'owner'],
    queryFn: () => api.get<AdminUser[]>('/auth/users', { query: { role: 'owner' } }),
    enabled: isAdmin,
  });
  // Tenant directory (admin only) for the assign-tenant picker.
  const tenantsQ = useQuery({
    queryKey: ['admin-users', 'tenant'],
    queryFn: () => api.get<AdminUser[]>('/auth/users', { query: { role: 'tenant' } }),
    enabled: isAdmin,
  });
  // Tenancy history for this property (most recent first).
  const historyQ = useQuery({
    queryKey: ['tenancies', 'property', params.id],
    queryFn: () =>
      api.get<Tenancy[]>('/tenancies', { query: { property_id: params.id, page: 1, page_size: 50 } }),
    enabled: !!params.id,
  });

  const [tenantId, setTenantId] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignOk, setAssignOk] = useState(false);

  const assign = useMutation({
    mutationFn: async () =>
      api.post('/tenancies', {
        property_id: params.id,
        tenant_id: tenantId,
        rent_amount: Number(rent || data?.monthly_rent || 0),
        deposit_amount: deposit ? Number(deposit) : undefined,
        start_date: startDate || undefined,
      }),
    onSuccess: () => {
      setAssignError(null);
      setAssignOk(true);
      setTenantId('');
      setRent('');
      setDeposit('');
      setStartDate('');
      qc.invalidateQueries({ queryKey: ['property', params.id] });
      qc.invalidateQueries({ queryKey: ['tenancies'] });
      qc.invalidateQueries({ queryKey: ['tenancies', 'property', params.id] });
    },
    onError: (e) => {
      setAssignOk(false);
      setAssignError(e instanceof ApiError ? e.message : 'Could not assign tenant.');
    },
  });

  if (isLoading) return <p className="text-slate-500">Loading…</p>;
  if (error || !data) return <p className="text-red-600">Could not load property.</p>;

  const owner = ownersQ.data?.data?.find((o) => o.id === data.owner_id);
  const tenants = tenantsQ.data?.data ?? [];

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
          {isAdmin && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Owner</dt>
              <dd className="text-sm font-medium text-slate-900">
                {owner ? `${owner.full_name || owner.mobile} · ${owner.mobile}` : '—'}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {isAdmin && (
        <Card className="mt-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <UserPlus className="h-4 w-4" /> Assign tenant
          </h2>
          {data.occupancy_status === 'occupied' && (
            <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
              This property is currently occupied. Assigning a new tenant creates a proposed tenancy.
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="tenant" className="text-sm font-medium text-slate-700">
                Tenant
              </label>
              <select
                id="tenant"
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-soft focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/30"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                disabled={tenantsQ.isLoading}
              >
                <option value="">Select tenant…</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name || t.mobile} · {t.mobile}
                  </option>
                ))}
              </select>
              {!tenantsQ.isLoading && tenants.length === 0 && (
                <p className="text-xs text-amber-600">
                  No tenants yet. Create a tenant in Tenant Users first.
                </p>
              )}
            </div>
            <Input
              label="Monthly rent"
              type="number"
              placeholder={String(data.monthly_rent)}
              value={rent}
              onChange={(e) => setRent(e.target.value)}
            />
            <Input
              label="Deposit (optional)"
              type="number"
              placeholder="0"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
            />
            <Input
              label="Start date (optional)"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {assignError && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{assignError}</p>
          )}
          {assignOk && (
            <p className="mt-3 rounded-md bg-cypress-50 px-3 py-2 text-sm text-cypress-700">
              Tenancy proposed. Review it on the Tenancies screen.
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => assign.mutate()}
              disabled={!tenantId}
              loading={assign.isPending}
            >
              <UserPlus className="h-4 w-4" /> Assign tenant
            </Button>
          </div>
        </Card>
      )}

      {(data.address || data.landmark || data.pincode) && (
        <Card className="mt-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Address
          </h2>
          <div className="space-y-1 text-sm text-slate-700">
            {data.address && <p>{data.address}</p>}
            {data.landmark && <p className="text-slate-500">Landmark: {data.landmark}</p>}
            {data.pincode && <p className="text-slate-500">Pincode: {data.pincode}</p>}
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Location
        </h2>
        {data.latitude != null && data.longitude != null ? (
          <LocationPicker
            readOnly
            value={{
              lat: data.latitude,
              lng: data.longitude,
              address: data.address,
              placeId: data.google_place_id,
            }}
          />
        ) : (
          <p className="text-sm text-slate-500">No precise location set for this property.</p>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <History className="h-4 w-4" /> Tenant history
        </h2>
        {historyQ.isLoading ? (
          <p className="text-sm text-slate-500">Loading history…</p>
        ) : (historyQ.data?.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500">No tenants have been assigned to this property yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {historyQ.data?.data?.map((t) => {
              const tenant = tenants.find((u) => u.id === t.tenant_id);
              const name = tenant ? tenant.full_name || tenant.mobile : 'Tenant';
              return (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">
                      {t.start_date ? formatDate(t.start_date) : 'Start pending'}
                      {t.end_date ? ` – ${formatDate(t.end_date)}` : ' – ongoing'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-cypress-700">{formatINR(t.rent_amount)}/mo</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        TENANCY_STATUS_STYLES[t.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
