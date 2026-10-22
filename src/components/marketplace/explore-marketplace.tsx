'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, MapPin, Search } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { furnishingLabel, listPublicProperties, propertyTitle, propertyTypeLabel, visitURL, type PropertyFilters, type PublicPagination, type PublicProperty } from '@/lib/public-properties';
import { PropertyImage } from './property-image';
import findPropHero from '../../../public/brand/find-prop-hero.webp';

const initialFilters: PropertyFilters = { q: '', city: '', locality: '', bhk: '', min_rent: '', max_rent: '', furnishing: '', property_type: '', amenity: '', sort: 'newest' };
const inputStyle = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600';

const featuredLocalities = [
  'All Localities',
  'Whitefield',
  'Sarjapur Road',
  'HSR Layout',
  'Electronic City',
  'Bellandur',
  'Indiranagar',
  'Koramangala',
];

export function ExploreMarketplace() {
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [items, setItems] = useState<PublicProperty[]>([]);
  const [pagination, setPagination] = useState<PublicPagination>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setItems([]);
    setPagination(undefined);
    listPublicProperties(filters, page, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!result.pagination) throw new Error('Missing pagination');
      setItems(result.data);
      setPagination(result.pagination);
    }).catch(() => {
      if (!controller.signal.aborted) {
        setError('We couldn’t load rental homes. Please try again.');
      }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, page, retry]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.min_rent && draft.max_rent && Number(draft.min_rent) > Number(draft.max_rent)) {
      setValidation('Maximum rent must be at least the minimum rent.');
      return;
    }
    setValidation(''); setLoading(true); setFilters({ ...draft }); setPage(1);
  }

  function reset() { setDraft(initialFilters); setFilters({ ...initialFilters }); setPage(1); setValidation(''); setLoading(true); }
  function field(key: keyof PropertyFilters) {
    return { value: draft[key], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft((current) => ({ ...current, [key]: event.target.value })), className: inputStyle };
  }

  function selectLocalityPill(loc: string) {
    const val = loc === 'All Localities' ? '' : loc;
    setDraft((cur) => ({ ...cur, locality: val }));
    setFilters((cur) => ({ ...cur, locality: val }));
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* 2-column Hero section */}
      <header className="mb-10 grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <li><Link href="/" className="hover:text-teal-700 hover:underline">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href="/tenants/services" className="hover:text-teal-700 hover:underline">Tenants</Link></li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" className="font-semibold text-slate-700">Find a Property</li>
            </ol>
          </nav>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#0a2a66]">Rental homes in Bengaluru</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#0a2a66] sm:text-5xl">
            Find a Home <span className="block text-teal-700">That Fits Your Life.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Explore rental homes across Bengaluru with clear property details and a simple enquiry process. Browse only homes currently listed as vacant.
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
            <Image
              src={findPropHero}
              alt="Cozy modern living room interior in Bengaluru"
              className="h-64 w-full object-cover sm:h-72"
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>
      </header>

      {/* Locality Quick Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2" role="region" aria-label="Popular localities">
        <span className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-500">Popular:</span>
        {featuredLocalities.map((loc) => {
          const active = (loc === 'All Localities' && !draft.locality) || draft.locality.toLowerCase() === loc.toLowerCase();
          return (
            <button
              key={loc}
              type="button"
              onClick={() => selectLocalityPill(loc)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-teal-600 hover:bg-teal-50'
              }`}
            >
              {loc}
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <form onSubmit={submit} className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Search rental properties">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold sm:col-span-2">
            Search locality or apartment
            <input {...field('q')} maxLength={150} placeholder="Search by locality, city or apartment name…" type="search" />
          </label>
          <label className="text-sm font-semibold">
            City
            <input {...field('city')} maxLength={100} placeholder="e.g. Bengaluru" />
          </label>
          <label className="text-sm font-semibold">
            Locality
            <input {...field('locality')} maxLength={120} placeholder="e.g. Whitefield" />
          </label>
          <label className="text-sm font-semibold">
            Minimum rent (₹/month)
            <input {...field('min_rent')} type="number" min="0" step="1" placeholder="No minimum" />
          </label>
          <label className="text-sm font-semibold">
            Maximum rent (₹/month)
            <input {...field('max_rent')} type="number" min="1" step="1" placeholder="No maximum" />
          </label>
          <label className="text-sm font-semibold">
            BHK (exact)
            <select {...field('bhk')}>
              <option value="">Any BHK</option>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} BHK</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Furnishing
            <select {...field('furnishing')}>
              <option value="">Any furnishing</option>
              {['unfurnished', 'semi', 'full'].map((v) => <option key={v} value={v}>{furnishingLabel(v)}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Property type
            <select {...field('property_type')}>
              <option value="">Any property type</option>
              {['apartment', 'villa', 'independent_house'].map((v) => <option key={v} value={v}>{propertyTypeLabel(v)}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Amenity
            <input {...field('amenity')} maxLength={80} placeholder="e.g. Parking" />
          </label>
          <label className="text-sm font-semibold">
            Sort by
            <select {...field('sort')}>
              <option value="newest">Newest listings</option>
              <option value="rent_asc">Rent: low to high</option>
              <option value="rent_desc">Rent: high to low</option>
              <option value="bhk_asc">BHK: low to high</option>
            </select>
          </label>
          <div className="flex items-end gap-3 sm:col-span-2">
            <button type="submit" className="flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">
              <Search className="h-4 w-4" />Search Properties
            </button>
            <button type="button" onClick={reset} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Clear filters
            </button>
          </div>
        </div>
        {validation && <p role="alert" className="mt-3 text-sm text-red-700">{validation}</p>}
      </form>

      {/* Results grid */}
      <section aria-labelledby="available-title" aria-busy={loading}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <h2 id="available-title" className="text-2xl font-bold text-slate-900">Explore Available Properties</h2>
          {!loading && !error && pagination && (
            <p className="text-sm text-slate-500" role="status">
              {pagination.total_items} matching {pagination.total_items === 1 ? 'home' : 'homes'}
            </p>
          )}
        </div>

        {loading ? (
          <div role="status" className="rounded-2xl bg-slate-50 p-12 text-center text-slate-600">Loading available homes…</div>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p>{error}</p>
            <button type="button" onClick={() => setRetry((v) => v + 1)} className="mt-4 rounded-xl border border-red-300 px-4 py-2 font-semibold">Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 font-bold">No matching homes right now</h3>
            <p className="mt-2 text-sm text-slate-500">Try another locality or budget, or share your rental requirements with us.</p>
            <Link href="/tenant-inquiry" className="mt-5 inline-block font-semibold text-teal-700 underline">Submit Tenant Inquiry</Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, index) => (
              <article key={p.upid} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <Link href={`/explore/${encodeURIComponent(p.upid)}`} className="block h-52 overflow-hidden" aria-label={`View ${propertyTitle(p)}`}>
                  <PropertyImage src={p.cover_image_url} fallback={`/brand/prop-${(index % 6) + 1}.webp`} alt={propertyTitle(p)} />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-3 w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Available · Vacant
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                    <Link href={`/explore/${encodeURIComponent(p.upid)}`}>{propertyTitle(p)}</Link>
                  </h3>
                  <p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    {[p.locality, p.city].filter(Boolean).join(', ') || 'Location available on enquiry'}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    {p.bhk} BHK · {propertyTypeLabel(p.property_type)}{p.area_sqft ? ` · ${p.area_sqft} sq.ft` : ''}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{furnishingLabel(p.furnishing)}</p>
                  <p className="mt-4 text-xl font-bold text-[#0a2a66]">
                    {formatINR(p.monthly_rent)}<span className="text-xs font-normal text-slate-500"> / month</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Security deposit: {formatINR(p.deposit)}</p>
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-sm font-semibold">
                    <Link href={`/explore/${encodeURIComponent(p.upid)}`} className="flex-1 rounded-md border border-teal-600 px-3 py-2 text-center text-teal-700 hover:bg-teal-50">
                      View Details
                    </Link>
                    <Link href={visitURL(p.upid)} className="flex-1 rounded-md bg-teal-700 px-3 py-2 text-center text-white hover:bg-teal-800">
                      Schedule a Visit
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && pagination && pagination.total_pages > 1 && (
          <nav aria-label="Property result pages" className="mt-8 flex items-center justify-center gap-5">
            <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage(page - 1); }} className="rounded-xl border px-4 py-2 disabled:opacity-40">Previous</button>
            <span className="text-sm">Page {page} of {pagination.total_pages}</span>
            <button type="button" disabled={page >= pagination.total_pages} onClick={() => { setLoading(true); setPage(page + 1); }} className="rounded-xl border px-4 py-2 disabled:opacity-40">Next</button>
          </nav>
        )}
        <p className="mt-6 text-xs text-slate-500">Property availability, rent and deposit details are subject to confirmation. Exact addresses are shared during the enquiry process.</p>
      </section>

      {/* Bottom dual CTA */}
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl bg-teal-50 p-7">
          <h2 className="text-xl font-bold text-[#0a2a66]">Found a Home You Like?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">View the property details, submit an enquiry or schedule a visit. Cypress will coordinate the next steps based on availability.</p>
          <a href="#available-title" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">
            Explore Properties
          </a>
        </div>
        <aside className="rounded-2xl bg-sky-50 p-7">
          <h2 className="text-xl font-bold text-[#0a2a66]">Can’t Find the Right Home?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Share your preferred locality, budget and move-in date so our team can help when a suitable property becomes available.</p>
          <Link href="/tenant-inquiry" className="mt-4 inline-flex rounded-lg border border-teal-600 bg-white px-5 py-3 text-sm font-semibold text-[#0a2a66] hover:bg-teal-50">
            Submit Tenant Inquiry
          </Link>
        </aside>
      </div>
    </div>
  );
}