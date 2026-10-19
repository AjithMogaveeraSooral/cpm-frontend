import { FaqPage } from '@/components/marketing/faq-page';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('Rental & Tenant FAQs | Cypress', 'Find answers about rental inquiries, maintenance responsibilities, tenancy records and move-out coordination with Cypress.', '/tenants/faqs');

export default function TenantFaqPage() {
  return <FaqPage audience="tenant" />;
}
