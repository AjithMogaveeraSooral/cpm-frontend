import { Suspense } from 'react';
import { pageMetadata } from '@/lib/site-config';
import { SiteSearch } from './site-search';

export const metadata = {
  ...pageMetadata('Search Properties & FAQs | Cypress', 'Search available rental properties and Cypress owner and tenant FAQs.', '/search'),
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return <Suspense fallback={<p role="status" className="p-12 text-center">Loading site search…</p>}><SiteSearch /></Suspense>;
}