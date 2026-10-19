'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ownerFaqs, tenantFaqs } from '@/lib/site-content';
import { propertyTitle, furnishingLabel, type PublicProperty } from '@/lib/public-properties';

export function SiteSearch() {
  const params = useSearchParams();
  const query = (params.get('q') ?? '').trim().slice(0, 150);
  const requestedPage = Number(params.get('page') ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 10000) : 1;
  const properties = useQuery({
    queryKey: ['public-site-search', query, page],
    queryFn: async ({ signal }) => {
      const response = await api.get<PublicProperty[]>('/public/properties', { auth: false, query: { q: query, page, page_size: 6 }, signal });
      if (!Array.isArray(response.data) || !response.pagination) throw new Error('Invalid search response');
      return response;
    },
    enabled: !!query,
    retry: false,
  });
  const faqResults = [
    ...ownerFaqs.map((faq) => ({ ...faq, audience: 'Owner', href: '/owners/faqs' })),
    ...tenantFaqs.map((faq) => ({ ...faq, audience: 'Tenant', href: '/tenants/faqs' })),
  ].filter((faq) => query && `${faq.question} ${faq.answer}`.toLowerCase().includes(query.toLowerCase()));
  const pagination = properties.data?.pagination;
  const pageHref = (next: number) => `/search?${new URLSearchParams({ q: query, page: String(next) })}`;

  return <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Search Cypress</h1>
    <p className="mt-3 text-slate-600">Find rental properties and answers to owner and tenant questions. Search by locality, property name or a topic such as maintenance.</p>
    <form action="/search" method="get" role="search" className="mt-6 flex flex-wrap items-end gap-3">
      <label className="grid flex-1 gap-2 text-sm font-semibold text-slate-700">Search properties and FAQs<input key={query} type="search" name="q" defaultValue={query} required maxLength={150} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal" /></label>
      <button type="submit" className="rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white">Search</button>
    </form>
    {!query ? <p className="mt-8 rounded-xl bg-slate-50 p-6 text-slate-600">Enter a search term to see results. Avoid entering personal contact information.</p> : <>
      <section className="mt-10" aria-labelledby="property-search-heading">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="property-search-heading" className="text-2xl font-bold text-slate-900">Available properties</h2><Link className="text-sm font-semibold text-teal-700 underline" href={`/tenants/find-property?${new URLSearchParams({ q: query })}`}>Use all property filters</Link></div>
        {properties.isPending ? <p role="status" className="mt-5">Searching properties…</p> : properties.isError ? <div role="alert" className="mt-5 rounded-xl bg-red-50 p-5 text-red-800"><p>Property results are unavailable. FAQ results can still be reviewed below.</p><button type="button" className="mt-3 font-semibold underline" onClick={() => void properties.refetch()}>Retry property search</button></div> : <>
          <p className="mt-3 text-sm text-slate-500">{pagination?.total_items ?? 0} matching properties. Availability and viewing times need separate confirmation.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{properties.data?.data.map((property) => <article key={property.upid} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900"><Link className="hover:text-teal-700 hover:underline" href={`/explore/${encodeURIComponent(property.upid)}`}>{propertyTitle(property)}</Link></h3>
            <p className="mt-2 text-sm text-slate-600">{[property.locality, property.city].filter(Boolean).join(', ') || 'Location to be confirmed'}</p>
            <p className="mt-3 text-sm text-slate-600">{property.bhk} BHK · {furnishingLabel(property.furnishing)}</p>
            <p className="mt-4 font-semibold text-teal-800">₹{property.monthly_rent.toLocaleString('en-IN')} / month</p>
            <Link href={`/explore/${encodeURIComponent(property.upid)}`} className="mt-4 inline-block text-sm font-semibold text-teal-700 underline">View property details</Link>
          </article>)}</div>
          {properties.data?.data.length === 0 && <p className="mt-4 rounded-xl bg-slate-50 p-5 text-slate-600">No properties match this search. Try another locality or <Link href="/tenant-inquiry" className="text-teal-700 underline">share your rental requirement</Link>.</p>}
          {pagination && <nav aria-label="Property search pages" className="mt-5 flex items-center gap-5 text-sm text-slate-600">
            {page > 1 && <Link className="font-semibold text-teal-700 underline" href={pageHref(page - 1)}>Previous</Link>}
            <span>Page {page} of {Math.max(1, pagination.total_pages)}</span>
            {page < pagination.total_pages && <Link className="font-semibold text-teal-700 underline" href={pageHref(page + 1)}>Next</Link>}
          </nav>}
        </>}
      </section>
      <section className="mt-12" aria-labelledby="faq-search-heading">
        <h2 id="faq-search-heading" className="text-2xl font-bold text-slate-900">FAQ answers</h2>
        <p className="mt-3 text-sm text-slate-500">{faqResults.length} matching answers</p>
        <div className="mt-5 space-y-3">{faqResults.map((faq) => <details key={`${faq.audience}:${faq.question}`} className="rounded-xl border border-slate-200 bg-white p-5">
          <summary className="cursor-pointer font-semibold text-slate-900">{faq.question} <span className="text-xs font-normal text-slate-500">({faq.audience})</span></summary>
          <p className="mt-4 leading-relaxed text-slate-600">{faq.answer}</p><Link className="mt-3 inline-block text-sm font-semibold text-teal-700 underline" href={faq.href}>Read all {faq.audience.toLowerCase()} FAQs</Link>
        </details>)}</div>
        {!faqResults.length && <p className="mt-4 text-slate-600">No FAQ answers match this phrase. Try a shorter topic, or <Link href="/contact" className="text-teal-700 underline">contact Cypress</Link>.</p>}
      </section>
    </>}
  </div>;
}