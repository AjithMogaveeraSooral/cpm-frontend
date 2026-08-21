'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Building, Send, CheckCircle2, Clock, Calendar, Sparkles } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';

export type ModalType = 'callback' | 'property' | null;

interface LeadModalProps {
  isOpen: boolean;
  type: ModalType;
  onClose: () => void;
}

export function LeadModal({ isOpen, type, onClose }: LeadModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [feasibleTime, setFeasibleTime] = useState('Morning (9 AM - 12 PM)');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [location, setLocation] = useState('');
  const [plan, setPlan] = useState('Silver (Popular - 10%)');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [autoSmsPreview, setAutoSmsPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !type) return null;

  const isCallback = type === 'callback';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const payloadMessage = isCallback
        ? `[Talk to a Manager Request] Feasible Time: ${feasibleTime}. Notes: ${message}`
        : `[Add Property Request] Type: ${propertyType}, Location: ${location}, Selected Plan: ${plan}. Notes: ${message}`;

      // Public marketing pages have no authenticated user, so submit through the
      // unauthenticated /public/leads endpoint. Only mark success once the lead
      // is actually persisted by the backend.
      const res = await api.post<{ id: string }>(
        '/public/leads',
        {
          name,
          phone,
          email: email || undefined,
          message: payloadMessage,
        },
        { auth: false }
      );

      const refId = res.data?.id ? res.data.id.slice(0, 8).toUpperCase() : `${Math.floor(100000 + Math.random() * 900000)}`;
      const autoMsg = `Automated Message dispatched to ${phone}: "Thank you ${name} for reaching out to Cypress Property Management! Our team has received your ${
        isCallback ? 'callback request' : 'property onboarding request'
      } and will connect with you ${isCallback ? `at ${feasibleTime}` : 'shortly'}. Reference ID: #CPM-${refId}"`;

      setAutoSmsPreview(autoMsg);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'We could not submit your request right now. Please try again in a moment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setAutoSmsPreview(null);
    setError(null);
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleReset}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={handleReset}
            className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {submitted ? (
            <div className="text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cypress-100 text-cypress-600 mb-4">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {isCallback ? 'Callback Requested!' : 'Property Request Received!'}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {isCallback
                  ? `We will reach out to you at your preferred time slot (${feasibleTime}).`
                  : 'Our onboarding specialist will analyze your property details and contact you shortly.'}
              </p>

              {/* Automated SMS / WhatsApp Banner */}
              {autoSmsPreview && (
                <div className="mt-6 rounded-xl border border-cypress-200 bg-cypress-50/80 p-4 text-left shadow-soft">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cypress-800 uppercase tracking-wider mb-1">
                    <Sparkles className="h-4 w-4 text-cypress-600" /> Automated Notification Dispatch
                  </div>
                  <p className="text-xs text-cypress-900 font-mono leading-relaxed bg-white/60 p-2.5 rounded-lg border border-cypress-100">
                    {autoSmsPreview}
                  </p>
                </div>
              )}

              <button
                onClick={handleReset}
                className="mt-6 w-full rounded-xl bg-cypress-gradient py-3 text-sm font-semibold text-white shadow-glow-sm hover:shadow-glow transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cypress-50 text-cypress-700 border border-cypress-200">
                  {isCallback ? <Phone className="h-5 w-5" /> : <Building className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {isCallback ? 'Talk to a Manager' : 'Add Your Property'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isCallback
                      ? 'Request an instant callback at your convenient time slot.'
                      : 'Onboard your property today with ₹0 upfront fees.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                  />
                </div>

                {isCallback ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-cypress-600" /> Feasible Call Back Time *
                    </label>
                    <select
                      value={feasibleTime}
                      onChange={(e) => setFeasibleTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                    >
                      <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                      <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                      <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                      <option value="Weekend Special Slot">Weekend Special Slot</option>
                      <option value="NRI Timezone (Flexible)">NRI Timezone (Flexible)</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Property Type</label>
                        <select
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                        >
                          <option value="Apartment">Apartment</option>
                          <option value="Villa">Villa / House</option>
                          <option value="Commercial">Commercial Space</option>
                          <option value="Plot / Gated">Gated Layout</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Select Plan</label>
                        <select
                          value={plan}
                          onChange={(e) => setPlan(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                        >
                          <option value="Bronze (5%)">Bronze (5% rent)</option>
                          <option value="Silver (Popular - 10%)">Silver (10% rent)</option>
                          <option value="Gold (15%)">Gold (15% rent)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Location / Area</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Indiranagar, Bengaluru"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Additional Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      isCallback
                        ? 'Any specific questions for our manager?'
                        : 'Any specific property details or tenant preferences?'
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-shine flex items-center justify-center gap-2 rounded-xl bg-cypress-gradient py-3 text-sm font-semibold text-white shadow-glow-sm hover:shadow-glow transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {isCallback ? 'Submit Callback Request' : 'Submit Property Onboarding'}
                      </>
                    )}
                  {error && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700">
                      {error}
                    </p>
                  )}
                  </button>
                  <p className="mt-2 text-center text-xs text-slate-400">
                    ₹0 Onboarding Fee • 100% Privacy Guaranteed
                  </p>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
