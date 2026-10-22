import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Camera, Check, FileText, Headphones, House, IndianRupee, MapPin, ShieldCheck, Smartphone, Users } from 'lucide-react';
import { Actions, FaqList, PlanCards, Section, Services, marketingStyles as s } from './sections';
import { ownerFaqs, tenantFaqs } from '@/lib/site-content';
import { pageMetadata } from '@/lib/site-config';
import founder from '../../../public/brand/sudish-kumar.webp';
import propertyHero from '../../../public/brand/property-hero.webp';
import remoteOwnership from '../../../public/brand/remote-ownership.webp';
import devicesMockup from '../../../public/brand/devices-mockup.webp';
import h from './home.module.css';

export const homeMetadata = pageMetadata('Property Management Services in Bangalore | Cypress', 'Smart, transparent property management in Bengaluru. Compare GST-inclusive Bronze, Silver and Gold plans with ₹0 onboarding fees.', '/');

const trustPoints = [
  { label: 'Bengaluru Based', Icon: MapPin },
  { label: 'Service Partner Screening', Icon: ShieldCheck },
  { label: 'Transparent Fees', Icon: IndianRupee },
  { label: 'Digital Records', Icon: FileText },
  { label: 'Inspection Reports', Icon: Camera },
  { label: 'Dedicated Coordination', Icon: Headphones },
];

export function MarketingHome() {
  return <div className={h.home} data-marketing-home>
    <section className={h.hero} aria-labelledby="home-heading">
      <div className={`${s.container} ${h.heroGrid}`}>
        <div className={h.heroCopy}>
          <span className={s.eyebrow}>Property management services in Bengaluru</span>
          <h1 id="home-heading">Your Property.<br />Our Responsibility.<br /><em>Complete Peace of Mind.</em></h1>
          <p className={h.heroDescription}>Smart, transparent and app-based property management. From finding the right tenant to rent tracking, maintenance and documentation — all in one place.</p>
          <ul className={h.benefits} aria-label="Management benefits">
            <li><IndianRupee aria-hidden="true" /><span><strong>₹0</strong>Onboarding Fees</span></li>
            <li><ShieldCheck aria-hidden="true" /><span><strong>Plans from 5%</strong>Inclusive of GST</span></li>
            <li><Smartphone aria-hidden="true" /><span><strong>Digital Property</strong>Management</span></li>
          </ul>
          <Actions ownerLabel="List Your Property" secondaryLabel="Explore Our Services" secondaryHref="/owner-services" />
        </div>
        <figure className={h.heroVisual}>
          <Image src={propertyHero} alt="Modern balcony apartment in Bengaluru" fill sizes="(max-width: 800px) 100vw, 50vw" priority className={h.heroImage} />
          <figcaption className={h.location}><MapPin aria-hidden="true" /><span><strong>Bengaluru</strong>Our Focus. Your Advantage.</span></figcaption>
        </figure>
      </div>
    </section>

    <Section title="Everything Your Property Needs. In One Place." eyebrow="Our services" id="services" className={`${h.centered} ${h.services}`}><Services /></Section>

    <Section title="Built on Experience. Driven by Transparency." eyebrow="Why trust Cypress?" tone="soft" id="why-us" className={h.centered}>
      <p className={s.lead}>Cypress combines firsthand experience as both a property owner and tenant, with over a decade of experience in enterprise technology and process management.</p>
      <ul className={h.trustPoints}>{trustPoints.map(({ label, Icon }) => <li key={label}><Icon size={30} aria-hidden="true" /><span>{label}</span></li>)}</ul>
    </Section>

    <Section id="application" className={h.application}>
      <div className={h.split}>
        <div>
          <span className={s.eyebrow}>The Cypress application</span>
          <h2>One Platform.<br />Complete Visibility.</h2>
          <p className={s.lead}>Track rent, maintenance, inspections and documents through a simple and secure dashboard — for both owners and tenants.</p>
          <div className={s.actions}>
            <Link href="/about/application" className={s.button}>Explore the Application<ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/about/application" className={s.textLink}>Learn more</Link>
          </div>
        </div>
        <div className={h.devicesWrap}>
          <Image src={devicesMockup} alt="Owner and Tenant Dashboards" width={860} height={472} className={h.devicesImg} priority />
        </div>
      </div>
    </Section>

    <Section title="Three Simple Steps to Get Started." eyebrow="How it works" id="how-it-works" className={h.centered}>
      <ol className={h.steps}>{[
        ['Register Your Property', 'Share your property details and requirements.'],
        ['Choose Your Plan', 'Select Bronze, Silver or Gold based on your needs.'],
        ['Stay Connected', 'Track everything through the Cypress platform.'],
      ].map(([title, text], index) => <li key={title}><span className={h.step}>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
    </Section>

    <Section title="Transparent Pricing. The Right Care for Every Property." eyebrow="Our plans" id="plans" className={h.centered}>
      <PlanCards />
    </Section>

    <Section id="nri-support" className={h.nri}>
      <div className={h.nriGrid}>
        <div>
          <span className={s.eyebrow}>NRI property management</span>
          <h2>Your Bengaluru Property.<br />Managed Wherever You Are.</h2>
          <p className={s.lead}>Whether you’re in the UAE, UK, USA, Singapore or elsewhere, Cypress helps you stay informed and connected without handling every operational detail yourself.</p>
          <div className={s.actions}><Link href="/owners/nri-property-management" className={s.button}>Explore NRI Services<ArrowRight size={16} aria-hidden="true" /></Link></div>
        </div>
        <div className={h.remoteVisual}>
          <Image src={remoteOwnership} alt="Illustration of a traveller at an airport" fill sizes="(max-width: 800px) 100vw, 40vw" className={h.remoteImage} />
          <ul className={h.remoteFeatures}>{['Remote property monitoring', 'Rental income tracking', 'Inspection reports', 'Maintenance approvals', 'Digital documentation'].map(text => <li key={text}><Check size={17} aria-hidden="true" />{text}</li>)}</ul>
        </div>
      </div>
    </Section>

    <Section id="founder" className={h.founderSection}>
      <div className={h.founderGrid}>
        <Image src={founder} alt="Sudish Kumar S, founder of Cypress" width={960} height={906} sizes="(max-width: 600px) 100vw, (max-width: 1000px) 35vw, 300px" className={h.founderPhoto} />
        <div>
          <span className={s.eyebrow}>A note from our founder</span>
          <h2>A Simpler, More Transparent Way to Manage Properties.</h2>
          <blockquote className={h.founderQuote}>“I have experienced renting and property ownership firsthand. After spending more than a decade delivering end-to-end enterprise solutions, I wanted to bring that same connected, process-driven approach to property management.”</blockquote>
          <p className={s.attribution}>— Sudish Kumar S<br /><span className={h.founderRole}>Founder, Cypress Property Management Services</span></p>
        </div>
        <aside className={h.founderMotto}><span aria-hidden="true">“</span>Technology<br />for Convenience.<br /><strong>Transparency<br />for Trust.</strong></aside>
      </div>
    </Section>

    <Section title="Quick Answers for Owners and Tenants." eyebrow="Frequently asked questions" id="faqs" className={`${h.centered} ${h.homeFaqs}`}>
      <div className={s.twoColumns}>
        <details className={h.faqGroup}><summary><House aria-hidden="true" /><span>Owner FAQs<small>Pricing, maintenance, deposits, approvals and more.</small></span></summary><FaqList items={ownerFaqs.slice(0, 4)} /><Link className={s.textLink} href="/owners/faqs">All Owner FAQs<ArrowRight size={16} aria-hidden="true" /></Link></details>
        <details className={h.faqGroup}><summary><Users aria-hidden="true" /><span>Tenant FAQs<small>Renting, maintenance, documents and more.</small></span></summary><FaqList items={tenantFaqs.slice(0, 3)} /><Link className={s.textLink} href="/tenants/faqs">All Tenant FAQs<ArrowRight size={16} aria-hidden="true" /></Link></details>
      </div>
    </Section>

    <Section tone="dark" className={h.closing}>
      <div><h2>Ready for Simpler Property Management?</h2><p className={s.lead}>Let Cypress help you manage the everyday details while keeping you informed and involved.</p></div>
      <div className={s.actions}>
        <Link href="/owner-inquiry" className={`${s.button} ${h.whiteButton}`}>List Your Property<ArrowRight size={16} aria-hidden="true" /></Link>
        <Link href="/contact" className={`${s.secondary} ${h.darkSecondary}`}>Talk to Cypress</Link>
      </div>
    </Section>
  </div>;
}

