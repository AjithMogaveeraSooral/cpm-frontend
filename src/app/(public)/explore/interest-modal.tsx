'use client';

import { FormEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateLeadInput, Lead } from '@/lib/types';

interface InterestModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional property the visitor is enquiring about. */
  propertyUpid?: string;
  propertyLabel?: string;
}

const PHONE_RE = /^[0-9]{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InterestModal({ open, onClose, propertyUpid, propertyLabel }: InterestModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setErrors({});
    setDone(false);
    setSubmitting(false);
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Please enter your name';
    if (!PHONE_RE.test(phone.trim())) next.phone = 'Enter a valid 10-digit mobile number';
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const body: CreateLeadInput = {
      name: name.trim(),
      phone: phone.trim(),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(propertyUpid ? { property_upid: propertyUpid } : {}),
      ...(message.trim() ? { message: message.trim() } : {}),
    };

    setSubmitting(true);
    try {
      await api.post<Lead>('/public/leads', body, { auth: false });
      setDone(true);
    } catch (err) {
      setErrors({ form: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-elevated"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {done ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cypress-50">
                  <CheckCircle2 className="h-8 w-8 text-cypress-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Thanks for your interest!</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Our team has been notified and will reach out to you shortly.
                </p>
                <Button className="mt-6 w-full" onClick={handleClose}>
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-6">
                <h3 className="text-lg font-semibold text-slate-900">Express your interest</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {propertyLabel
                    ? `Interested in ${propertyLabel}? Share your details and we'll get in touch.`
                    : "Share your details and our team will get in touch."}
                </p>

                {propertyUpid && (
                  <p className="mt-3 inline-block rounded-lg bg-cypress-50 px-2.5 py-1 font-mono text-xs text-cypress-700">
                    {propertyUpid}
                  </p>
                )}

                {errors.form && (
                  <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>
                )}

                <div className="mt-4 flex flex-col gap-4">
                  <Input
                    id="lead-name"
                    label="Full name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    autoFocus
                  />
                  <Input
                    id="lead-phone"
                    label="Mobile number"
                    inputMode="numeric"
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    error={errors.phone}
                  />
                  <Input
                    id="lead-email"
                    label="Email (optional)"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="lead-message" className="text-sm font-medium text-slate-700">
                      Message (optional)
                    </label>
                    <textarea
                      id="lead-message"
                      rows={3}
                      placeholder="Anything you'd like us to know?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-soft transition-all duration-200 placeholder:text-slate-400 hover:border-slate-400 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/30"
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-6 w-full" loading={submitting}>
                  Submit interest
                </Button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
