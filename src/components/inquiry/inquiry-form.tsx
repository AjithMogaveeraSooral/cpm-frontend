'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, BarChart3, CalendarDays, FileText, Home, MapPin, MessageCircle, Phone, ShieldCheck, Users } from 'lucide-react';
import { ZodError } from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { approvedPlan, bhkOptions, furnishingOptions, inquiryPayload, localDate, planOptions, type InquiryKind } from './inquiry-schema';
import inquiryOwnerDesk from '../../../public/brand/inquiry-owner-desk.webp';
import inquiryTenantLiving from '../../../public/brand/inquiry-tenant-living.webp';
import p from '@/components/marketing/pages.module.css';

type Field = { name: string; label: string; type?: string; options?: readonly string[]; autoComplete?: string; maxLength?: number; optional?: boolean; defaultValue?: string; full?: boolean; placeholder?: string };

const ownerBenefits = [
  { title: 'Personalized Discussion', text: 'We understand your requirements and suggest the right plan.', Icon: MessageCircle, tone: '' },
  { title: 'Transparent Process', text: 'Clear information on services, pricing and next steps.', Icon: FileText, tone: p.icBlue },
  { title: 'Trusted Coordination', text: 'From tenant search to maintenance, we keep you informed.', Icon: ShieldCheck, tone: p.icAmber },
  { title: 'Better Returns', text: 'Professional management for hassle-free ownership.', Icon: BarChart3, tone: p.icRose },
];
const tenantBenefits = [
  { title: 'Verified Properties', text: 'Curated rental options in trusted apartments and communities.', Icon: Home, tone: '' },
  { title: 'Simpler Search', text: 'Share your preferences and we’ll match suitable options.', Icon: MapPin, tone: p.icBlue },
  { title: 'Guided Support', text: 'Get assistance through the entire renting process.', Icon: Users, tone: p.icAmber },
  { title: 'Hassle-Free Move-In', text: 'Support with documentation and coordination.', Icon: FileText, tone: p.icRose },
];
const nextSteps = [
  { title: '1. Submit Details', text: 'Fill in the property information.', Icon: FileText },
  { title: '2. We’ll Contact You', text: 'Our team will get in touch to understand your requirements.', Icon: Phone },
  { title: '3. Discuss Options', text: 'We’ll share suitable management options and next steps.', Icon: CalendarDays },
];

export function InquiryForm({ kind }: { kind: InquiryKind }) {
  const query = useSearchParams();
  const owner = kind === 'owner';
  const visit = !owner && query.get('intent') === 'visit';
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [count, setCount] = useState(0);
  const submitting = useRef(false);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const fields: Field[] = [
    { name: 'name', label: 'Full name', autoComplete: 'name', placeholder: 'Enter your full name' },
    { name: 'phone', label: 'Mobile number', type: 'tel', autoComplete: 'tel', maxLength: 40, placeholder: 'With country code if abroad' },
    ...(owner ? [{ name: 'email', label: 'Email', type: 'email', autoComplete: 'email', maxLength: 255, full: true, placeholder: 'Enter your email address' }] : []),
    { name: 'locality', label: owner ? 'Property locality' : 'Preferred locality', full: !owner, placeholder: 'e.g. Whitefield, Sarjapur, HSR Layout' },
    ...(owner ? [
      { name: 'propertyName', label: 'Apartment / property name', placeholder: 'e.g. Prestige Lakeside' },
      { name: 'propertyType', label: 'Property type', options: ['Apartment', 'Independent house', 'Villa', 'Other'] },
    ] : [
      { name: 'budgetMin', label: 'Minimum monthly budget (₹)', type: 'number', placeholder: 'e.g. 25000' },
      { name: 'budgetMax', label: 'Maximum monthly budget (₹)', type: 'number', placeholder: 'e.g. 40000' },
    ]),
    { name: 'bhk', label: 'BHK', options: bhkOptions },
    { name: 'furnishing', label: owner ? 'Furnishing' : 'Furnishing preference', options: furnishingOptions },
    ...(owner ? [
      { name: 'occupancy', label: 'Occupancy status', options: ['Vacant', 'Occupied', 'Available soon', 'Discuss with Cypress'] },
      { name: 'plan', label: 'Preferred plan', options: planOptions, defaultValue: approvedPlan(query.get('plan')), full: true },
    ] : [
      { name: 'moveDate', label: 'Expected move-in date', type: 'date' },
      { name: 'upid', label: 'Cypress property ID (optional)', optional: true, maxLength: 40, defaultValue: query.get('upid') ?? '', placeholder: 'Optional' },
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

  const benefits = owner ? ownerBenefits : tenantBenefits;
  return <div className={p.inqPage}>
    <div className="mx-auto w-[min(1240px,calc(100%-32px))] sm:w-[min(1240px,calc(100%-48px))]">
      <nav aria-label="Breadcrumb" className="mb-8"><ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <li><Link href="/" className="hover:text-teal-700 hover:underline">Home</Link></li><li aria-hidden="true">›</li>
        <li><Link href={owner ? '/owner-services' : '/tenants/services'} className="hover:text-teal-700 hover:underline">{owner ? 'Owners' : 'Tenants'}</Link></li><li aria-hidden="true">›</li>
        <li aria-current="page">{owner ? 'Owner Inquiry' : 'Tenant Inquiry'}</li>
      </ol></nav>
      <div className={p.inqGrid}>
        <div className={p.inqIntro}>
          <span className="block text-[11.5px] font-bold uppercase tracking-[0.18em] text-[#0a2a66]">{owner ? 'Owner inquiry' : visit ? 'Property visit inquiry' : 'Tenant inquiry'}</span>
          <h1 className="mt-4">{owner ? 'Tell Us About ' : 'Let’s Help You '}<em>{owner ? 'Your Property.' : 'Find Your Next Home.'}</em></h1>
          <p>{owner ? 'Share a few details about your property and our team can discuss suitable management options.' : 'Tell us what you’re looking for and Cypress can contact you about suitable available rental properties.'}</p>
          <div className={p.inqVisual}>
            <Image
              src={owner ? inquiryOwnerDesk : inquiryTenantLiving}
              alt={owner ? 'Property owner discussing management with Cypress' : 'Tenant enjoying a comfortable rental home in Bengaluru'}
              className={p.inqImg}
              priority
              sizes="(max-width: 800px) 100vw, 480px"
            />
          </div>
          <ul className={p.benefitList}>{benefits.map(({ title, text, Icon, tone }) => <li key={title}><div className={`${p.cardIcon} ${tone}`}><Icon size={24} aria-hidden="true" /></div><div><h3>{title}</h3><p>{text}</p></div></li>)}</ul>
        </div>
        <div className={`${p.formWrap} ${owner ? p.withSteps : ''}`}>
          <section className={p.formCard} aria-label="Enquiry form">
            <h2>{owner ? 'Property Details' : 'Your Rental Requirements'}</h2>
            {reference ? <div role="status" className="mt-6 space-y-5">
              <h3 ref={successHeading} tabIndex={-1} className="text-2xl font-bold text-teal-800">Your enquiry has been received.</h3>
              <p className="text-slate-600">Keep this server reference for any follow-up. Cypress can contact you using the details you supplied.</p>
              <p className={p.successRef}>Reference ID: <strong className="break-all">{reference}</strong></p>
              <p className="text-sm text-slate-600">{visit ? 'This is a visit request, not a confirmed appointment. Availability and timing need to be agreed separately.' : 'Submitting an enquiry does not create a tenancy, property listing or management agreement.'}</p>
              <Link className="inline-block font-semibold text-teal-700 underline" href={owner ? '/owners/plans-pricing' : '/tenants/find-property'}>{owner ? 'Review management plans' : 'Explore rental properties'}</Link>
            </div> : <form onSubmit={submit} aria-busy={pending}>
              {error && <div ref={errorSummary} tabIndex={-1} role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
              <fieldset disabled={pending} className="min-w-0">
                <legend className="sr-only">Contact and {owner ? 'property' : 'rental'} details</legend>
                <div className={p.formGrid}>
                  {fields.map((field) => <div key={field.name} className={field.full ? p.fieldFull : undefined}>
                    <label htmlFor={`inquiry-${field.name}`} className={`${p.fieldLabel} ${field.optional ? '' : p.required}`}>{field.label}</label>
                    {field.options ? <select id={`inquiry-${field.name}`} name={field.name} required defaultValue={field.defaultValue ?? ''} className={p.fieldControl} aria-invalid={!!fieldErrors[field.name]} aria-describedby={fieldErrors[field.name] ? `error-${field.name}` : undefined}>
                      <option value="" disabled>Select an option</option>
                      {field.options.map((option) => <option key={option}>{option}</option>)}
                    </select> : <input id={`inquiry-${field.name}`} name={field.name} type={field.type ?? 'text'} required={!field.optional} placeholder={field.placeholder} autoComplete={field.autoComplete ?? 'off'} defaultValue={field.defaultValue} maxLength={field.maxLength ?? 150} min={field.type === 'date' ? localDate() : field.type === 'number' ? 1 : undefined} max={field.type === 'number' ? 99999999 : undefined} step={field.type === 'number' ? 1 : undefined} className={p.fieldControl} aria-invalid={!!fieldErrors[field.name]} aria-describedby={fieldErrors[field.name] ? `error-${field.name}` : undefined} />}
                    {fieldErrors[field.name] && <p id={`error-${field.name}`} className={p.fieldError}>{fieldErrors[field.name]}</p>}
                  </div>)}
                  <div className={p.fieldFull}>
                    <label htmlFor="inquiry-requirements" className={p.fieldLabel}>Additional requirements (optional)</label>
                    <textarea id="inquiry-requirements" name="requirements" rows={4} maxLength={2000} onChange={(event) => setCount(event.target.value.length)} placeholder="Share any specific requirements or information (optional)" className={p.fieldControl} aria-invalid={!!fieldErrors.requirements} aria-describedby="requirements-help requirements-error" />
                    <p id="requirements-help" className={p.counter}>{count}/2000 · Do not include identity documents, bank details or other sensitive information.</p>
                    <p id="requirements-error" className={p.fieldError}>{fieldErrors.requirements}</p>
                  </div>
                  <div className={p.fieldFull}>
                    <label className={p.consent}><input type="checkbox" name="consent" required aria-describedby="consent-error" />I agree that Cypress may use these details to respond to this enquiry by phone or email where provided. This is not a booking or a service agreement.</label>
                    <p id="consent-error" className={p.fieldError}>{fieldErrors.consent}</p>
                  </div>
                  <div className={p.fieldFull}>
                    <button type="submit" className={p.submit}>{pending ? 'Submitting…' : error ? 'Retry submission' : owner ? 'Submit Property Enquiry' : visit ? 'Submit Visit Request' : 'Submit Rental Requirement'}{!pending && <ArrowRight size={18} aria-hidden="true" />}</button>
                  </div>
                </div>
              </fieldset>
            </form>}
            <p className={p.notice}>{owner ? 'Your preferred plan is an expression of interest. Coverage and any agreement are confirmed separately.' : 'Property availability, viewings and move-in arrangements must be confirmed separately.'} <Link href={owner ? '/owners/faqs' : '/tenants/faqs'}>Read {owner ? 'owner' : 'tenant'} FAQs</Link> · <Link href="/contact">Contact and support</Link></p>
          </section>
          {owner && <aside className={p.sideSteps} aria-label="What happens next"><ol>{nextSteps.map(({ title, text, Icon }) => <li key={title}><div className={p.cardIcon}><Icon size={18} aria-hidden="true" /></div><strong>{title}</strong>{text}</li>)}</ol></aside>}
        </div>
      </div>
    </div>
  </div>;
}
