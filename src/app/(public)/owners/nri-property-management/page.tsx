import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, FileText, Globe, ShieldCheck } from 'lucide-react';
import { PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/site-config';
import nriHero from '../../../../../public/brand/nri-hero.webp';
import nriCardBuilding from '../../../../../public/brand/nri-card-building.webp';
import nriCardTablet from '../../../../../public/brand/nri-card-tablet.webp';
import nriCardStatement from '../../../../../public/brand/nri-card-statement.webp';
import nriCardTravel from '../../../../../public/brand/nri-card-travel.webp';
import p from '@/components/marketing/pages.module.css';

export const metadata = pageMetadata('NRI Property Management in Bangalore | Cypress', 'Manage your Bengaluru property from abroad with tenant coordination, rent records, inspections and maintenance support. Explore Cypress services for NRI owners.', '/owners/nri-property-management');

const cards = [
  {
    title: 'Property Management Across Borders',
    text: 'Cypress helps with tenant sourcing, screening, rental documentation, rent tracking, maintenance coordination, inspections, renewals and move-out support.',
    image: nriCardBuilding,
    alt: 'Modern residential building — illustrative photograph',
  },
  {
    title: 'Digital Visibility From Anywhere',
    text: 'Through your owner dashboard, you can access property records, inspection reports, rent information and service requests, subject to your selected plan and available application features.',
    image: nriCardTablet,
    alt: 'Using a smartphone to stay connected — illustrative photograph',
  },
  {
    title: 'Support for NRI Documentation',
    text: 'Cypress can coordinate relevant rent statements and available TDS documentation. Tax, FEMA and banking compliance requirements vary by owner and transaction; professional advice may be needed.',
    image: nriCardStatement,
    alt: 'Reviewing and signing documents — illustrative photograph',
  },
  {
    title: 'Designed for Remote Ownership',
    text: 'Clear records, digital communication, inspection updates and available approval workflows help reduce unnecessary travel and repeated follow-ups.',
    image: nriCardTravel,
    alt: 'Remote property ownership while traveling',
  },
];

const points = [
  { label: 'Suits NRI owners across time zones', Icon: Globe },
  { label: 'Flexible communication channels', Icon: Clock },
  { label: 'Transparent processes', Icon: ShieldCheck },
  { label: 'Digital records and updates', Icon: FileText },
];

export default function NriPage() {
  return <>
    <PageHero
      eyebrow="NRI property management"
      title="Your Bengaluru Property."
      accent="Managed Wherever You Are."
      description="Own a property in Bengaluru while living abroad? Cypress helps you stay informed and connected without personally coordinating every rental activity."
      image={nriHero}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Owners', href: '/owner-services' }, { label: 'NRI Property Management' }]}
    >
      <div className={s.actions}>
        <Link href="/owner-inquiry" className={s.button}>Request an NRI Consultation<ArrowRight size={16} aria-hidden="true" /></Link>
        <Link href="/owners/plans-pricing" className={s.secondary}>View Plans &amp; Pricing</Link>
      </div>
    </PageHero>

    <Section>
      <div className={p.nriCards}>
        {cards.map(({ title, text, image, alt }) => (
          <article key={title}>
            <Image src={image} alt={alt} className={p.nriCardImg} sizes="(max-width: 768px) 100vw, 25vw" />
            <div className={p.nriCardBody}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
      <p className={s.note}>Documentation coordination is not tax, legal or investment advice, or a guarantee of compliance. Confirm requirements with appropriately qualified advisers.</p>
    </Section>

    <Section>
      <div className={p.nriCta}>
        <div>
          <span className={s.eyebrow}>Ready to get started?</span>
          <h2>Let’s Discuss Your Property Management Needs.</h2>
          <p className={s.lead}>Speak with our team to explore how Cypress can help you manage your Bengaluru property from anywhere in the world.</p>
          <div className={s.actions}>
            <Link href="/owner-inquiry" className={s.button}>Request an NRI Consultation<ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/contact" className={s.secondary}>Talk to Cypress</Link>
          </div>
        </div>
        <ul className={p.nriPoints}>
          {points.map(({ label, Icon }) => (
            <li key={label}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  </>;
}
