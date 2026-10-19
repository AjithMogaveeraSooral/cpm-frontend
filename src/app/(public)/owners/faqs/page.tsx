import { ClosingCTA, FaqList, PageHero, Section } from '@/components/marketing/sections';
import { ownerFaqs } from '@/lib/site-content';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('Property Management FAQs for Owners | Cypress', 'Answers about Cypress plans, tenant approval, maintenance costs, deposits, vacancy fees and cancellations. Understand your property management responsibilities.', '/owners/faqs');

export default function OwnerFaqPage() {
  return <><PageHero eyebrow="Owner FAQs" title="Your Property Management Questions, Answered." description="Understand the services, compare management plans and discuss your property’s specific requirements." /><Section><FaqList items={ownerFaqs} /></Section><ClosingCTA title="Still Have Questions? Talk to Our Team." /></>;
}