import Link from 'next/link';
import { ArrowRight, Check, ClipboardList, FileText, House, Info, Users, Wrench } from 'lucide-react';
import { ClosingCTA, PageHero, Section, ServiceOfferings, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/site-config';
import propertyHero from '../../../../public/brand/property-hero.webp';
import p from '@/components/marketing/pages.module.css';

export const metadata = pageMetadata('Rental Property Management in Bangalore | Cypress', 'From property onboarding and tenant placement to rent tracking, inspections and move-out coordination. Explore Cypress owner services in Bengaluru.', '/owner-services');

const lifecycle = [
  { title: 'Property Onboarding', text: 'Assess the property, document its condition and prepare the listing.', Icon: House },
  { title: 'Tenant Placement', text: 'Coordinate enquiries, screening, owner approval and agreements.', Icon: Users },
  { title: 'Ongoing Management', text: 'Track rent, coordinate maintenance and conduct scheduled inspections.', Icon: Wrench },
  { title: 'Renewal or Move-Out', text: 'Manage notices, inspections, documentation and settlement coordination.', Icon: FileText },
];
const control = ['Approve tenants before move-in', 'Decide on non-covered repairs', 'Set rental terms and conditions', 'View property updates anytime'];
const included = ['Tenant sourcing & verification', 'Rent tracking & documentation', 'Routine inspections', 'Maintenance coordination', 'Digital property records'];
const notIncluded = ['Property taxes & society charges', 'Utility bills & common area dues', 'Major repairs & renovations', 'Tenant-caused damage', 'Other statutory charges'];

export default function OwnerServicesPage() {
  return <>
    <PageHero eyebrow="Property management services" title="Your Property," accent="Professionally Managed." description="From finding the right tenant to managing everyday rental operations, Cypress helps you stay informed without handling every detail yourself." image={propertyHero} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Owners', href: '/owner-services' }, { label: 'Property Management' }]}>
      <div className={s.actions}><Link href="/owner-inquiry" className={s.button}>List Your Property<ArrowRight size={16} aria-hidden="true" /></Link><Link href="/owners/plans-pricing" className={s.secondary}>View Plans &amp; Pricing</Link></div>
    </PageHero>

    <section className={`${s.section} ${p.lifecycleBand}`}>
      <div className={`${s.container} ${p.lifecycle}`}>
        <div><span className={s.eyebrow}>The rental lifecycle</span><h2>From Vacant Property to Successful Tenancy</h2><p className={s.note}>We handle the entire rental lifecycle so you can focus on what matters most.</p></div>
        <ol className={p.lifeSteps}>{lifecycle.map(({ title, text, Icon }, index) => <li key={title}><div className={p.lifeHead}><span className={p.lifeNum}>{index + 1}</span><Icon aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></li>)}</ol>
      </div>
    </section>

    <Section>
      <div className={p.splitRow}>
        <div><span className={s.eyebrow}>You stay in control</span><h2>Important Decisions Remain With You.</h2><p className={s.lead}>Cypress coordinates the day-to-day work while you retain the agreed approval rights over tenant selection, non-covered repair expenses and significant property decisions.</p></div>
        <ul className={p.checkList}>{control.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>
      </div>
    </Section>

    <Section tone="soft">
      <div className={p.splitRow}>
        <div><span className={s.eyebrow}>Clear responsibilities</span><h2>Transparent. Organized. No Surprises.</h2><p className={s.lead}>Understand what your plan covers, which expenses are separate and how maintenance estimates and approvals are handled.</p><div className={s.actions}><Link href="/owners/plans-pricing" className={s.button}>View Plans &amp; Pricing<ArrowRight size={16} aria-hidden="true" /></Link></div></div>
        <div className={p.inclGrid}>
          <div><h3><ClipboardList size={20} aria-hidden="true" />What’s Included</h3><ul>{included.map((item) => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul></div>
          <div><h3><Info size={20} aria-hidden="true" />What’s Not Included</h3><ul>{notIncluded.map((item) => <li key={item}><Info size={16} aria-hidden="true" />{item}</li>)}</ul></div>
        </div>
      </div>
      <p className={s.note}>Unless expressly covered by your selected plan. Detailed exclusions and approval conditions are provided in the applicable service agreement.</p>
    </Section>

    <Section id="services" title="Ways Cypress Can Help" eyebrow="Our services"><p className={s.lead}>Whether you are renting out your home, already have a tenant, own a vacant home or plot, or want to sell — there is a Cypress service for your situation.</p><ServiceOfferings /></Section>

    <ClosingCTA title="Ready to Simplify Property Ownership?" description="Tell us about your property and explore a management plan that suits your needs." />
  </>;
}
