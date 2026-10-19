import { Actions, PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('Property Maintenance & Service Partners | Cypress', 'Understand how Cypress coordinates property maintenance: issue review, estimates, owner approvals and documented service updates.', '/about/service-partners');

export default function PartnersPage() {
  return <>
    <PageHero eyebrow="Our service partners" title="Clear Responsibilities. Documented Service Coordination." description="Cypress coordinates service professionals, repair estimates and progress updates as part of your property’s agreed management coverage." />
    <Section title="Maintenance With Clear Communication">
      <div className={s.grid}>{[
        ['Review the request', 'Cypress reviews the reported issue and coordinates appropriate assistance.'],
        ['Confirm scope and approvals', 'Relevant details and estimates for non-covered repairs are shared for approval before proceeding, subject to agreed emergency arrangements.'],
        ['Coordinate and document', 'Service updates and available maintenance records help keep owners and tenants informed.'],
      ].map(([title, text], index) => <article key={title} className={s.card}><div className={s.step}>0{index + 1}</div><h3>{title}</h3><p>{text}</p></article>)}</div>
    </Section>
    <Section title="Coverage Comes First." tone="soft"><p className={s.lead}>Labour, materials and coordination responsibilities depend on the selected plan and signed coverage schedule. Response targets do not guarantee repair completion within the same period.</p><Actions secondaryHref="/owners/plans-pricing" secondaryLabel="Understand Maintenance Coverage" /></Section>
  </>;
}