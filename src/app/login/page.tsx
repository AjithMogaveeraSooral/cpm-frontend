'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { ApiError } from '@/lib/api-client';
import { USER_TYPES } from '@/lib/user-types';
import type { Role } from '@/lib/types';

const passwordSchema = z.object({
  mobile: z.string().refine((value) => value.trim().toLowerCase() === 'admin' || /^[0-9+\-\s]{10,}$/.test(value), 'Enter a valid mobile number or admin username'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
const otpSchema = z.object({
  mobile: z.string().min(10, 'Enter a valid mobile number'),
  code: z.string().min(4, 'Enter the OTP'),
});

type Mode = 'password' | 'otp';
type PasswordValues = z.infer<typeof passwordSchema>;
type OtpValues = z.infer<typeof otpSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<p role="status" className="p-8 text-center text-slate-600">Loading sign in…</p>}>
      <LoginWithPortal />
    </Suspense>
  );
}

function LoginWithPortal() {
  const params = useSearchParams();
  const requestedRole = params.get('role');
  const initialRole = requestedRole === 'app_admin' || requestedRole === 'owner' || requestedRole === 'cypress_admin' || requestedRole === 'tenant'
    ? requestedRole : 'tenant';
  return <LoginForm key={initialRole} initialRole={initialRole} />;
}

function LoginForm({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const { loginWithPassword, requestOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<Mode>('password');
  const [showPassword, setShowPassword] = useState(false);
  // A portal hint is not an authorization grant: both auth flows still enforce role access.
  const [role, setRole] = useState<Role>(initialRole);
  const [serverError, setServerError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState<{ mock: boolean; devCode?: string } | null>(null);

  const pwForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });
  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  async function onPasswordSubmit(values: PasswordValues) {
    setServerError(null);
    try {
      await loginWithPassword(values.mobile, values.password, role);
      const u = useAuth.getState().user;
      useDataStore.getState().switchRole(role === 'app_admin' ? 'cypress_admin' : role as 'cypress_admin' | 'owner' | 'tenant');
      router.replace(u && u.roles.length > 0 ? '/dashboard' : '/pending');
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Login failed');
    }
  }

  async function sendOtp() {
    setServerError(null);
    const mobile = otpForm.getValues('mobile');
    if (!mobile) {
      otpForm.setError('mobile', { message: 'Enter a mobile number first' });
      return;
    }
    try {
      const res = await requestOtp(mobile);
      setOtpSent(res);
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Could not send OTP');
    }
  }

  async function onOtpSubmit(values: OtpValues) {
    setServerError(null);
    try {
      await verifyOtp(values.mobile, values.code, 'login', role);
      const u = useAuth.getState().user;
      useDataStore.getState().switchRole(role as 'cypress_admin' | 'owner' | 'tenant');
      router.replace(u && u.roles.length > 0 ? '/dashboard' : '/pending');
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Verification failed');
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-emerald-950 px-4 py-10">
      <Image src="/brand/hd-maintenance-kitchen.webp" alt="" fill priority sizes="100vw" quality={90} className="object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-black/20" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md motion-reduce:!transform-none motion-reduce:!opacity-100"
      >
        <div className="rounded-lg border border-white/70 bg-white/95 p-6 shadow-2xl sm:p-9">
          <div className="mb-7 text-center">
            <Link href="/" className="mx-auto mb-5 block w-fit" aria-label="Cypress Property Management home"><BrandLogo priority /></Link>
            <h1 className="text-xl font-semibold tracking-normal text-emerald-950">Cypress Property Management</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to your console</p>
          </div>

          <fieldset className="mb-5">
            <legend className="mb-3 text-xs font-semibold text-slate-600">Select Account Portal</legend>
            <div className="grid grid-cols-2 gap-2">
              {[...USER_TYPES, { value: 'app_admin' as const, label: 'Super Admin' }].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={role === t.value}
                  onClick={() => { setRole(t.value); setServerError(null); if (t.value === 'app_admin') setMode('password'); }}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                    role === t.value
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  {t.value === 'owner' ? <KeyRound aria-hidden="true" className="h-4 w-4 shrink-0" /> : t.value === 'tenant' ? <UserRound aria-hidden="true" className="h-4 w-4 shrink-0" /> : <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0" />}
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          {role !== 'app_admin' && <div className="mb-5 flex rounded-lg bg-slate-100 p-1 text-sm" role="group" aria-label="Sign-in method">
            {(['password', 'otp'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md py-2 font-medium capitalize transition-colors duration-200 ${
                  mode === m ? 'bg-white text-cypress-700 shadow-soft' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'password' ? 'Password' : 'OTP'}
              </button>
            ))}
          </div>}

          {serverError && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-medium">{serverError}</p>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'password' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'password' ? 12 : -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="motion-reduce:!transform-none motion-reduce:!opacity-100"
            >
              {mode === 'password' ? (
                <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
                  <Input id="login-identifier" label={role === 'app_admin' ? 'Username or mobile' : 'Mobile'} placeholder={role === 'app_admin' ? 'Enter username' : 'Enter mobile number'} autoComplete="username" className="rounded-lg shadow-none" {...pwForm.register('mobile')} error={pwForm.formState.errors.mobile?.message} />
                  <div className="relative">
                    <Input id="login-password" label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter password" className="rounded-lg pr-12 shadow-none" {...pwForm.register('password')} error={pwForm.formState.errors.password?.message} />
                    <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} aria-controls="login-password" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-[27px] grid h-10 w-10 place-items-center rounded-md text-slate-500 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700">
                      {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button type="submit" size="lg" className="rounded-lg bg-none bg-emerald-700 shadow-none" loading={pwForm.formState.isSubmitting}>Sign in<ArrowRight aria-hidden="true" className="h-4 w-4" /></Button>
                </form>
              ) : (
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="flex flex-col gap-4">
                  <Input id="otp-mobile" label="Mobile" placeholder="Enter mobile number" className="rounded-lg shadow-none" {...otpForm.register('mobile')} error={otpForm.formState.errors.mobile?.message} />
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
                    <Input id="otp-code" label="OTP" placeholder="6-digit OTP" autoComplete="one-time-code" className="min-w-0 w-full rounded-lg shadow-none" {...otpForm.register('code')} error={otpForm.formState.errors.code?.message} />
                    <Button type="button" variant="secondary" className="rounded-lg" onClick={sendOtp}>Send OTP</Button>
                  </div>
                  {otpSent && (
                    <p className="animate-fade-in rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      OTP verification code has been dispatched to your mobile.
                    </p>
                  )}
                  <Button type="submit" size="lg" loading={otpForm.formState.isSubmitting}>Verify &amp; sign in</Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to Cypress?{' '}
            <Link href="/signup" className="font-medium text-cypress-700 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            <Link href="/explore" className="hover:underline">
              Browse properties without an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
