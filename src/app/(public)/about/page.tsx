import Link from 'next/link';
import { Building2, MapPin, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="inline-flex items-center gap-2 rounded-full border border-cypress-200 bg-cypress-50 px-3.5 py-1 text-xs font-bold text-cypress-800 mb-4">
        <Sparkles className="h-3.5 w-3.5 text-cypress-600" /> Founded in Bengaluru (2026)
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        About Cypress Property Management
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-600">
        Born in Bengaluru — India&apos;s high-tech capital — Cypress Property Management was created to solve the real, day-to-day pain points of residential renting. We bring property owners, tenants, and institutional operations teams onto a single unified platform with transparent pricing, guaranteed tenant verification, and digital legal vaults.
      </p>

      {/* City Presence & Expansion */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
          <MapPin className="h-4 w-4 text-cypress-600" />
          <span>Our City Footprint & Expansion Roadmap</span>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          We are starting our operations focused on Bengaluru alone to ensure unmatched on-ground service quality, and will be expanding to Hosur and Chennai in the coming days.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              Live & Active
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2">Bengaluru</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Whitefield, Koramangala, Indiranagar, Sarjapur, Kanakapura Rd, Hebbal
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              Coming Soon
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2">Hosur</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Automotive & electronics tech corridor residential management
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              Coming Soon
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2">Chennai</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              OMR, ECR & south Chennai metro expansion in Q1 2027
            </p>
          </div>
        </div>
      </div>

      {/* What we do */}
      <h2 className="mt-12 text-2xl font-bold text-slate-900">What Sets Us Apart</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
        <div className="rounded-xl border border-slate-200 p-4 bg-white">
          <h3 className="font-bold text-slate-900 mb-1">🏛️ HRA-Compliant Rent Receipts</h3>
          <p>Automated official monthly receipts for tenants with owner PAN and digital verification seals.</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 bg-white">
          <h3 className="font-bold text-slate-900 mb-1">📁 Document Vaults & Inventory</h3>
          <p>All Word, Excel, and PDF agreements, inventory lists, and inspection photos stored in the cloud.</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 bg-white">
          <h3 className="font-bold text-slate-900 mb-1">⚡ 24h/48h Maintenance SLAs</h3>
          <p>Vetted technicians across plumbing, electrical, carpentry, and appliances with owner authorization.</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 bg-white">
          <h3 className="font-bold text-slate-900 mb-1">🤝 Association & Move Coordination</h3>
          <p>Maintenance fee tracking (owner vs tenant) and assisted move-in / move-out handovers.</p>
        </div>
      </div>

      {/* Persona Experience */}
      <h2 className="mt-12 text-2xl font-bold text-slate-900">Unified Multi-Persona Experience</h2>
      <p className="mt-3 text-slate-600 text-sm leading-relaxed">
        Whether you&apos;re a <strong>Tenant</strong> renting a home, a <strong>Property Owner</strong> building passive wealth, or a <strong>Cypress Admin</strong> managing day-to-day operations, our console is tailored with dedicated dashboards, real-time sync, and renewal notifications.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/explore">
          <Button>
            Browse Available Homes <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Sign In to Console</Button>
        </Link>
      </div>
    </div>
  );
}
