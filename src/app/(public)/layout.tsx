'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, PhoneCall, PlusCircle, Menu, X } from 'lucide-react';
import { LeadModal, ModalType } from '@/components/lead-modal';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Expose a global event listener so child components (like buttons in page.tsx) can open the modal easily
  useEffect(() => {
    const handleOpenModal = (e: CustomEvent<{ type: ModalType }>) => {
      if (e.detail?.type) {
        setModalType(e.detail.type);
      }
    };
    window.addEventListener('open-lead-modal' as any, handleOpenModal);
    return () => window.removeEventListener('open-lead-modal' as any, handleOpenModal);
  }, []);

  const openModal = (type: ModalType) => setModalType(type);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      {/* Static / Pinned Header (Unmoveable as user scrolls) */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Logo */}
          <Link href="/welcome" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cypress-gradient shadow-glow-sm">
              <Building2 className="h-5 w-5 text-white" />
            </span>
            <div className="flex flex-col">
              <span className="text-gradient leading-none text-xl font-extrabold">CYPRESS</span>
              <span className="text-[10px] tracking-widest font-semibold text-slate-500 uppercase">
                Property Management
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            <Link href="/welcome#plans" className="transition-colors hover:text-cypress-700">
              Services & Plans
            </Link>
            <Link href="/welcome#why-us" className="transition-colors hover:text-cypress-700">
              Why Us
            </Link>
            <Link href="/welcome#nri-support" className="transition-colors hover:text-cypress-700">
              NRI Support
            </Link>
            <Link href="/welcome#faq" className="transition-colors hover:text-cypress-700">
              FAQ
            </Link>
            <Link href="/contact" className="transition-colors hover:text-cypress-700">
              Contact Us
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden items-center gap-3 text-sm md:flex">
            <ThemeSwitcher />
            <Link
              href="/login"
              className="font-medium text-slate-600 transition-colors hover:text-cypress-700 px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Login
            </Link>
            
            <button
              onClick={() => openModal('callback')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cypress-200 bg-cypress-50/60 px-3.5 py-2 font-semibold text-cypress-800 transition-all hover:bg-cypress-100 hover:border-cypress-300"
            >
              <PhoneCall className="h-4 w-4 text-cypress-600" />
              Talk to a Manager
            </button>

            <button
              onClick={() => openModal('property')}
              className="btn-shine inline-flex items-center gap-1.5 rounded-xl bg-cypress-gradient px-4 py-2 font-semibold text-white shadow-glow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
            >
              <PlusCircle className="h-4 w-4" />
              + Add Your Property
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden space-y-3">
            <nav className="flex flex-col gap-3 text-sm font-medium text-slate-700">
              <Link
                href="/welcome#plans"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-cypress-700"
              >
                Services & Plans
              </Link>
              <Link
                href="/welcome#why-us"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-cypress-700"
              >
                Why Us
              </Link>
              <Link
                href="/welcome#nri-support"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-cypress-700"
              >
                NRI Support
              </Link>
              <Link
                href="/welcome#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-cypress-700"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-cypress-700"
              >
                Contact Us
              </Link>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openModal('callback');
                }}
                className="w-full justify-center inline-flex items-center gap-2 rounded-xl border border-cypress-200 bg-cypress-50 py-2.5 text-sm font-semibold text-cypress-800"
              >
                <PhoneCall className="h-4 w-4" />
                Talk to a Manager
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openModal('property');
                }}
                className="w-full justify-center inline-flex items-center gap-2 rounded-xl bg-cypress-gradient py-2.5 text-sm font-semibold text-white shadow-glow-sm"
              >
                <PlusCircle className="h-4 w-4" />
                + Add Your Property
              </button>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-medium text-slate-600 py-2"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Lead Modal */}
      <LeadModal isOpen={!!modalType} type={modalType} onClose={() => setModalType(null)} />
    </div>
  );
}
