import Link from 'next/link';
import { Building2 } from 'lucide-react';

// Public marketing/marketplace shell — accessible without authentication.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/welcome" className="flex items-center gap-2.5 text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cypress-gradient shadow-glow-sm">
              <Building2 className="h-4 w-4 text-white" />
            </span>
            <span className="text-gradient">Cypress PM</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 sm:flex">
            <Link href="/welcome" className="transition-colors hover:text-cypress-700">Home</Link>
            <Link href="/explore" className="transition-colors hover:text-cypress-700">Properties</Link>
            <Link href="/about" className="transition-colors hover:text-cypress-700">About</Link>
            <Link href="/contact" className="transition-colors hover:text-cypress-700">Contact</Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="font-medium text-slate-600 transition-colors hover:text-cypress-700">Sign in</Link>
            <Link
              href="/signup"
              className="btn-shine rounded-xl bg-cypress-gradient px-4 py-2 font-semibold text-white shadow-glow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Cypress Property Management</span>
          <div className="flex gap-4">
            <Link href="/about" className="transition-colors hover:text-cypress-700">About</Link>
            <Link href="/contact" className="transition-colors hover:text-cypress-700">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
