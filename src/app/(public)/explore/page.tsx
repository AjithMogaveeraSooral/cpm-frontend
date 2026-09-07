'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BedDouble, MapPin, Sparkles, Building2, BellRing, Check, ShieldCheck, Filter } from 'lucide-react';
import { useDataStore, CITIES_MASTER } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { InterestModal } from './interest-modal';

export default function ExplorePage() {
  const { properties } = useDataStore();
  const [selectedCityId, setSelectedCityId] = useState<string>('city-blr');
  const [bhkFilter, setBhkFilter] = useState<string>('all');
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [interestTarget, setInterestTarget] = useState<{ upid?: string; label?: string }>({});
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  const selectedCity = CITIES_MASTER.find((c) => c.id === selectedCityId) || CITIES_MASTER[0];
  const isCityComingSoon = selectedCity.status === 'coming_soon';

  // Properties that are vacant and marked as listed on the marketplace
  const listedProperties = properties.filter((p) => {
    // Show vacant properties (or listed) in active city
    if (bhkFilter !== 'all' && String(p.bhk) !== bhkFilter) return false;
    return p.is_listed || p.occupancy_status === 'vacant';
  });

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    setNotifySuccess(true);
    setTimeout(() => {
      setNotifySuccess(false);
      setNotifyEmail('');
    }, 3000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-cypress-50 border border-cypress-200 px-3 py-1 text-xs font-bold text-cypress-800 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cypress-600" /> Verified Vacant Units Only · Direct from Cypress
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Rental Homes
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse verified, managed rental properties with transparent pricing and zero brokerage hassle.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            setInterestTarget({ label: 'General City Inquiry' });
            setInterestModalOpen(true);
          }}
        >
          Enquire for Custom Search
        </Button>
      </div>

      {/* City Switcher Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-cypress-600" /> Select City:
        </span>

        {CITIES_MASTER.map((city) => {
          const isSelected = city.id === selectedCityId;
          const isLive = city.status === 'active';

          return (
            <button
              key={city.id}
              type="button"
              onClick={() => setSelectedCityId(city.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-cypress-gradient text-white shadow-soft ring-2 ring-cypress-500/20'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{city.name}</span>
              {isLive ? (
                <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold uppercase ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Live
                </span>
              ) : (
                <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold uppercase ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                }`}>
                  Coming Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* If City is LIVE (Bengaluru) */}
      {!isCityComingSoon && (
        <>
          {/* Sub-filter by BHK */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filter BHK:
              </span>
              {['all', '1', '2', '3'].map((bhk) => (
                <button
                  key={bhk}
                  type="button"
                  onClick={() => setBhkFilter(bhk)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    bhkFilter === bhk
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {bhk === 'all' ? 'All' : `${bhk} BHK`}
                </button>
              ))}
            </div>

            <span className="text-xs font-semibold text-slate-500">
              Showing {listedProperties.length} available {listedProperties.length === 1 ? 'property' : 'properties'} in Bengaluru
            </span>
          </div>

          {/* Properties Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listedProperties.map((p) => {
              const coverImg = p.media_photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';

              return (
                <div
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-card hover:border-cypress-300"
                >
                  {/* Photo Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={coverImg}
                      alt={p.flat_no}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="rounded-lg bg-slate-900/80 backdrop-blur-md px-2.5 py-1 font-mono text-[11px] font-bold text-white shadow-sm">
                        {p.upid}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase shadow-sm">
                        Vacant · Ready to Move
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="capitalize font-semibold text-cypress-700">
                        {p.bhk} BHK · {p.furnishing} furnished
                      </span>
                      <span>{p.area_sqft || 1400} sq.ft</span>
                    </div>

                    <h3 className="mt-1.5 text-base font-bold text-slate-900 group-hover:text-cypress-800 transition-colors">
                      {p.apartment_name || p.property_type} · Flat {p.flat_no}
                    </h3>

                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 line-clamp-1">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      {p.address}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Rent</span>
                        <p className="text-xl font-extrabold text-cypress-800 leading-tight">
                          {formatINR(p.monthly_rent)}<span className="text-xs font-normal text-slate-400">/mo</span>
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          setInterestTarget({ upid: p.upid, label: `${p.bhk} BHK at ${p.apartment_name} (${p.upid})` });
                          setInterestModalOpen(true);
                        }}
                      >
                        Enquire / Visit
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {listedProperties.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-800">No matching vacant units</h3>
              <p className="text-xs text-slate-500 mt-1">
                All managed properties in this filter are currently occupied. Contact us to get alerted on upcoming vacancies.
              </p>
            </div>
          )}
        </>
      )}

      {/* If City is COMING SOON (Hosur or Chennai) */}
      {isCityComingSoon && (
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-cypress-950 p-8 sm:p-12 text-white shadow-xl text-center max-w-3xl mx-auto my-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-8 ring-amber-500/10 mb-5">
            <Sparkles className="h-7 w-7" />
          </div>

          <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-extrabold uppercase text-amber-300 tracking-wider">
            Launching Soon in {selectedCity.name}
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-4">
            Cypress Property Management is Expanding to {selectedCity.name}!
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            {selectedCity.description}
          </p>

          <div className="mt-8 rounded-2xl bg-white/10 backdrop-blur-md p-6 border border-white/15 max-w-lg mx-auto">
            <h3 className="text-sm font-bold text-white mb-1">
              Be the First to Know — Pre-Register for {selectedCity.name}
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Get zero-brokerage alerts and early-bird owner onboarding management waivers.
            </p>

            {notifySuccess ? (
              <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-3 text-xs font-bold text-emerald-200 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> Thank you! You will be notified the day we launch in {selectedCity.name}.
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter your phone or email..."
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="flex-1 rounded-xl border border-white/20 bg-white/15 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cypress-400"
                />
                <Button type="submit">
                  <BellRing className="h-4 w-4" /> Pre-Register
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Interest / Visit Modal */}
      <InterestModal
        open={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        propertyUpid={interestTarget.upid}
        propertyLabel={interestTarget.label}
      />
    </div>
  );
}
