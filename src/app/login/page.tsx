'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-store';
import { ApiError } from '@/lib/api-client';
import { USER_TYPES } from '@/lib/user-types';
import type { Role } from '@/lib/types';

const passwordSchema = z.object({
  mobile: z.string().min(10, 'Enter a valid mobile number'),
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
  const router = useRouter();
  const { loginWithPassword, requestOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<Mode>('password');
  const [role, setRole] = useState<Role>('tenant');
  const [serverError, setServerError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState<{ mock: boolean; devCode?: string } | null>(null);

  const pwForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });
  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  async function onPasswordSubmit(values: PasswordValues) {
    setServerError(null);
    try {
      await loginWithPassword(values.mobile, values.password, role);
      router.replace('/dashboard');
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
      router.replace('/dashboard');
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Verification failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-cypress-700">Cypress Property Management</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your console</p>
        </div>

        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-slate-700">I am a</p>
          <div className="grid grid-cols-3 gap-2">
            {USER_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setRole(t.value)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                  role === t.value
                    ? 'border-cypress-500 bg-cypress-50 text-cypress-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex rounded-lg bg-slate-100 p-1 text-sm">
          {(['password', 'otp'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md py-1.5 font-medium capitalize transition ${
                mode === m ? 'bg-white text-cypress-700 shadow' : 'text-slate-500'
              }`}
            >
              {m === 'password' ? 'Password' : 'OTP'}
            </button>
          ))}
        </div>

        {serverError && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

        {mode === 'password' ? (
          <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
            <Input label="Mobile" placeholder="9876543210" {...pwForm.register('mobile')} error={pwForm.formState.errors.mobile?.message} />
            <Input label="Password" type="password" {...pwForm.register('password')} error={pwForm.formState.errors.password?.message} />
            <Button type="submit" loading={pwForm.formState.isSubmitting}>Sign in</Button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="flex flex-col gap-4">
            <Input label="Mobile" placeholder="9876543210" {...otpForm.register('mobile')} error={otpForm.formState.errors.mobile?.message} />
            <div className="flex items-end gap-2">
              <Input label="OTP" placeholder="123456" className="flex-1" {...otpForm.register('code')} error={otpForm.formState.errors.code?.message} />
              <Button type="button" variant="secondary" onClick={sendOtp}>Send OTP</Button>
            </div>
            {otpSent?.mock && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Mock SMS mode — dev code: <strong>{otpSent.devCode}</strong>
              </p>
            )}
            <Button type="submit" loading={otpForm.formState.isSubmitting}>Verify &amp; sign in</Button>
          </form>
        )}

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
      </Card>
    </div>
  );
}
