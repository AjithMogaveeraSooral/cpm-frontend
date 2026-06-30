'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function WelcomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-cypress-50 via-white to-slate-50">
        {/* Decorative ambient orbs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cypress-300/30 blur-3xl animate-float" />
        <div
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-gold-200/40 blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cypress-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-cypress-700 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" /> Trusted property management, end to end
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
            className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl"
          >
            Property management,{' '}
            <span className="bg-gradient-to-r from-cypress-600 via-cypress-500 to-cypress-700 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-pan">
              simplified
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-slate-600"
          >
            Cypress connects tenants, property owners, and operations teams on one platform — listings, tenancies,
            rent, and maintenance, all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="mt-9 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/explore"
              className="btn-shine group inline-flex items-center gap-2 rounded-xl bg-cypress-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
            >
              Browse properties
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl border border-cypress-200 bg-white px-6 py-3 text-sm font-semibold text-cypress-700 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-cypress-50"
            >
              Create an account
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <FadeIn className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">One platform, every role</h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-600">
            Purpose-built workflows for everyone in the property lifecycle.
          </p>
        </FadeIn>

        <Stagger className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Building2, title: 'For Owners', body: 'List properties, approve tenancies, and track payouts with full visibility.', accent: 'from-cypress-500/15 to-cypress-600/5 text-cypress-700' },
            { icon: ShieldCheck, title: 'For Tenants', body: 'Find a home, pay rent, and raise requests — all in a single trusted portal.', accent: 'from-sky-400/15 to-sky-600/5 text-sky-700' },
            { icon: Wrench, title: 'For Operations', body: 'Cypress admins coordinate maintenance, approvals, and site visits end to end.', accent: 'from-gold-400/20 to-gold-500/5 text-gold-700' },
          ].map(({ icon: Icon, title, body, accent }) => (
            <StaggerItem key={title}>
              <div className="card-premium card-hover group h-full p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner-top ${accent}`}>
                  <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
