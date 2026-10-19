import Link from 'next/link';
import { FaqList, PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { tenantFaqs } from '@/lib/site-content';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('Rental & Tenant FAQs | Cypress', 'Find answers about rental inquiries, maintenance responsibilities, tenancy records and move-out coordination with Cypress.', '/tenants/faqs');

export default function TenantFaqPage() {
  return <><PageHero eyebrow="Tenant FAQs" title="A Clearer Rental Experience." description="Information about finding a home, requesting support and accessing your tenancy records." /><Section><FaqList items={tenantFaqs} /></Section><Section title="Let’s Help You Find Your Next Home." tone="soft"><div className={s.actions}><Link href="/tenants/find-property" className={s.button}>Find a Property</Link><Link href="/tenant-inquiry" className={s.secondary}>Submit Tenant Inquiry</Link><Link href="/contact" className={s.secondary}>Contact &amp; Support</Link></div></Section></>;
}