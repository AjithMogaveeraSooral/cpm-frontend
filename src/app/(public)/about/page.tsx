import Link from 'next/link';
import { ArrowRight, Eye, FileText, Settings, ShieldCheck, Target, Users } from 'lucide-react';
import { Actions, PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/site-config';
import propertyHero from '../../../../public/brand/property-hero.webp';
import p from '@/components/marketing/pages.module.css';

export const metadata = pageMetadata('About Cypress Property Management Services', 'Discover Cypress’s mission: simpler, more transparent property ownership and renting in Bengaluru, connecting people, services and technology.', '/about');

const values = [
  { title: 'Transparency', text: 'Clear pricing and communication.', Icon: FileText, tone: '' },
  { title: 'Accountability', text: 'Defined responsibilities and documented processes.', Icon: ShieldCheck, tone: p.icBlue },
  { title: 'Convenience', text: 'Everything connected in one platform.', Icon: Settings, tone: p.icAmber },
  { title: 'People First', text: 'Respectful, reliable service.', Icon: Users, tone: p.icRose },
];

export default function AboutPage() {
  return <>
    <PageHero eyebrow="About Cypress" title="Built Around People." accent="Powered by Technology." description="Cypress simplifies property ownership and renting by connecting people, services and technology through one transparent platform." image={propertyHero} />
    <Section>
      <div className={p.pair}>
        <div className={p.pairItem}><div className={p.cardIcon}><Target size={34} aria-hidden="true" /></div><div><span className={p.label}>Our mission</span><p>To make property management simpler, more transparent and dependable.</p></div></div>
        <div className={p.pairDivider} aria-hidden="true" />
        <div className={p.pairItem}><div className={`${p.cardIcon} ${p.icBlue}`}><Eye size={34} aria-hidden="true" /></div><div><span className={p.label}>Our vision</span><p>To create a seamless rental experience for property owners and tenants through technology and trusted services.</p></div></div>
      </div>
    </Section>
    <Section eyebrow="Our values" tone="soft">
      <div className={p.values}>{values.map(({ title, text, Icon, tone }) => <div key={title}><div className={`${p.cardIcon} ${tone}`}><Icon size={26} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></div>)}</div>
    </Section>
    <Section>
      <div className={p.ctaPanel}>
        <h2>Property Management,<br />Made Simpler.</h2>
        <div className={p.ctaActions}><Actions /></div>
      </div>
      <p className={s.note}><Link href="/about/founder" className={s.textLink}>Why I Started Cypress<ArrowRight size={16} aria-hidden="true" /></Link></p>
    </Section>
  </>;
}
