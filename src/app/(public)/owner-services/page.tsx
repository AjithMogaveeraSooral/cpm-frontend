import { Actions, ClosingCTA, PageHero, Section, Services, ServiceOfferings, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('Rental Property Management in Bangalore | Cypress', 'From property onboarding and tenant placement to rent tracking, inspections and move-out coordination. Explore Cypress owner services in Bengaluru.', '/owner-services');

export default function OwnerServicesPage() {
  return <>
    <PageHero eyebrow="For property owners" title="Your Property, Professionally Managed." description="From finding the right tenant to managing everyday rental operations, Cypress helps you stay informed without handling every detail yourself."><Actions secondaryLabel="View Plans & Pricing" secondaryHref="/owners/plans-pricing" /></PageHero>
    <Section id="services" title="Ways Cypress Can Help" eyebrow="Our services"><p className={s.lead}>Whether you are renting out your home, already have a tenant, own a vacant home or plot, or want to sell — there is a Cypress service for your situation.</p><ServiceOfferings /></Section>
    <Section title="From Vacant Property to Successful Tenancy" eyebrow="The rental lifecycle" tone="soft">
      <div className={s.twoColumns}>{[
        ['Property onboarding', 'Assess the property, document its condition and prepare the listing.'],
        ['Tenant placement', 'Coordinate enquiries, screening, owner approval and agreements.'],
        ['Ongoing management', 'Track rent, coordinate maintenance and conduct scheduled inspections.'],
        ['Renewal or move-out', 'Manage notices, inspections, documentation and settlement coordination.'],
      ].map(([title, text], index) => <article className={s.card} key={title}><div className={s.step}>0{index + 1}</div><h3>{title}</h3><p>{text}</p></article>)}</div>
    </Section>
    <Section title="You Stay in Control of Important Decisions."><p className={s.lead}>Cypress coordinates the daily work while you retain the agreed approval rights over tenant selection, non-covered repair expenses and significant property decisions.</p></Section>
    <Section title="Everything Your Property Needs. In One Place." tone="soft"><Services /></Section>
    <Section title="Clear Responsibilities. No Unnecessary Surprises."><p className={s.lead}>Understand what your plan covers, which expenses are separate and how maintenance estimates and approvals are handled.</p><Actions secondaryHref="/owners/plans-pricing" secondaryLabel="View Plans & Pricing" /></Section>
    <ClosingCTA title="Ready to Simplify Property Ownership?" description="Tell us about your property and explore a management plan that suits your needs." />
  </>;
}