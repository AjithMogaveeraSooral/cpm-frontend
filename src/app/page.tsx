'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';

// Root route: bounce to the dashboard or the login screen based on session.
export default function HomePage() {
  const router = useRouter();
  const { status, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
    else if (status === 'unauthenticated') router.replace('/welcome');
  }, [status, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-cypress-500 border-t-transparent" />
    </div>
  );
}
