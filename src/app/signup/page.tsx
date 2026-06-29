'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-store';
import { ApiError } from '@/lib/api-client';
import { USER_TYPES, userTypeLabel } from '@/lib/user-types';
import type { Role } from '@/lib/types';

const startSchema = z.object({
  mobile: z.string().min(10, 'Enter a valid mobile number'),
});
const verifySchema = z.object({
  code: z.string().min(4, 'Enter the OTP you received'),
});
const completeSchema = z
  .object({
    full_name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });

type StartValues = z.infer<typeof startSchema>;
type VerifyValues = z.infer<typeof verifySchema>;
type CompleteValues = z.infer<typeof completeSchema>;

const STEPS = ['User type & mobile', 'Verify OTP', 'Your details'];

export default function SignupPage() {
  const { signupRequestOtp, signupVerifyOtp, signupComplete } = useAuth();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>('tenant');
  const [mobile, setMobile] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState<{ mock: boolean; devCode?: string } | null>(null);
  const [done, setDone] = useState(false);

  const startForm = useForm<StartValues>({ resolver: zodResolver(startSchema) });
  const verifyForm = useForm<VerifyValues>({ resolver: zodResolver(verifySchema) });
  const completeForm = useForm<CompleteValues>({ resolver: zodResolver(completeSchema) });

  async function onStart(values: StartValues) {
    setServerError(null);
    try {
      const res = await signupRequestOtp(values.mobile, role);
      setMobile(values.mobile);
      setOtpSent(res);
      setStep(1);
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Could not start signup');
    }
  }

  async function onVerify(values: VerifyValues) {
    setServerError(null);
    try {
      await signupVerifyOtp(mobile, values.code);
      verifyForm.reset({ code: values.code });
      setStep(2);
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Invalid OTP');
    }
  }

  async function onComplete(values: CompleteValues) {
    setServerError(null);
    try {
      await signupComplete({
        mobile,
        code: verifyForm.getValues('code'),
        role,
        full_name: values.full_name,
        email: values.email || undefined,
        password: values.password,
      });
      setDone(true);
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Could not complete signup');
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cypress-50 text-cypress-700">
            ✓
          </div>
          <h1 className="text-xl font-bold text-slate-900">Registration submitted</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your {userTypeLabel(role)} registration is pending approval by a Cypress admin. You&apos;ll be able to access
            the portal once it&apos;s approved.
          </p>
          <Link href="/login" className="mt-6 inline-block">
            <Button>Back to login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-cypress-700">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Step {step + 1} of 3 — {STEPS[step]}</p>
        </div>

        <div className="mb-6 flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-cypress-500' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        {serverError && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

        {step === 0 && (
          <form onSubmit={startForm.handleSubmit(onStart)} className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">I want to register as</p>
              <div className="grid gap-2">
                {USER_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setRole(t.value)}
                    className={`flex flex-col rounded-lg border px-3 py-2 text-left transition ${
                      role === t.value
                        ? 'border-cypress-500 bg-cypress-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-800">{t.label}</span>
                    <span className="text-xs text-slate-500">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <Input label="Mobile" placeholder="9876543210" {...startForm.register('mobile')} error={startForm.formState.errors.mobile?.message} />
            <Button type="submit" loading={startForm.formState.isSubmitting}>Send OTP</Button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={verifyForm.handleSubmit(onVerify)} className="flex flex-col gap-4">
            <p className="text-sm text-slate-500">
              We sent a code to <strong>{mobile}</strong> for your {userTypeLabel(role)} registration.
            </p>
            {otpSent?.mock && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Mock SMS mode — dev code: <strong>{otpSent.devCode}</strong>
              </p>
            )}
            <Input label="OTP" placeholder="123456" {...verifyForm.register('code')} error={verifyForm.formState.errors.code?.message} />
            <Button type="submit" loading={verifyForm.formState.isSubmitting}>Verify</Button>
            <button type="button" onClick={() => setStep(0)} className="text-xs text-slate-500 hover:underline">
              Change mobile or user type
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={completeForm.handleSubmit(onComplete)} className="flex flex-col gap-4">
            <Input label="Full name" placeholder="Jane Doe" {...completeForm.register('full_name')} error={completeForm.formState.errors.full_name?.message} />
            <Input label="Email (optional)" type="email" placeholder="jane@example.com" {...completeForm.register('email')} error={completeForm.formState.errors.email?.message} />
            <Input label="Password" type="password" {...completeForm.register('password')} error={completeForm.formState.errors.password?.message} />
            <Input label="Confirm password" type="password" {...completeForm.register('confirm')} error={completeForm.formState.errors.confirm?.message} />
            <Button type="submit" loading={completeForm.formState.isSubmitting}>Create account</Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-cypress-700 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
