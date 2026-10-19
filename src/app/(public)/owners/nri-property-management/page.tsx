import Link from 'next/link';
import { ArrowRight, Clock, FileText, Globe, Laptop, ShieldCheck, Users } from 'lucide-react';
import { PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/site-config';
import p from '@/components/marketing/pages.module.css';

export const metadata = pageMetadata('NRI Property Management in Bangalore | Cypress', 'Manage your Bengaluru property from abroad with tenant coordination, rent records, inspections and maintenance support. Explore Cypress services for NRI owners.', '/owners/nri-property-management');

const cards = [
  { title: 'Property Management Across Borders', text: 'Cypress helps with tenant sourcing, screening, rental documentation, rent tracking, maintenance coordination, inspections, renewals and move-out support.', Icon: Users, tone: '' },
  { title: 'Digital Visibility From Anywhere', text: 'Through your owner dashboard, you can access property records, inspection reports, rent information and service requests, subject to your selected plan and available application features.', Icon: Laptop, tone: p.icBlue },
  { title: 'Support for NRI Documentation', text: 'Cypress can coordinate relevant rent statements and available TDS documentation. Tax, FEMA and banking compliance requirements vary by owner and transaction; professional advice may be needed.', Icon: FileText, tone: p.icAmber },
  { title: 'Designed for Remote Ownership', text: 'Clear records, digital communication, inspection updates and available approval workflows help reduce unnecessary travel and repeated follow-ups.', Icon: ShieldCheck, tone: '' },
];
const points = [
  { label: 'Suits NRI owners across time zones', Icon: Globe },
  { label: 'Flexible communication channels', Icon: Clock },
  { label: 'Transparent processes', Icon: ShieldCheck },
  { label: 'Digital records and updates', Icon: FileText },
];

export default function NriPage() {
  return <>
    <PageHero eyebrow="NRI property management" title="Your Bengaluru Property." accent="Managed Wherever You Are." description="Own a property in Bengaluru while living abroad? Cypress helps you stay informed and connected without personally coordinating every rental activity." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Owners', href: '/owner-services' }, { label: 'NRI Property Management' }]}>
      <div className={s.actions}><Link href="/owner-inquiry" className={s.button}>Request an NRI Consultation<ArrowRight size={16} aria-hidden="true" /></Link><Link href="/owners/plans-pricing" className={s.secondary}>View Plans &amp; Pricing</Link></div>
    </PageHero>

    <Section>
      <div className={p.nriCards}>{cards.map(({ title, text, Icon, tone }) => <article key={title}><div className={`${p.cardIcon} ${tone}`}><Icon size={22} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      <p className={s.note}>Documentation coordination is not tax, legal or investment advice, or a guarantee of compliance. Confirm requirements with appropriately qualified advisers.</p>
    </Section>

    <Section>
      <div className={p.nriCta}>
        <div>
          <span className={s.eyebrow}>Ready to get started?</span>
          <h2>Let’s Discuss Your Property Management Needs.</h2>
          <p className={s.lead}>Speak with our team to explore how Cypress can help you manage your Bengaluru property from anywhere in the world.</p>
          <div className={s.actions}><Link href="/owner-inquiry" className={s.button}>Request an NRI Consultation<ArrowRight size={16} aria-hidden="true" /></Link><Link href="/contact" className={s.secondary}>Talk to Cypress</Link></div>
        </div>
        <ul className={p.nriPoints}>{points.map(({ label, Icon }) => <li key={label}><Icon aria-hidden="true" />{label}</li>)}</ul>
      </div>
    </Section>
  </>;
}
