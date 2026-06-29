import Link from 'next/link';
import { Building2, ShieldCheck, Wrench } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-cypress-50 to-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Property management, <span className="text-cypress-700">simplified</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Cypress connects tenants, property owners, and operations teams on one platform — listings, tenancies,
            rent, and maintenance, all in one place.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/explore"
              className="rounded-lg bg-cypress-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-cypress-700"
            >
              Browse properties
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-cypress-200 bg-white px-6 py-3 text-sm font-medium text-cypress-700 transition hover:bg-cypress-50"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { icon: Building2, title: 'For Owners', body: 'List properties, approve tenancies, and track payouts with full visibility.' },
            { icon: ShieldCheck, title: 'For Tenants', body: 'Find a home, pay rent, and raise requests — all in a single trusted portal.' },
            { icon: Wrench, title: 'For Operations', body: 'Cypress admins coordinate maintenance, approvals, and site visits end to end.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <Icon className="h-8 w-8 text-cypress-600" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
