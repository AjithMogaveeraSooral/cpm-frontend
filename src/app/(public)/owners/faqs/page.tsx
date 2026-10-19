import { FaqPage } from '@/components/marketing/faq-page';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('Property Management FAQs for Owners | Cypress', 'Answers about Cypress plans, tenant approval, maintenance costs, deposits, vacancy fees and cancellations. Understand your property management responsibilities.', '/owners/faqs');

export default function OwnerFaqPage() {
  return <FaqPage audience="owner" />;
}
