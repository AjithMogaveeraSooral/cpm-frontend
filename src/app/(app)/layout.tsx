'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckSquare, LayoutDashboard, LifeBuoy, LogOut, Receipt, UserCircle, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[]; // when omitted, visible to all authenticated roles
}

const nav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/properties', label: 'Properties', icon: Building2, roles: ['owner', 'cypress_admin', 'app_admin'] },
  { href: '/tickets', label: 'Maintenance', icon: LifeBuoy },
  { href: '/tenancies', label: 'Tenancies', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['cypress_admin', 'app_admin'] },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

// Authenticated shell: guards the session and renders the nav + content.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user, hydrate, logout, hasRole } = useAuth();

  useEffect(() => {
    if (status === 'idle') hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  // Authenticated but no approved role yet → registration is pending.
  useEffect(() => {
    if (status === 'authenticated' && user && user.roles.length === 0) {
      router.replace('/pending');
    }
  }, [status, user, router]);

  if (status !== 'authenticated' || (user && user.roles.length === 0)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-cypress-500 border-t-transparent" />
          <span className="animate-pulse-glow text-sm font-medium text-slate-400">Loading your console…</span>
        </div>
      </div>
    );
  }

  const visibleNav = nav.filter((item) => !item.roles || hasRole(...item.roles));
  const initials = (user?.full_name || user?.mobile || '?').charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-xl">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cypress-gradient shadow-glow-sm">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold text-gradient">Cypress PM</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Property Suite</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {visibleNav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                  active ? 'text-cypress-700' : 'text-slate-500 hover:text-slate-900',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl border border-cypress-100 bg-cypress-50 shadow-soft"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon
                  className={cn(
                    'relative z-10 h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110',
                    active && 'text-cypress-600',
                  )}
                />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="border-t border-slate-200/80 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cypress-gradient text-sm font-bold text-white shadow-glow-sm">
              {initials}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold text-slate-800">{user?.full_name || user?.mobile}</div>
              <div className="truncate text-[11px] font-medium uppercase tracking-wide text-cypress-600">
                {user?.roles.join(', ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="relative flex-1 overflow-y-auto">
        {/* Ambient background accents */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-cypress-radial opacity-60" />
        <div className="px-8 py-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
