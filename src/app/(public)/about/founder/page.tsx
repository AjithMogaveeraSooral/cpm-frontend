import Image from 'next/image';
import { Actions, PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/site-config';
import founder from '../../../../../public/brand/sudish-kumar.webp';

export const metadata = pageMetadata('Why I Started Cypress | Founder Story', 'Sudish Kumar S shares the experience as a father, former tenant, property owner and enterprise ERP professional that inspired Cypress.', '/about/founder');

export default function FounderPage() {
  return <>
    <PageHero eyebrow="Sudish Kumar S · Founder" title="Why I Started Cypress" description="Technology for Convenience. Transparency for Trust." />
    <Section>
      <div className={s.founderStory}>
        <figure>
          <Image src={founder} alt="Sudish Kumar S, founder of Cypress" width={960} height={906} sizes="(max-width: 800px) 100vw, 360px" className={s.founderPortrait} priority />
          <figcaption><strong>Sudish Kumar S</strong>Founder, Cypress Property Management Services</figcaption>
        </figure>
        <div>
        <p className={s.lead}>As a father of three, a former tenant and a property owner, I understand the importance of trust, responsibility and the everyday challenges of managing rental properties.</p>
        <p className={s.lead}>With over a decade of experience delivering end-to-end ERP and digital solutions to enterprise customers, I wanted to bring the same process-driven thinking to property management.</p>
        <p className={s.lead}>Cypress was created to connect owners, tenants, services, payments, documents and maintenance through one transparent platform—making property management simpler and more dependable for everyone.</p>
        <p className={s.attribution}>— Sudish Kumar S<br />Founder, Cypress Property Management Services</p>
        </div>
      </div>
    </Section>
    <Section title="Built on Experience. Driven by Transparency." tone="soft"><Actions secondaryHref="/about/application" secondaryLabel="Explore Our Application" /></Section>
  </>;
}