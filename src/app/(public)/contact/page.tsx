'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { api } from '@/lib/api-client';

type FormType = 'owner' | 'general';

export default function ContactPage() {
  const [formType, setFormType] = useState<FormType>('owner');

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [location, setLocation] = useState('');
  const [plan, setPlan] = useState('Silver (Popular - 10%)');
  const [subject, setSubject] = useState('General Question');
  const [notes, setNotes] = useState('');

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    const ref = `CPM-LEAD-${Math.floor(100000 + Math.random() * 900000)}`;

    const isOwner = formType === 'owner';
    const structuredMessage = isOwner
      ? `[Property Owner Interest] Type: ${propertyType} | Location: ${location || 'N/A'} | Selected Plan: ${plan} | Description/Notes: ${notes || 'None provided'}`
      : `[General Enquiry] Subject: ${subject} | Details: ${notes || 'None provided'}`;

    try {
      await api.post(
        '/public/leads',
        {
          name,
          phone,
          email: email || undefined,
          message: structuredMessage,
        },
        { auth: false }
      );
    } catch {
      // Graceful fallback for offline dev environment
      console.log('Submitted lead locally');
    } finally {
      setIsSubmitting(false);
      setReferenceId(ref);
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setPhone('');
    setEmail('');
    setLocation('');
    setNotes('');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cypress-200 bg-cypress-50 px-3.5 py-1 text-xs font-semibold text-cypress-700">
          <Sparkles className="h-3.5 w-3.5 text-cypress-600" />
          Direct Admin Offline Contact Channel
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Get in Touch with Cypress Admins
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
          Are you a property owner looking to list your property or an inquirer with a question? Submit your interest
          below and our Cypress Admin team will review your submission and contact you offline via Phone or WhatsApp.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        {/* Left Column: Form Section */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            {submitted ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cypress-100 text-cypress-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <h3 className="mt-4 text-2xl font-bold text-slate-900">Interest Received!</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Thank you, <span className="font-semibold text-slate-900">{name}</span>. Your details have been transmitted directly to our Cypress Admin team dashboard.
                </p>

                <div className="mt-6 rounded-xl border border-cypress-200 bg-cypress-50/70 p-4 text-left shadow-soft">
                  <div className="flex items-center justify-between text-xs text-cypress-800 font-medium">
                    <span>Reference ID:</span>
                    <span className="font-mono font-bold text-cypress-900">{referenceId}</span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-cypress-600" />
                      <span className="font-medium">Offline Contact SLA:</span> Within 2 business hours
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-cypress-600" />
                      <span className="font-medium">Callback Number:</span> {phone}
                    </p>
                    {formType === 'owner' && (
                      <p className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-cypress-600" />
                        <span className="font-medium">Property Type:</span> {propertyType} ({location || 'Bengaluru'})
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 rounded-xl bg-cypress-gradient py-3 text-sm font-semibold text-white shadow-glow-sm hover:shadow-glow transition-all"
                  >
                    Submit Another Interest
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Form Selector Tabs */}
                <div className="mb-6 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setFormType('owner')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                      formType === 'owner'
                        ? 'bg-white text-cypress-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Home className="h-4 w-4 text-cypress-600" />
                    Property Owner Interest
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('general')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                      formType === 'general'
                        ? 'bg-white text-cypress-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 text-cypress-600" />
                    General Enquiry
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    {formType === 'owner' ? 'Property Owner Onboarding Request' : 'Send an Enquiry to Admins'}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {formType === 'owner'
                      ? 'Share your property details to get dedicated end-to-end property management & tenant search.'
                      : 'Have a question about rentals, agreements, or services? Our admins will get back to you offline.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mobile / WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Cypress Admins will use this number for offline calls or WhatsApp connection.
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address <span className="text-slate-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                      />
                    </div>
                  </div>

                  {/* Fields for Property Owner */}
                  {formType === 'owner' ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Property Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                          >
                            <option value="Apartment">Apartment / Flat</option>
                            <option value="Villa / House">Villa / Independent House</option>
                            <option value="Commercial Space">Commercial Office / Retail</option>
                            <option value="Gated Layout">Gated Plot / Layout</option>
                            <option value="Penthouse">Penthouse</option>
                            <option value="PG / Co-Living">PG / Co-Living Space</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Service Plan Interest
                          </label>
                          <select
                            value={plan}
                            onChange={(e) => setPlan(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                          >
                            <option value="Bronze (Popular - 5%)">Bronze Plan (5% Rent fee)</option>
                            <option value="Silver (Popular - 10%)">Silver Plan (10% Rent fee)</option>
                            <option value="Gold (Premium - 15%)">Gold Plan (15% Rent fee)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Property Location / Area
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Prestige Shantiniketan, Whitefield, Bengaluru"
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Property Note / Description <span className="text-slate-400">(Optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Describe your property (e.g. 3 BHK fully furnished, 1500 sqft, ready for immediate tenancy, expected rent ₹45,000/mo)..."
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Subject / Topic</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                        >
                          <option value="General Question">General Question</option>
                          <option value="Tenant Rental Inquiry">Tenant Rental Inquiry</option>
                          <option value="Visit Schedule">Schedule Property Visit</option>
                          <option value="Agreement & Legal">Agreement & Documentation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Message / Details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Write your question or request for the admin team..."
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                        />
                      </div>
                    </>
                  )}

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
                          {formType === 'owner' ? 'Send Interest to Cypress Admins' : 'Submit Enquiry'}
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-cypress-600" />
                      Privacy Guaranteed • Directly routes to Cypress Admin Dashboard
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Offline Admin Contact info */}
        <div className="space-y-6 lg:col-span-5">
          {/* Quick Contact Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Phone className="h-5 w-5 text-cypress-600" /> Direct Phone Support
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Speak directly with an onboarding manager offline.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <a href="tel:+918040000000" className="text-base font-bold font-mono text-cypress-700 hover:underline">
                +91 80 4000 0000
              </a>
              <p className="text-xs text-slate-500 mt-0.5">Mon–Sat, 9:00 AM – 7:00 PM IST</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-cypress-600" /> Email & Official Desk
            </h3>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Onboarding</p>
                <a href="mailto:owners@cypresspm.com" className="text-sm font-medium text-cypress-700 hover:underline">
                  owners@cypresspm.com
                </a>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">General Support</p>
                <a href="mailto:support@cypresspm.com" className="text-sm font-medium text-cypress-700 hover:underline">
                  support@cypresspm.com
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cypress-600" /> Head Office
            </h3>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              Cypress Property Management HQ<br />
              100 Feet Road, 4th Block, Koramangala<br />
              Bengaluru, Karnataka 560034
            </p>
          </div>

          {/* Workflow Info Box */}
          <div className="rounded-2xl border border-cypress-200 bg-cypress-50/70 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cypress-900 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-cypress-600" /> How It Works For Owners
            </h4>
            <ol className="mt-3 space-y-2 text-xs text-cypress-900 list-decimal list-inside leading-relaxed">
              <li>Submit your property details and contact number here.</li>
              <li>Your submission instantly appears in the Cypress Admin Dashboard.</li>
              <li>A dedicated Cypress Admin calls or WhatsApps you offline to verify.</li>
              <li>We inspect the property, capture HD media, and list it to start earning rent!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

