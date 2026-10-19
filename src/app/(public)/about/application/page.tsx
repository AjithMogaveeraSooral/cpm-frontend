import Link from 'next/link';
import { PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata, siteConfig } from '@/lib/site-config';

export const metadata = pageMetadata('Owner & Tenant Property Management App | Cypress', 'Explore Cypress owner and tenant dashboards, connected property records and the unique Cypress Property ID. Features depend on the current application release.', '/about/application');

export default function ApplicationPage() {
  return <>
    <PageHero eyebrow="Our application" title="One Platform. Every Property Detail Connected." description="Cypress brings property information, communication and service coordination together through connected digital dashboards." />
    <Section title="Owner & Tenant Access" id="owner-tenant-access">
      <p className={s.lead}>The areas below describe the connected management experience. Individual workflows and records are subject to your selected plan, account access and the application’s release status—not a promise that every action is available online today.</p>
      <div className={s.twoColumns}>
        <article className={s.card}><h3>Owner Dashboard</h3><p>Property overview, available rent information and statements, maintenance requests and applicable approvals, inspections and documents.</p><div className={s.actions}><Link href={siteConfig.ownerLogin} className={s.button}>Owner Portal</Link></div></article>
        <article className={s.card}><h3>Tenant Dashboard</h3><p>Available rent receipts, service requests and rental documents, with move-out support and request workflows where available.</p><div className={s.actions}><Link href={siteConfig.tenantLogin} className={s.button}>Tenant Portal</Link></div></article>
      </div>
    </Section>
    <Section title="One Property. One Digital Identity." tone="soft"><p className={s.lead}>Every property receives a unique Cypress Property ID (UPID) linking its records and activities. Less paperwork. Better visibility. More convenient management.</p><div className={s.actions}><Link href="/contact" className={s.secondary}>Ask About Application Access</Link></div></Section>
  </>;
}