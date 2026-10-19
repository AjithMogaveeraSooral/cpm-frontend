import Link from 'next/link';
import { PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata, siteConfig } from '@/lib/site-config';

export const metadata = pageMetadata('Tenant Services & Rental Support | Cypress', 'Explore rental records, maintenance coordination, tenancy documents and move-in and move-out support with Cypress in Bengaluru.', '/tenants/services');

export default function TenantServicesPage() {
  return <>
    <PageHero eyebrow="Tenant services" title="Your Home. Your Requests. One Convenient Platform." description="Cypress helps tenants manage everyday rental needs through organized communication and digital access."><div className={s.actions}><Link className={s.button} href={siteConfig.tenantLogin}>Explore the Tenant Dashboard</Link><Link className={s.secondary} href="/tenant-inquiry">Tenant Inquiry</Link></div></PageHero>
    <Section title="Your Rental Experience, Simplified">
      <div className={s.grid}>{[
        ['Rent & Receipts', 'Access available payment records and rent receipts.'],
        ['Maintenance Requests', 'Report issues, share photographs and follow available repair updates.'],
        ['Documents', 'View rental agreements and relevant tenancy records.'],
        ['Move-In Support', 'Review inventory and property-condition documentation.'],
        ['Move-Out Support', 'Coordinate notice, inspections and the agreed settlement process.'],
        ['Help & Support', 'Contact Cypress for tenancy-related assistance.'],
      ].map(([title, text]) => <article key={title} className={s.card}><h3>{title}</h3><p>{text}</p></article>)}</div>
      <p className={s.note}>Digital workflows depend on the current application release and records available for your tenancy. Contact Cypress for help if an action is not available in your dashboard.</p>
    </Section>
    <Section title="Maintenance With Clear Communication" tone="soft"><p className={s.lead}>When you raise a request, Cypress reviews the issue and coordinates the next steps. Responsibility for repair costs depends on the rental agreement, the nature of the issue and the property’s management coverage.</p><div className={s.actions}><Link href="/tenants/faqs" className={s.secondary}>Tenant FAQs</Link><Link href="/contact" className={s.button}>Contact &amp; Support</Link></div></Section>
  </>;
}