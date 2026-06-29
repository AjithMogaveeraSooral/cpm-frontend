'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckSquare, LayoutDashboard, LifeBuoy, LogOut, Receipt, Users } from 'lucide-react';
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
      <div className="flex h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-cypress-500 border-t-transparent" />
      </div>
    );
  }

  const visibleNav = nav.filter((item) => !item.roles || hasRole(...item.roles));

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-5 text-lg font-bold text-cypress-700">Cypress PM</div>
        <nav className="flex-1 space-y-1 px-3">
          {visibleNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                pathname.startsWith(href)
                  ? 'bg-cypress-50 text-cypress-700'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-3 py-4">
          <div className="mb-2 px-2 text-xs text-slate-500">
            {user?.full_name || user?.mobile}
            <div className="text-[11px] uppercase tracking-wide text-cypress-600">{user?.roles.join(', ')}</div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
    </div>
  );
}
