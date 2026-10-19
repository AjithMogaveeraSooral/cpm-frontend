'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ZodError } from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { approvedPlan, bhkOptions, furnishingOptions, inquiryPayload, localDate, planOptions, type InquiryKind } from './inquiry-schema';

const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20';
type Field = { name: string; label: string; type?: string; options?: readonly string[]; autoComplete?: string; maxLength?: number; optional?: boolean; defaultValue?: string };

export function InquiryForm({ kind }: { kind: InquiryKind }) {
  const query = useSearchParams();
  const owner = kind === 'owner';
  const visit = !owner && query.get('intent') === 'visit';
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submitting = useRef(false);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const fields: Field[] = [
    { name: 'name', label: 'Full name', autoComplete: 'name' },
    { name: 'phone', label: 'Mobile number (include country code if abroad)', type: 'tel', autoComplete: 'tel', maxLength: 40 },
    ...(owner ? [{ name: 'email', label: 'Email', type: 'email', autoComplete: 'email', maxLength: 255 }] : []),
    { name: 'locality', label: owner ? 'Property locality' : 'Preferred locality' },
    ...(owner ? [
      { name: 'propertyName', label: 'Apartment / property name' },
      { name: 'propertyType', label: 'Property type', options: ['Apartment', 'Independent house', 'Villa', 'Other'] },
    ] : [
      { name: 'budgetMin', label: 'Minimum monthly budget (₹)', type: 'number' },
      { name: 'budgetMax', label: 'Maximum monthly budget (₹)', type: 'number' },
    ]),
    { name: 'bhk', label: 'BHK', options: bhkOptions },
    { name: 'furnishing', label: owner ? 'Furnishing' : 'Furnishing preference', options: furnishingOptions },
    ...(owner ? [
      { name: 'occupancy', label: 'Occupancy status', options: ['Vacant', 'Occupied', 'Available soon', 'Discuss with Cypress'] },
      { name: 'plan', label: 'Preferred plan', options: planOptions, defaultValue: approvedPlan(query.get('plan')) },
    ] : [
      { name: 'moveDate', label: 'Expected move-in date', type: 'date' },
      { name: 'upid', label: 'Cypress property ID (optional)', optional: true, maxLength: 40, defaultValue: query.get('upid') ?? '' },
    ]),
  ];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || reference) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    let body;
    try {
      body = inquiryPayload(kind, { ...values, consent: values.consent === 'on' }, visit);
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = Object.fromEntries(err.issues.map((issue) => [String(issue.path[0]), issue.message]));
        setFieldErrors(errors);
        const first = form.elements.namedItem(String(err.issues[0]?.path[0]));
        if (first instanceof HTMLElement) first.focus();
      }
      return;
    }
    submitting.current = true;
    setPending(true);
    setError('');
    setFieldErrors({});
    try {
      const { data } = await api.post<{ id: string }>('/public/leads', body, { auth: false });
      if (!data?.id || typeof data.id !== 'string') throw new Error('missing_reference');
      setReference(data.id);
      requestAnimationFrame(() => successHeading.current?.focus());
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429
        ? 'Too many enquiries. Please wait at least one minute, then try again.'
        : err instanceof ApiError && err.status >= 400 && err.status < 500
          ? 'The server could not accept these details. Check your contact number, email and property ID, then try again.'
          : 'We could not confirm acceptance. Your details are still here. Please retry when your connection is available. If the request reached Cypress, retrying may create a duplicate.');
      requestAnimationFrame(() => errorSummary.current?.focus());
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <div className="bg-slate-50 px-4 py-12 sm:py-20">
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">{owner ? 'Owner enquiry' : visit ? 'Property visit enquiry' : 'Rental requirement'}</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{owner ? 'Tell Us About Your Property.' : "Let’s Help You Find Your Next Home."}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{owner ? 'Share a few details about your property and our team can discuss suitable management options.' : "Tell us what you’re looking for and Cypress can contact you about suitable available rental properties."}</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_16rem]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8" aria-label="Enquiry form">
          {reference ? <div role="status" className="space-y-5">
            <h2 ref={successHeading} tabIndex={-1} className="text-2xl font-bold text-teal-800">Your enquiry has been received.</h2>
            <p className="text-slate-600">Keep this server reference for any follow-up. Cypress can contact you using the details you supplied.</p>
            <p className="rounded-xl bg-teal-50 p-4 text-sm text-teal-900">Reference ID: <strong className="break-all">{reference}</strong></p>
            <p className="text-sm text-slate-600">{visit ? 'This is a visit request, not a confirmed appointment. Availability and timing need to be agreed separately.' : 'Submitting an enquiry does not create a tenancy, property listing or management agreement.'}</p>
            <Link className="inline-block font-semibold text-teal-700 underline" href={owner ? '/owners/plans-pricing' : '/tenants/find-property'}>{owner ? 'Review management plans' : 'Explore rental properties'}</Link>
          </div> : <form onSubmit={submit} aria-busy={pending}>
            <p className="mb-6 text-sm text-slate-500">All fields are required unless marked optional.</p>
            {error && <div ref={errorSummary} tabIndex={-1} role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
            <fieldset disabled={pending} className="grid min-w-0 gap-5 sm:grid-cols-2">
              <legend className="sr-only">Contact and {owner ? 'property' : 'rental'} details</legend>
              {fields.map((field) => <div key={field.name}>
                <label htmlFor={`inquiry-${field.name}`} className="text-sm font-semibold text-slate-700">{field.label}</label>
                {field.options ? <select id={`inquiry-${field.name}`} name={field.name} required defaultValue={field.defaultValue ?? ''} className={inputClass} aria-invalid={!!fieldErrors[field.name]} aria-describedby={fieldErrors[field.name] ? `error-${field.name}` : undefined}>
                  <option value="" disabled>Select an option</option>
                  {field.options.map((option) => <option key={option}>{option}</option>)}
                </select> : <input id={`inquiry-${field.name}`} name={field.name} type={field.type ?? 'text'} required={!field.optional} autoComplete={field.autoComplete ?? 'off'} defaultValue={field.defaultValue} maxLength={field.maxLength ?? 150} min={field.type === 'date' ? localDate() : field.type === 'number' ? 1 : undefined} max={field.type === 'number' ? 99999999 : undefined} step={field.type === 'number' ? 1 : undefined} className={inputClass} aria-invalid={!!fieldErrors[field.name]} aria-describedby={fieldErrors[field.name] ? `error-${field.name}` : undefined} />}
                {fieldErrors[field.name] && <p id={`error-${field.name}`} className="mt-1 text-sm text-red-700">{fieldErrors[field.name]}</p>}
              </div>)}
              <div className="sm:col-span-2">
                <label htmlFor="inquiry-requirements" className="text-sm font-semibold text-slate-700">Additional requirements (optional)</label>
                <textarea id="inquiry-requirements" name="requirements" rows={4} maxLength={2000} className={inputClass} aria-invalid={!!fieldErrors.requirements} aria-describedby="requirements-help requirements-error" />
                <p id="requirements-help" className="mt-1 text-xs text-slate-500">Up to 2,000 characters. Do not include identity documents, bank details or other sensitive information.</p>
                <p id="requirements-error" className="mt-1 text-sm text-red-700">{fieldErrors.requirements}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-600"><input type="checkbox" name="consent" required className="mt-1 h-5 w-5 shrink-0 accent-teal-700" aria-describedby="consent-error" />I agree that Cypress may use these details to respond to this enquiry by phone or email where provided. This is not a booking or a service agreement.</label>
                <p id="consent-error" className="mt-1 text-sm text-red-700">{fieldErrors.consent}</p>
              </div>
              <button type="submit" className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60 sm:col-span-2">{pending ? 'Submitting…' : error ? 'Retry submission' : owner ? 'Submit Property Enquiry' : visit ? 'Submit Visit Request' : 'Submit Rental Requirement'}</button>
            </fieldset>
          </form>}
        </section>
        <aside className="space-y-4 text-sm leading-relaxed text-slate-600">
          <h2 className="text-lg font-bold text-slate-900">What happens next?</h2>
          <p>After the server accepts your enquiry, you’ll receive a reference ID here. Our team can review your requirements and contact you to discuss next steps.</p>
          <p>{owner ? 'Your preferred plan is an expression of interest. Coverage and any agreement are confirmed separately.' : 'Property availability, viewings and move-in arrangements must be confirmed separately.'}</p>
          <Link className="block font-semibold text-teal-700 underline" href={owner ? '/owners/faqs' : '/tenants/faqs'}>Read {owner ? 'owner' : 'tenant'} FAQs</Link>
          <Link className="block font-semibold text-teal-700 underline" href="/contact">Contact and support</Link>
        </aside>
      </div>
    </div>
  </div>;
}