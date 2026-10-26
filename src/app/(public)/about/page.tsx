import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Eye, FileText, Settings, ShieldCheck, Target, Users } from 'lucide-react';
import { Actions, PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/site-config';
import aboutHero from '../../../../public/brand/about-hero.webp';
import aboutMug from '../../../../public/brand/about-mug.webp';
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
    <PageHero
      eyebrow="About Cypress"
      title="Built Around People."
      accent="Powered by Technology."
      description="Cypress simplifies property ownership and renting by connecting people, services and technology through one transparent platform."
      image={aboutHero}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
    />

    <Section>
      <div className={p.pair}>
        <div className={p.pairItem}>
          <div className={p.cardIcon}><Target size={34} aria-hidden="true" /></div>
          <div>
            <span className={p.label}>Our mission</span>
            <p>To make property management simpler, more transparent and dependable.</p>
          </div>
        </div>
        <div className={p.pairDivider} aria-hidden="true" />
        <div className={p.pairItem}>
          <div className={`${p.cardIcon} ${p.icBlue}`}><Eye size={34} aria-hidden="true" /></div>
          <div>
            <span className={p.label}>Our vision</span>
            <p>To create a seamless rental experience for property owners and tenants through technology and trusted services.</p>
          </div>
        </div>
      </div>
    </Section>

    <Section eyebrow="Our values" tone="soft">
      <div className={p.values}>
        {values.map(({ title, text, Icon, tone }) => (
          <div key={title}>
            <div className={`${p.cardIcon} ${tone}`}><Icon size={26} aria-hidden="true" /></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section>
      <div className={p.aboutCtaGrid}>
        <div>
          <span className={s.eyebrow}>Our philosophy</span>
          <h2>Property Management,<br />Made Simpler.</h2>
          <p className={s.lead} style={{ marginTop: '12px' }}>
            We believe that rental management should be transparent, organized and reliable for every owner and tenant.
          </p>
          <div className={p.ctaActions} style={{ marginTop: '24px' }}><Actions /></div>
          <p className={s.note} style={{ marginTop: '20px' }}>
            <Link href="/about/founder" className={s.textLink}>Why I Started Cypress<ArrowRight size={16} aria-hidden="true" /></Link>
          </p>
        </div>
        <div className={p.aboutMugVisual}>
          <Image
            src={aboutMug}
            alt="Light-filled modern workspace — illustrative photograph"
            className={p.aboutMugImg}
            sizes="(max-width: 800px) 100vw, 500px"
          />
        </div>
      </div>
    </Section>
  </>;
}
