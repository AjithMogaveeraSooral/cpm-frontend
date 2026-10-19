import { Actions, PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('About Cypress Property Management Services', 'Discover Cypress’s mission: simpler, more transparent property ownership and renting in Bengaluru, connecting people, services and technology.', '/about');

export default function AboutPage() {
  return <>
    <PageHero eyebrow="Our story" title="Built Around People. Powered by Technology." description="Cypress simplifies property ownership and renting by connecting people, services and technology through one transparent platform." />
    <Section><div className={s.twoColumns}><article className={s.card}><h3>Our Mission</h3><p>To make property management simpler, more transparent and dependable.</p></article><article className={s.card}><h3>Our Vision</h3><p>To create a seamless rental experience for property owners and tenants through technology and trusted services.</p></article></div></Section>
    <Section title="Our Values" tone="soft"><div className={s.twoColumns}>{[
      ['Transparency', 'Clear pricing and communication.'], ['Accountability', 'Defined responsibilities and documented processes.'], ['Convenience', 'Everything connected in one platform.'], ['People First', 'Respectful, reliable service.'],
    ].map(([title, text]) => <article key={title} className={s.card}><h3>{title}</h3><p>{text}</p></article>)}</div></Section>
    <Section title="Property Management, Made Simpler."><Actions /></Section>
  </>;
}
