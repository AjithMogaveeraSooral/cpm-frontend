'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-store';
import { userTypeLabel } from '@/lib/user-types';

export default function PendingPage() {
  const router = useRouter();
  const { status, user, hydrate, logout } = useAuth();

  useEffect(() => {
    if (status === 'idle') hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    else if (status === 'authenticated' && user && user.roles.length > 0) router.replace('/dashboard');
  }, [status, user, router]);

  if (status !== 'authenticated' || (user && user.roles.length > 0)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-cypress-500 border-t-transparent" />
      </div>
    );
  }

  const pending = user?.pending_roles ?? [];

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          ⏳
        </div>
        <h1 className="text-xl font-bold text-slate-900">Approval pending</h1>
        <p className="mt-2 text-sm text-slate-500">
          Hi {user?.full_name || user?.mobile}, your registration
          {pending.length > 0 ? (
            <> as {pending.map((r) => userTypeLabel(r)).join(', ')}</>
          ) : null}{' '}
          is awaiting review by a Cypress admin. You&apos;ll get access to the portal as soon as it&apos;s approved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => hydrate()}>Refresh status</Button>
          <Button variant="ghost" onClick={() => logout().then(() => router.replace('/login'))}>Sign out</Button>
        </div>
      </Card>
    </div>
  );
}
