'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  PhoneCall,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe,
  Lock,
  Smartphone,
  FileText,
  Users,
  RefreshCw,
  Zap,
  Award,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/motion';
import { ModalType } from '@/components/lead-modal';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function WelcomePage() {
  const triggerModal = (type: ModalType) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-lead-modal', { detail: { type } }));
    }
  };

  return (
    <div className="overflow-hidden">
      {/* ======================================================================
                                  2. HERO SECTION
          ====================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cypress-50/70 via-white to-slate-50 py-16 lg:py-24">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-cypress-300/25 blur-3xl animate-float" />
        <div
          className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-gold-200/35 blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Content */}
            <div className="text-center lg:col-span-7 lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="inline-flex items-center gap-2 rounded-full border border-cypress-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-cypress-800 backdrop-blur shadow-soft mb-6"
              >
                <Sparkles className="h-3.5 w-3.5 text-cypress-600" /> ₹0 Onboarding Fee • Guaranteed
                Tenant Screening
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
                className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-tight"
              >
                Smart, Stress-Free Property Management{' '}
                <span className="bg-gradient-to-r from-cypress-600 via-cypress-500 to-cypress-700 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-pan">
                  With ₹0 Onboarding Fees
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
                className="mt-6 text-lg leading-relaxed text-slate-600 max-w-2xl mx-auto lg:mx-0"
              >
                From tenant screening to full maintenance, we handle everything so you earn true passive income.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3.5"
              >
                <button
                  onClick={() => triggerModal('property')}
                  className="btn-shine group inline-flex items-center gap-2 rounded-xl bg-cypress-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-glow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
                >
                  <PlusCircle className="h-4.5 w-4.5" />
                  + Add Your Property
                </button>

                <a
                  href="#plans"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:border-slate-300"
                >
                  View Plans & Pricing
                </a>

                <button
                  onClick={() => triggerModal('callback')}
                  className="inline-flex items-center gap-2 rounded-xl border border-cypress-200 bg-cypress-50/80 px-5 py-3.5 text-sm font-semibold text-cypress-800 transition-all hover:bg-cypress-100"
                >
                  <PhoneCall className="h-4 w-4 text-cypress-600" />
                  Talk to a Manager
                </button>
              </motion.div>
            </div>

            {/* Right Mockup Graphic */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
                className="relative mx-auto max-w-md lg:max-w-none"
              >
                <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl backdrop-blur-xl">
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cypress-gradient text-white font-bold">
                        CP
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Owner Dashboard Preview</h4>
                        <p className="text-xs text-slate-500">Live Management Updates</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cypress-100 px-2.5 py-1 text-xs font-semibold text-cypress-700">
                      <span className="h-2 w-2 rounded-full bg-cypress-500 animate-ping" /> Active
                    </span>
                  </div>

                  {/* Mockup Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                      <span className="text-xs font-medium text-slate-500">Monthly Payout</span>
                      <div className="mt-1 text-xl font-extrabold text-slate-900">₹1,85,000</div>
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-cypress-600">
                        <TrendingUp className="h-3 w-3" /> On-time transfer
                      </span>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                      <span className="text-xs font-medium text-slate-500">Occupancy Rate</span>
                      <div className="mt-1 text-xl font-extrabold text-slate-900">100%</div>
                      <span className="mt-1 text-[11px] font-medium text-slate-500">Verified Tenants</span>
                    </div>
                  </div>

                  {/* Activity feed */}
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-100 shadow-soft">
                      <div className="flex items-center gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-cypress-600" />
                        <span>Tenant Verification Complete</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Today</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-100 shadow-soft">
                      <div className="flex items-center gap-2.5 text-xs text-slate-700">
                        <Wrench className="h-4 w-4 text-gold-600" />
                        <span>Scheduled Inspection Video Report</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Yesterday</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-cypress-gradient p-3 text-center text-xs font-semibold text-white">
                    ₹0 Onboarding Fee Applied Automatically
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
                          3. TRUST / VALUE PROPS BANNER
          ====================================================================== */}
      <section id="why-us" className="border-y border-slate-200/80 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Award,
                title: '₹0 Onboarding Fee',
                subtitle: 'No hidden setup charges or upfront costs.',
              },
              {
                icon: Lock,
                title: '100% Owner Privacy',
                subtitle: 'Your identity and direct contact details stay shielded.',
              },
              {
                icon: Smartphone,
                title: 'App & Web Access',
                subtitle: 'Track payouts, agreements & maintenance 24/7.',
              },
            ].map(({ icon: Icon, title, subtitle }) => (
              <div
                key={title}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 shadow-soft"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cypress-100 text-cypress-700">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{title}</h4>
                  <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================================
                          4. STANDARD INCLUSIONS (Core Features)
          ====================================================================== */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-cypress-700">
              Standard Inclusions
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Everything Included in Every Plan
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Core management features designed to make property ownership effortless and completely transparent.
            </p>
          </FadeIn>

          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: 'Property Listing',
                desc: 'Multi-platform broadcast across top listing networks (99acres, MagicBricks, NoBroker).',
              },
              {
                icon: ShieldCheck,
                title: 'Tenant Verification',
                desc: 'Comprehensive background check, employment status & identity validation.',
              },
              {
                icon: TrendingUp,
                title: 'Rent Collection',
                desc: 'On-time monthly rent collection and secure advance deposit management.',
              },
              {
                icon: FileText,
                title: 'Rental Agreements',
                desc: 'Free legal drafting, state e-stamping, and digital signature execution.',
              },
              {
                icon: Users,
                title: 'Multi-User Access',
                desc: '2+2 dual login credentials via iOS, Android & web for co-owners & family.',
              },
              {
                icon: RefreshCw,
                title: 'On-Time Renewals',
                desc: 'Proactive agreement renewals, rental yield optimization & replacement guarantee.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <StaggerItem key={title}>
                <div className="card-premium card-hover group h-full p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cypress-50 text-cypress-700 border border-cypress-100 group-hover:bg-cypress-gradient group-hover:text-white transition-all duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ======================================================================
                          5. PLANS & PRICING COMPARISON TABLE
          ====================================================================== */}
      <section id="plans" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-cypress-700">
              Plans & Pricing
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Choose Your Level of Management
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Transparent tier options tailored to your maintenance preference and hands-off requirements.
            </p>
          </FadeIn>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-card">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-5 px-6 text-sm font-bold text-slate-900 w-1/4">Features</th>
                  <th className="py-5 px-6 text-sm font-bold text-slate-900 w-1/4">
                    Bronze
                    <span className="block text-xs font-normal text-slate-500 mt-0.5">
                      Essential Care
                    </span>
                  </th>
                  <th className="py-5 px-6 text-sm font-bold text-cypress-700 bg-cypress-50/50 w-1/4">
                    Silver{' '}
                    <span className="inline-flex items-center rounded-full bg-cypress-600 px-2 py-0.5 text-[10px] font-semibold text-white ml-2">
                      Popular
                    </span>
                    <span className="block text-xs font-normal text-slate-500 mt-0.5">
                      Maintenance Support
                    </span>
                  </th>
                  <th className="py-5 px-6 text-sm font-bold text-slate-900 w-1/4">
                    Gold
                    <span className="block text-xs font-normal text-slate-500 mt-0.5">
                      Fully Hands-off
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Monthly Fee</td>
                  <td className="py-4 px-6 font-medium text-slate-800">5% of rent</td>
                  <td className="py-4 px-6 font-bold text-cypress-700 bg-cypress-50/30">
                    10% of rent
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-800">15% of rent</td>
                </tr>

                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Onboarding Fee</td>
                  <td className="py-4 px-6 font-bold text-cypress-600">₹0</td>
                  <td className="py-4 px-6 font-bold text-cypress-600 bg-cypress-50/30">₹0</td>
                  <td className="py-4 px-6 font-bold text-cypress-600">₹0</td>
                </tr>

                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Dedicated Manager</td>
                  <td className="py-4 px-6">Shared Manager</td>
                  <td className="py-4 px-6 font-medium bg-cypress-50/30">Dedicated + Advisory</td>
                  <td className="py-4 px-6 font-medium">Dedicated + Advisory</td>
                </tr>

                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">SOS Site Visits</td>
                  <td className="py-4 px-6">Up to 2 / year</td>
                  <td className="py-4 px-6 bg-cypress-50/30">Up to 4 / year</td>
                  <td className="py-4 px-6 font-medium">Up to 6 Proactive</td>
                </tr>

                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Maintenance Coverage</td>
                  <td className="py-4 px-6">Owner Pays</td>
                  <td className="py-4 px-6 font-medium text-cypress-700 bg-cypress-50/30">
                    Cypress Pays Labor
                  </td>
                  <td className="py-4 px-6 font-medium text-cypress-700">Labor + Materials</td>
                </tr>

                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Response Time</td>
                  <td className="py-4 px-6">48–72 hrs</td>
                  <td className="py-4 px-6 font-medium bg-cypress-50/30">48 hrs</td>
                  <td className="py-4 px-6 font-bold text-slate-900">24 hrs Priority</td>
                </tr>

                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">NRI Features</td>
                  <td className="py-4 px-6">WhatsApp Updates</td>
                  <td className="py-4 px-6 bg-cypress-50/30">WhatsApp + Int&apos;l Payments</td>
                  <td className="py-4 px-6 font-medium text-cypress-800">
                    Full NRI Pack + Video Reports
                  </td>
                </tr>

                <tr className="bg-slate-50/40">
                  <td className="py-5 px-6 font-bold text-slate-900">CTA Button</td>
                  <td className="py-5 px-6">
                    <button
                      onClick={() => triggerModal('property')}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      Select Bronze
                    </button>
                  </td>
                  <td className="py-5 px-6 bg-cypress-50/50">
                    <button
                      onClick={() => triggerModal('property')}
                      className="w-full btn-shine rounded-xl bg-cypress-gradient py-2.5 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow transition-all"
                    >
                      Select Silver
                    </button>
                  </td>
                  <td className="py-5 px-6">
                    <button
                      onClick={() => triggerModal('property')}
                      className="w-full rounded-xl border border-cypress-600 bg-cypress-50 py-2.5 text-xs font-bold text-cypress-800 hover:bg-cypress-100 transition-all"
                    >
                      Select Gold
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ======================================================================
                                  6. HOW IT WORKS
          ====================================================================== */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cypress-700">
              Simple Workflow
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Get Started in 3 Easy Steps
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              From free sign-up to hands-off rental collection in three simple steps.
            </p>
          </FadeIn>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {[
              {
                step: 'Step 1',
                title: 'Add Your Property',
                desc: 'Sign up for free, submit your property details, and choose your preferred management plan.',
              },
              {
                step: 'Step 2',
                title: 'We Onboard & Verify',
                desc: 'We capture HD photos, list your home across top platforms, and thoroughly screen applicants.',
              },
              {
                step: 'Step 3',
                title: 'Sit Back & Collect',
                desc: 'Receive guaranteed on-time rent payouts, live video inspection reports, and total peace of mind.',
              },
            ].map(({ step, title, desc }, idx) => (
              <div
                key={step}
                className="relative card-premium p-8 text-center flex flex-col items-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cypress-gradient text-white text-lg font-bold shadow-glow-sm mb-5">
                  {idx + 1}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-cypress-600 mb-1">
                  {step}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================================
                              7. NRI SERVICES HIGHLIGHT
          ====================================================================== */}
      <section id="nri-support" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-cypress-200 bg-gradient-to-br from-cypress-900 via-cypress-800 to-slate-900 p-8 sm:p-12 text-white shadow-2xl overflow-hidden relative">
            <div className="grid items-center gap-8 lg:grid-cols-12 relative z-10">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-cypress-200 border border-white/15">
                  <Globe className="h-3.5 w-3.5" /> NRI Property Care
                </span>
                <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl leading-tight">
                  Living Abroad? Manage Your Property Remotely.
                </h2>
                <p className="mt-4 text-base text-cypress-100 leading-relaxed max-w-xl">
                  Track maintenance, review video inspection reports, and receive international payments effortlessly from anywhere in the world.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => triggerModal('callback')}
                    className="btn-shine inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-cypress-900 shadow-soft transition-all hover:bg-cypress-50"
                  >
                    <PhoneCall className="h-4 w-4 text-cypress-700" />
                    Schedule NRI Call
                  </button>
                  <button
                    onClick={() => triggerModal('property')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition-all"
                  >
                    + Add Your Property
                  </button>
                </div>
              </div>

              {/* Graphic / World Visual */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md p-6">
                  <Globe className="h-32 w-32 text-cypress-300 animate-pulse-glow" />
                  <div className="absolute top-4 right-4 rounded-xl bg-white/15 px-3 py-1 text-xs font-medium text-white border border-white/20">
                    USD / AED / GBP Payouts
                  </div>
                  <div className="absolute bottom-6 left-2 rounded-xl bg-white/15 px-3 py-1 text-xs font-medium text-white border border-white/20">
                    HD Video Reports
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
                          8. FINAL CTA BANNER (Bottom Lead Catch)
          ====================================================================== */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/70">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-card">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Ready to Simplify Your Property Management?
            </h2>
            <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">
              Onboard your property today for ₹0 upfront cost and enjoy guaranteed passive income.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => triggerModal('property')}
                className="btn-shine inline-flex items-center gap-2 rounded-xl bg-cypress-gradient px-7 py-3.5 text-sm font-semibold text-white shadow-glow-sm hover:shadow-glow transition-all"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                + Add Your Property
              </button>

              <button
                onClick={() => triggerModal('callback')}
                className="inline-flex items-center gap-2 rounded-xl border border-cypress-200 bg-cypress-50 px-6 py-3.5 text-sm font-semibold text-cypress-800 hover:bg-cypress-100 transition-all"
              >
                <PhoneCall className="h-4 w-4 text-cypress-600" />
                Talk to a Manager
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
                                  9. FOOTER
          ====================================================================== */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cypress-gradient">
                  <Building2 className="h-4 w-4 text-white" />
                </span>
                Cypress PM
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400 max-w-xs">
                Smart, stress-free property management platform empowering owners, tenants, and managers across India & abroad.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#plans" className="hover:text-white transition-colors">
                    Services & Plans
                  </a>
                </li>
                <li>
                  <a href="#why-us" className="hover:text-white transition-colors">
                    Why Us
                  </a>
                </li>
                <li>
                  <a href="#nri-support" className="hover:text-white transition-colors">
                    NRI Support
                  </a>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-white transition-colors">
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Owner Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                Legal & Governance
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Rental Agreement Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security & Data Protection
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                Contact & Support
              </h4>
              <ul className="space-y-2 text-xs">
                <li>Support Email: support@cypresspm.com</li>
                <li>Phone / WhatsApp: +91 80 4000 0000</li>
                <li>Hours: Mon–Sat, 9:00 AM – 7:00 PM IST</li>
                <li className="pt-2 text-[11px] text-slate-500">
                  Koramangala, Bengaluru, Karnataka 560034
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Cypress Property Management. All Rights Reserved.</p>
            <p className="text-[11px]"></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
