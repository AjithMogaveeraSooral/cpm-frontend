'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Home, MapPin, ShieldCheck, Sparkles, User, AlertTriangle, IndianRupee } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatINR, formatDate } from '@/lib/utils';
import type { Property } from '@/lib/types';

export default function PropertiesPage() {
  const { user } = useAuth();
  const {
    currentRole,
    properties,
    renewalAlerts,
    loadPropertiesFromApi,
    propertiesLoading,
    rentPayments,
    loadRentPayments,
  } = useDataStore();
  const [filterOccupancy, setFilterOccupancy] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');

  // Properties are sourced from the database on mount.
  useEffect(() => {
    loadPropertiesFromApi();
  }, [loadPropertiesFromApi]);

  // Rent payments (durable in IndexedDB) power the per-property rent payment date.
  useEffect(() => {
    loadRentPayments();
  }, [loadRentPayments]);

  // latestRentPaymentFor returns the most recent rent payment for a property, so
  // admins/owners can see when rent was last paid at a glance.
  const latestRentPaymentFor = (propertyId: string) =>
    rentPayments
      .filter((p) => p.property_id === propertyId && p.status !== 'rejected')
      .sort((a, b) => (a.payment_date < b.payment_date ? 1 : -1))[0];

  const isAdmin = currentRole === 'cypress_admin';
  const isOwner = currentRole === 'owner';
  const isTenant = currentRole === 'tenant';

  // Role-filtered view:
  // Admin sees all properties.
  // Owner sees only properties they own.
  // Tenant sees only the property they are the active tenant of.
  // Non-admins are never shown properties that aren't linked to them.
  const roleProperties = properties.filter((p) => {
    if (isAdmin) return true;
    if (!user) return false;
    if (isOwner) {
      return (
        p.owner_id === user.id ||
        (!!user.mobile && !!p.owner_phone?.includes(user.mobile)) ||
        (!!user.full_name && !!p.owner_name?.toLowerCase().includes(user.full_name.toLowerCase()))
      );
    }
    if (isTenant) {
      return (
        p.active_tenant_id === user.id ||
        (!!user.mobile && !!p.active_tenant_phone?.includes(user.mobile)) ||
        (!!user.full_name && !!p.active_tenant_name?.toLowerCase().includes(user.full_name.toLowerCase()))
      );
    }
    return false;
  });

  const filteredProperties = roleProperties.filter((p) => {
    if (filterOccupancy !== 'all' && p.occupancy_status !== filterOccupancy) return false;
    if (filterCity !== 'all' && p.city_id !== filterCity) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {isAdmin && 'All Managed Properties'}
            {isOwner && 'My Owned Properties & Portfolio'}
            {isTenant && 'My Rented Property'}
            <span className="inline-flex items-center gap-1 rounded-full border border-cypress-200 bg-cypress-50 px-2.5 py-0.5 text-xs font-semibold text-cypress-700">
              <ShieldCheck className="h-3 w-3 text-cypress-600" /> Plan & UPID Tracked
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin && 'Monitor occupancy, service plans, tenant assignments, and association maintenance across all units.'}
            {isOwner && 'Review agreements, tenant details, rent receipts, inventory checklists, and plan renewals.'}
            {isTenant && 'Access your rental agreement, plan maintenance coverage, inventory checklist, and receipts.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
          </span>
          {(isAdmin || isOwner) && (
            <Link href="/properties/new">
              <Button>
                <Plus className="h-4 w-4" /> Add Property
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          {['all', 'vacant', 'occupied'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterOccupancy(status)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition ${
                filterOccupancy === status
                  ? 'bg-cypress-gradient text-white shadow-soft'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'All Units' : status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-cypress-600" />
          <span className="font-semibold text-slate-700">Bengaluru</span> (Live Operations)
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredProperties.map((p) => {
          const alert = renewalAlerts.find((a) => a.property_id === p.id);
          const isVacant = p.occupancy_status === 'vacant';
          const latestPay = latestRentPaymentFor(p.id);

          return (
            <Link key={p.id} href={`/properties/${p.id}`}>
              <Card className="group h-full flex flex-col justify-between p-5 transition-all duration-200 hover:border-cypress-400 hover:shadow-card">
                <div>
                  {/* Top Bar: UPID & Occupancy */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cypress-700 tracking-tight">
                      {p.upid}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                        isVacant
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {p.occupancy_status}
                    </span>
                  </div>

                  {/* Title & Flat */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-cypress-800 transition-colors">
                    {p.bhk} BHK · {p.apartment_name || p.property_type}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Flat {p.flat_no} · {p.locality_name || 'Bengaluru'}
                  </p>

                  {/* Active Service Plan Badge */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-cypress-50 border border-cypress-200 px-2 py-0.5 text-[11px] font-bold text-cypress-800">
                      {p.plan_name || `${p.plan_tier?.toUpperCase()} Plan`}
                    </span>
                    {p.is_listed && isVacant && (
                      <span className="rounded-lg bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                        Listed on Marketplace
                      </span>
                    )}
                  </div>

                  {/* Renewal Warning Pill if expiring soon */}
                  {alert && (
                    <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2 py-1 text-[11px] font-bold text-amber-800">
                      <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                      <span>Plan expires in {alert.days_left} days</span>
                    </div>
                  )}

                  {/* Tenant / Owner Tag */}
                  <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Owner:</span>
                      <span className="font-semibold text-slate-900">{p.owner_name || 'Owner'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Active Tenant:</span>
                      <span className="font-semibold text-slate-900">
                        {p.active_tenant_name || <span className="text-amber-600 italic">No tenant assigned</span>}
                      </span>
                    </div>
                    {!isVacant && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3 text-cypress-600" /> Rent Paid:
                        </span>
                        {latestPay ? (
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            {formatDate(latestPay.payment_date)}
                            {latestPay.status === 'awaiting_verification' && (
                              <span className="rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold uppercase text-amber-700">
                                Unverified
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="italic text-amber-600">No payment yet</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Footer: Rent and Docs Count */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Rent</span>
                    <p className="text-lg font-extrabold text-cypress-800 leading-tight">
                      {formatINR(p.monthly_rent)}<span className="text-xs font-medium text-slate-400">/mo</span>
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <span>{p.documents?.length ?? 0} documents</span>
                    <p className="text-[10px] text-slate-400">{p.inventory?.length ?? 0} inventory items</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredProperties.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-300" />
          {propertiesLoading ? (
            <>
              <h3 className="mt-3 text-base font-bold text-slate-800">Loading properties…</h3>
              <p className="text-xs text-slate-500 mt-1">Fetching the latest records from the database.</p>
            </>
          ) : (
            <>
              <h3 className="mt-3 text-base font-bold text-slate-800">No properties found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your occupancy filter or add a new property.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
