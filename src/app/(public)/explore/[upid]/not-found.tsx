import Link from 'next/link';

export default function PropertyNotFound() {
  return <div className="mx-auto max-w-3xl px-6 py-20 text-center"><h1 className="text-2xl font-bold">This home is not available</h1><p className="mt-3 text-slate-600">It may no longer be listed. Browse other available homes or share your requirements with Cypress.</p><Link href="/explore" className="mt-6 inline-block font-semibold text-cypress-800 underline">Explore rental homes</Link></div>;
}