import Link from 'next/link';
import { Building2 } from 'lucide-react';

// Public marketing/marketplace shell — accessible without authentication.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/welcome" className="flex items-center gap-2 text-lg font-bold text-cypress-700">
            <Building2 className="h-5 w-5" /> Cypress PM
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
            <Link href="/welcome" className="hover:text-cypress-700">Home</Link>
            <Link href="/explore" className="hover:text-cypress-700">Properties</Link>
            <Link href="/about" className="hover:text-cypress-700">About</Link>
            <Link href="/contact" className="hover:text-cypress-700">Contact</Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="font-medium text-slate-600 hover:text-cypress-700">Sign in</Link>
            <Link
              href="/signup"
              className="rounded-lg bg-cypress-600 px-4 py-2 font-medium text-white transition hover:bg-cypress-700"
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
            <Link href="/about" className="hover:text-cypress-700">About</Link>
            <Link href="/contact" className="hover:text-cypress-700">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
