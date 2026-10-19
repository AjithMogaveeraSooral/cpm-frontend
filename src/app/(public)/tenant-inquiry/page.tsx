import { Suspense } from 'react';
import { InquiryForm } from '@/components/inquiry/inquiry-form';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('Rental Requirement & Tenant Enquiry | Cypress', 'Share your preferred locality, budget and move-in requirements with Cypress in Bengaluru.', '/tenant-inquiry');

export default function TenantInquiryPage() {
  return <Suspense fallback={<p role="status" className="p-12 text-center">Loading rental requirement form…</p>}><InquiryForm kind="tenant" /></Suspense>;
}