import { Suspense } from 'react';
import { InquiryForm } from '@/components/inquiry/inquiry-form';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('Owner Property Enquiry | Cypress', 'Tell Cypress about your Bengaluru property and discuss suitable property management options.', '/owner-inquiry');

export default function OwnerInquiryPage() {
  return <Suspense fallback={<p role="status" className="p-12 text-center">Loading owner enquiry form…</p>}><InquiryForm kind="owner" /></Suspense>;
}