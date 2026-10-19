'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  CheckSquare,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Receipt,
  UserCircle,
  Users,
  Inbox,
  Bell,
  UserRound,
  KeyRound,
  FolderLock,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { NotificationBell } from '@/components/notification-bell';
import { BrandLogo } from '@/components/brand-logo';
import type { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

const nav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/tickets', label: 'Maintenance Tickets', icon: LifeBuoy },
  { href: '/invoices', label: 'Rent Receipts & Ledger', icon: Receipt },
  { href: '/documents', label: 'Document Vault', icon: FolderLock },
  { href: '/tenancies', label: 'Tenancies', icon: Users, roles: ['cypress_admin', 'app_admin', 'owner'] },
  { href: '/leads', label: 'Enquiries & Leads', icon: Inbox, roles: ['cypress_admin', 'app_admin'] },
  { href: '/tenants', label: 'Tenant Directory', icon: UserRound, roles: ['cypress_admin', 'app_admin'] },
  { href: '/owners', label: 'Property Owners', icon: KeyRound, roles: ['cypress_admin', 'app_admin'] },
  { href: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['cypress_admin', 'app_admin'] },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user, hydrate, logout } = useAuth();
  const { currentRole, properties, tickets, leads, renewalAlerts } = useDataStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (status === 'idle') {
      hydrate().catch(() => {});
    }
  }, [status, hydrate]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  const userRoles = user?.roles ?? [];
  // Default portal by privilege when no valid selection is persisted.
  const fallbackRole: 'cypress_admin' | 'owner' | 'tenant' =
    userRoles.includes('cypress_admin') || userRoles.includes('app_admin')
      ? 'cypress_admin'
      : userRoles.includes('owner')
      ? 'owner'
      : 'tenant';
  // Honor the portal selected at login (persisted as currentRole) as long as
  // the account actually holds that role; otherwise fall back to the default.
  const activeRole = userRoles.includes(currentRole) ? currentRole : fallbackRole;

  useEffect(() => {
    if (user && activeRole !== currentRole) {
      useDataStore.getState().switchRole(activeRole);
    }
  }, [user, activeRole, currentRole]);

  const isAdmin = activeRole === 'cypress_admin';
  const isOwner = activeRole === 'owner';
  const isTenant = activeRole === 'tenant';

  // Filter visible navigation based on current active role
  const visibleNav = nav.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(activeRole);
  });

  const routeRule = nav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const routeAllowed = !routeRule?.roles || routeRule.roles.includes(activeRole);

  useEffect(() => {
    if (status === 'authenticated' && user && userRoles.length === 0) router.replace('/pending');
    else if (status === 'authenticated' && !routeAllowed) router.replace('/dashboard');
  }, [status, user, userRoles.length, routeAllowed, router]);

  const openTicketsCount = tickets.filter((t) => t.status !== 'closed').length;
  const newLeadsCount = leads.filter((l) => l.status === 'new').length;

  const navCounts: Record<string, number | undefined> = {
    '/leads': newLeadsCount,
    '/tickets': openTicketsCount,
    '/properties': properties.length,
    '/notifications': renewalAlerts.length,
  };

  const displayName = user?.full_name || user?.mobile || 'Cypress User';
  const roleLabel =
    activeRole === 'cypress_admin'
      ? 'Cypress Operations'
      : activeRole === 'owner'
      ? 'Property Owner'
      : 'Tenant Resident';
  const initials = (displayName.charAt(0) || 'U').toUpperCase();

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cypress-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading console...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !user || userRoles.length === 0 || !routeAllowed) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <Link href="/" aria-label="Cypress Property Management home"><BrandLogo className="h-auto w-[180px]" /></Link>
        <button type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="portal-navigation" onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border p-2">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside id="portal-navigation" className={cn('fixed inset-x-0 top-16 bottom-0 z-30 w-full flex-col border-r border-slate-200/80 bg-white lg:sticky lg:top-0 lg:z-auto lg:flex lg:h-screen lg:w-64 lg:shrink-0', menuOpen ? 'flex' : 'hidden')}>
          {/* Brand */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="min-w-0">
              <Link href="/" aria-label="Cypress Property Management home"><BrandLogo className="h-auto w-[145px] max-w-full" /></Link>
              <div className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">{roleLabel}</div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <ThemeSwitcher />
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
            {visibleNav.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              const count = navCounts[href];
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                    active ? 'text-cypress-700 font-bold' : 'text-slate-500 hover:text-slate-900',
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
                  {count ? (
                    <span
                      className={cn(
                        'relative z-10 ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold bg-cypress-600 text-white',
                      )}
                    >
                      {count > 99 ? '99+' : count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card */}
          <div className="border-t border-slate-200/80 p-3">
            <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cypress-gradient text-sm font-bold text-white shadow-glow-sm">
                {initials}
              </div>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-semibold text-slate-800">{displayName}</div>
                <div className="truncate text-[10px] font-medium uppercase tracking-wide text-cypress-600">
                  {roleLabel}
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="relative min-w-0 flex-1 overflow-x-hidden">
          <div className="pointer-events-none fixed inset-0 -z-10 bg-cypress-radial opacity-60" />
          <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
