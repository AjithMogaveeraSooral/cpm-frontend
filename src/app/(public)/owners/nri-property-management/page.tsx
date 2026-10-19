import { Actions, PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('NRI Property Management in Bangalore | Cypress', 'Manage your Bengaluru property from abroad with tenant coordination, rent records, inspections and maintenance support. Explore Cypress services for NRI owners.', '/owners/nri-property-management');

export default function NriPage() {
  return <>
    <PageHero eyebrow="For NRI owners" title="Your Bengaluru Property. Managed Wherever You Are." description="Own a property in Bengaluru while living abroad? Cypress helps you stay informed and connected without personally coordinating every rental activity."><Actions ownerLabel="Request an NRI Consultation" secondaryHref="/owners/plans-pricing" secondaryLabel="Compare Plans" /></PageHero>
    <Section title="Property Management Across Borders"><p className={s.lead}>Cypress helps with tenant sourcing, screening, rental documentation, rent tracking, maintenance coordination, inspections, renewals and move-out support.</p>
      <div className={s.twoColumns}>
        <article className={s.card}><h3>Digital Visibility From Anywhere</h3><p>Through your owner dashboard, you can access property records, inspection reports, rent information and service requests, subject to your selected plan and available application features.</p></article>
        <article className={s.card}><h3>Designed for Remote Ownership</h3><p>Clear records, digital communication, inspection updates and available approval workflows help reduce unnecessary travel and repeated follow-ups.</p></article>
      </div>
    </Section>
    <Section title="Support for NRI Documentation" tone="soft"><p className={s.lead}>Cypress can coordinate relevant rent statements and available TDS documentation. Tax, FEMA and banking compliance requirements vary by owner and transaction; professional advice may be needed.</p><p className={s.note}>Documentation coordination is not tax, legal or investment advice, or a guarantee of compliance. Confirm requirements with appropriately qualified advisers.</p><Actions ownerLabel="Request an NRI Consultation" secondaryHref="/contact" secondaryLabel="Contact Cypress" /></Section>
  </>;
}