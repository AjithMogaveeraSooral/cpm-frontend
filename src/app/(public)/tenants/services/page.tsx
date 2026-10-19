import Link from 'next/link';
import { ArrowRight, Check, FileText, Headphones, House, IndianRupee, LogOut, Wrench } from 'lucide-react';
import { PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata, siteConfig } from '@/lib/site-config';
import propertyHero from '../../../../../public/brand/property-hero.webp';
import p from '@/components/marketing/pages.module.css';

export const metadata = pageMetadata('Tenant Services & Rental Support | Cypress', 'Explore rental records, maintenance coordination, tenancy documents and move-in and move-out support with Cypress in Bengaluru.', '/tenants/services');

const services = [
  { title: 'Rent & Receipts', text: 'Access available payment records and rent receipts through your tenant account.', Icon: IndianRupee, tone: '' },
  { title: 'Maintenance Requests', text: 'Report issues, upload photographs and follow available repair updates.', Icon: Wrench, tone: p.icBlue },
  { title: 'Documents', text: 'View rental agreements and other relevant tenancy records.', Icon: FileText, tone: p.icAmber },
  { title: 'Move-In Support', text: 'Review inventory and property-condition documentation.', Icon: House, tone: p.icRose },
  { title: 'Move-Out Support', text: 'Submit notice, coordinate inspections and follow the agreed settlement process.', Icon: LogOut, tone: p.icPurple },
  { title: 'Help & Support', text: 'Contact Cypress for tenancy-related assistance.', Icon: Headphones, tone: '' },
];
const steps = [
  { title: 'Raise a Request', text: 'Share the issue with photos and details.' },
  { title: 'Cypress Reviews', text: 'Our team reviews the request and coordinates the next steps.' },
  { title: 'Updates & Progress', text: 'Track the status through your tenant dashboard, where available.' },
  { title: 'Resolution', text: 'The issue is resolved as per the rental agreement and applicable management coverage.' },
];

export default function TenantServicesPage() {
  return <>
    <PageHero eyebrow="Tenant services" title="Your Home. Your Requests." accent="One Convenient Platform." description="Cypress helps tenants manage everyday rental needs through organized communication and digital access." image={propertyHero} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Tenants', href: '/tenants/services' }, { label: 'Tenant Services' }]}>
      <div className={s.actions}><Link className={s.button} href={siteConfig.tenantLogin}>Explore the Tenant Dashboard<ArrowRight size={16} aria-hidden="true" /></Link><Link className={s.secondary} href="/tenant-inquiry">Tenant Inquiry</Link></div>
    </PageHero>

    <Section title="Your Rental Experience, Simplified" className={p.centerHead}>
      <p className={s.lead}>Access the essential information and services you need, all in one place.</p>
      <div className={`${p.tsGrid} text-left`}>{services.map(({ title, text, Icon, tone }) => <article key={title}><div className={`${p.cardIcon} ${tone}`}><Icon size={24} aria-hidden="true" /></div><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      <p className={s.note} style={{ marginInline: 'auto' }}>Digital workflows depend on the current application release and records available for your tenancy. Contact Cypress for help if an action is not available in your dashboard.</p>
    </Section>

    <section className={`${s.section} ${p.supportBand}`}>
      <div className={`${s.container} ${p.supportGrid}`}>
        <div>
          <span className={s.eyebrow}>Maintenance support</span>
          <h2 className={p.supportTitle}>Maintenance With<br /><span>Clear Communication</span></h2>
          <p className={s.lead}>When you raise a request, Cypress reviews the issue and coordinates the next steps. Responsibility for repair costs depends on the rental agreement, the nature of the issue and the property’s management coverage.</p>
          <div className={s.actions}><Link href={siteConfig.tenantLogin} className={s.button}>Explore the Tenant Dashboard<ArrowRight size={16} aria-hidden="true" /></Link><Link href="/tenants/faqs" className={s.secondary}>Tenant FAQs</Link></div>
        </div>
        <ol className={p.supportSteps}>{steps.map(({ title, text }, index) => <li key={title}><div className={`${p.cardIcon} ${['', p.icBlue, p.icAmber, p.icPurple][index]}`}>{index + 1}</div><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
      </div>
    </section>

    <Section>
      <div className={p.dashboardCta}>
        <div><span className={s.eyebrow}>Ready to get started?</span><h2>Access Your Tenant Dashboard</h2><p className={p.dcLead}>Manage your requests, view documents and stay informed — anytime, from anywhere, subject to available application features.</p><div className={p.dcActions}><Link href={siteConfig.tenantLogin} className={s.button}>Explore the Tenant Dashboard<ArrowRight size={16} aria-hidden="true" /></Link></div></div>
        <ul className={p.checkList}>{['Easy request submission', 'Transparent updates', 'Convenient access'].map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>
      </div>
    </Section>
  </>;
}
