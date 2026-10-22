import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicProperty, PublicPropertyError, furnishingLabel, propertyTitle, propertyTypeLabel } from '@/lib/public-properties';
import { formatINR } from '@/lib/utils';
import { PropertyImage } from '@/components/marketplace/property-image';
import { PropertyActions } from '@/components/marketplace/property-actions';
import { pageMetadata, siteUrl } from '@/lib/site-config';

// Node/standalone deployment: availability and signed media are never baked into
// a static export or served after a listing has been withdrawn.
export const dynamic = 'force-dynamic';

const loadProperty = cache(async (upid: string) => {
  try { return await getPublicProperty(upid); }
  catch (error) {
    if (error instanceof PublicPropertyError && error.status === 404) return null;
    throw error;
  }
});

type Props = { params: Promise<{ upid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await loadProperty((await params).upid);
  if (!property) notFound();
  const location = [property.locality, property.city].filter(Boolean).join(', ');
  const title = `${propertyTitle(property)}${location ? ` in ${location}` : ''} | Cypress`;
  const description = `${property.bhk} BHK ${propertyTypeLabel(property.property_type).toLowerCase()}, ${furnishingLabel(property.furnishing).toLowerCase()}. Rent ${formatINR(property.monthly_rent)}/month; security deposit ${formatINR(property.deposit)}. Enquire or schedule a visit. Availability subject to confirmation.`;
  return pageMetadata(title, description, `/explore/${encodeURIComponent(property.upid)}`);
}

export default async function PropertyDetailPage({ params }: Props) {
  const p = await loadProperty((await params).upid);
  if (!p) notFound();
  const title = propertyTitle(p);
  const media = p.media || [];
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'Residence', name: title,
    url: siteUrl(`/explore/${encodeURIComponent(p.upid)}`),
    description: `${p.bhk} BHK ${propertyTypeLabel(p.property_type)} in ${[p.locality, p.city].filter(Boolean).join(', ')}. Availability subject to confirmation.`,
    numberOfBedrooms: p.bhk,
    address: { '@type': 'PostalAddress', addressLocality: p.city, addressCountry: 'IN' },
    ...(p.area_sqft ? { floorSize: { '@type': 'QuantitativeValue', value: p.area_sqft, unitCode: 'FTK' } } : {}),
  };
  return <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <Link href="/explore" className="text-sm font-semibold text-cypress-800 underline">← All rental homes</Link>
    <header className="my-6"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Available · Vacant</span><h1 className="mt-4 text-3xl font-bold text-slate-900">{title}</h1><p className="mt-2 text-slate-600">{[p.locality, p.city].filter(Boolean).join(', ') || 'Location available on enquiry'}</p><p className="mt-2 text-xs text-slate-500">Property reference: {p.upid}</p></header>
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <section aria-label="Property photographs and videos">
        <div className="h-72 overflow-hidden rounded-2xl bg-slate-100 sm:h-96"><PropertyImage src={p.cover_image_url} fallback="/brand/find-prop-hero.webp" alt={title} /></div>
        {media.length > 0 && <div className="mt-4 grid gap-4 sm:grid-cols-2">{media.filter((m) => m.url !== p.cover_image_url).map((m, index) => <div key={m.url} className="h-52 overflow-hidden rounded-xl bg-slate-100">{m.type === 'video' ? <video controls preload="none" src={m.url} aria-label={`Property video ${index + 1}`} className="h-full w-full" /> : <PropertyImage src={m.url} alt={`${title}, photograph ${index + 1}`} />}</div>)}</div>}
      </section>
      <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="Rental details">
        <p className="text-sm text-slate-500">Monthly rent</p><p className="mt-1 text-3xl font-bold text-cypress-900">{formatINR(p.monthly_rent)}</p>
        <dl className="my-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><dt className="text-slate-500">Security deposit</dt><dd className="font-semibold">{formatINR(p.deposit)}</dd><dt className="text-slate-500">Configuration</dt><dd>{p.bhk} BHK</dd><dt className="text-slate-500">Property type</dt><dd>{propertyTypeLabel(p.property_type)}</dd><dt className="text-slate-500">Furnishing</dt><dd>{furnishingLabel(p.furnishing)}</dd>{p.area_sqft && <><dt className="text-slate-500">Area</dt><dd>{p.area_sqft} sq.ft</dd></>}</dl>
        <PropertyActions upid={p.upid} label={title} />
        <p className="mt-5 text-xs leading-5 text-slate-500">Rent, deposit and availability are subject to confirmation. A visit request is not a confirmed appointment. Exact address and access arrangements are shared privately by Cypress.</p>
      </section>
    </div>
    {!!p.amenities?.length && <section className="mt-8"><h2 className="text-xl font-bold">Amenities</h2><ul className="mt-4 flex flex-wrap gap-3">{p.amenities.map((name) => <li key={name} className="rounded-xl bg-slate-100 px-4 py-2 text-sm">{name}</li>)}</ul></section>}
  </article>;
}