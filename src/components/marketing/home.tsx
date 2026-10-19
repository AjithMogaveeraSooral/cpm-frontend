import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Camera, Check, ClipboardCheck, FileText, Headphones, House, IndianRupee, MapPin, ShieldCheck, Smartphone, Users, Wallet, Wrench } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Actions, FaqList, PlanCards, Section, Services, marketingStyles as s } from './sections';
import { ownerFaqs, tenantFaqs } from '@/lib/site-content';
import { pageMetadata } from '@/lib/site-config';
import founder from '../../../public/brand/sudish-kumar.webp';
import propertyHero from '../../../public/brand/property-hero.webp';
import remoteOwnership from '../../../public/brand/remote-ownership.webp';
import h from './home.module.css';

export const homeMetadata = pageMetadata('Property Management Services in Bangalore | Cypress', 'Smart, transparent property management in Bengaluru. Compare GST-inclusive Bronze, Silver and Gold plans with ₹0 onboarding fees.', '/');

const trustPoints = [
  { label: 'Bengaluru Based', Icon: MapPin },
  { label: 'Partner Screening', Icon: ShieldCheck },
  { label: 'Transparent Fees', Icon: IndianRupee },
  { label: 'Digital Records', Icon: FileText },
  { label: 'Inspection Reports', Icon: Camera },
  { label: 'Service Coordination', Icon: Headphones },
];
const records = [
  { label: 'Rental records', text: 'Rent tracking and payment history', Icon: Wallet },
  { label: 'Maintenance', text: 'Requests, estimates and updates', Icon: Wrench },
  { label: 'Inspections', text: 'Documented property condition', Icon: ClipboardCheck },
  { label: 'Documents', text: 'Agreements, reports and receipts', Icon: FileText },
];

export function MarketingHome() {
  return <div className={h.home}>
    <section className={h.hero} aria-labelledby="home-heading">
      <div className={`${s.container} ${h.heroGrid}`}>
        <div className={h.heroCopy}>
          <span className={s.eyebrow}>Property management services in Bengaluru</span>
          <h1 id="home-heading">Your Property.<br />Our Responsibility.<br /><em>Complete Peace of Mind.</em></h1>
          <p className={h.intro}>Smart, Transparent, App-Based Property Management in Bengaluru.</p>
          <p className={h.heroDescription}>Owning a rental property should be rewarding, not overwhelming. Cypress simplifies tenant management, rent tracking, maintenance, inspections and documentation through one connected platform.</p>
          <ul className={h.benefits} aria-label="Management benefits">
            <li><IndianRupee aria-hidden="true" /><span><strong>₹0</strong>Onboarding Fees</span></li>
            <li><ShieldCheck aria-hidden="true" /><span><strong>Plans from 5%</strong>Inclusive of GST</span></li>
            <li><Smartphone aria-hidden="true" /><span><strong>Digital Property</strong>Management</span></li>
          </ul>
          <Actions secondaryLabel="Explore Our Services" secondaryHref="/owner-services" />
        </div>
        <figure className={h.heroVisual}>
          <Image src={propertyHero} alt="Illustrative modern apartment building from the Cypress design reference" fill sizes="(max-width: 800px) 100vw, 50vw" priority className={h.heroImage} />
          <figcaption className={h.location}><MapPin aria-hidden="true" /><span><strong>Bengaluru</strong>Our focus. Your advantage.</span></figcaption>
          <span className={h.illustrationLabel}>Property illustration</span>
        </figure>
      </div>
    </section>

    <Section title="Everything Your Property Needs. In One Place." eyebrow="Our services" id="services" className={`${h.centered} ${h.services}`}><Services /></Section>

    <Section title="Built on Experience. Driven by Transparency." eyebrow="Why trust Cypress?" tone="soft" id="why-us" className={h.centered}>
      <p className={s.lead}>Cypress was founded by someone who understands renting and property ownership firsthand, supported by over a decade of experience delivering enterprise technology solutions.</p>
      <p className={s.lead}>Our approach brings together clear communication, transparent pricing, documented processes and technology-enabled property management.</p>
      <ul className={h.trustPoints}>{trustPoints.map(({ label, Icon }) => <li key={label}><Icon size={30} aria-hidden="true" /><span>{label}</span></li>)}</ul>
    </Section>

    <Section id="application" className={h.application}>
      <div className={h.split}>
        <div>
          <span className={s.eyebrow}>The Cypress application</span>
          <h2>One Property.<br />One Digital Record.</h2>
          <p className={s.lead}>Every property receives a unique Cypress Property ID (UPID), connecting its documents, rental records, inspections and maintenance history.</p>
          <p className={s.lead}>One connected platform. Fewer follow-ups. Better visibility.</p>
          <div className={s.actions}><Link href="/about/application" className={s.button}>Explore Our Application<ArrowRight size={16} aria-hidden="true" /></Link></div>
        </div>
        <div className={h.platform} aria-label="Cypress platform overview">
          <div className={h.platformHeader}><BrandLogo className={h.previewLogo} /><span>Platform overview</span></div>
          <div className={h.platformBody}>
            <div className={h.platformTitle}><span className={h.propertyIcon}><Building2 aria-hidden="true" /></span><div><h3>Your property, connected.</h3><p>One Cypress Property ID · UPID</p></div></div>
            <div className={h.recordGrid}>{records.map(({ label, text, Icon }) => <div key={label}><Icon size={22} aria-hidden="true" /><strong>{label}</strong><span>{text}</span></div>)}</div>
            <div className={h.portalLinks}><Link href="/owner-login">Owner Portal<ArrowRight size={14} aria-hidden="true" /></Link><Link href="/tenant-login">Tenant Portal<ArrowRight size={14} aria-hidden="true" /></Link></div>
            <p className={h.previewNote}>Overview only. Available records and features depend on your role and plan.</p>
          </div>
        </div>
      </div>
    </Section>

    <Section title="How Cypress Works" eyebrow="Three simple steps to get started" id="how-it-works" className={h.centered}>
      <ol className={h.steps}>{[
        ['Register Your Property', 'Share your property details, location and management requirements.'],
        ['Choose Your Plan', 'Select Bronze, Silver or Gold based on your service requirements.'],
        ['Stay Connected', 'Access available updates on rent, services, inspections and documents through Cypress.'],
      ].map(([title, text], index) => <li key={title}><span className={h.step}>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
    </Section>

    <Section title="Our Plans at a Glance" eyebrow="Transparent pricing. The right care for your property." id="plans" className={h.centered}>
      <PlanCards />
      <p className={s.note}>Maintenance coverage varies by plan and signed schedule. Response targets are not completion guarantees; repairs are not unlimited.</p>
      <div className={s.actions}><Link href="/owners/plans-pricing" className={s.button}>Compare Plans &amp; Pricing<ArrowRight size={16} aria-hidden="true" /></Link></div>
    </Section>

    <Section tone="soft" id="nri-support" className={h.nri}>
      <div className={h.nriGrid}>
        <div>
          <span className={s.eyebrow}>Own a Bengaluru property while living abroad?</span>
          <h2>Distance Shouldn’t Mean Losing Control.</h2>
          <p className={s.lead}>Whether you’re in the UAE, UK, USA, Singapore or elsewhere, Cypress helps you coordinate tenant management, rent, inspections, maintenance and documentation remotely.</p>
          <div className={s.actions}><Link href="/owners/nri-property-management" className={s.button}>Explore NRI Property Management<ArrowRight size={16} aria-hidden="true" /></Link></div>
        </div>
        <div className={h.remoteVisual}>
          <Image src={remoteOwnership} alt="Illustration of a traveller at an airport" fill sizes="(max-width: 800px) 100vw, 40vw" className={h.remoteImage} />
          <ul className={h.remoteFeatures}>{['Remote property coordination', 'Rental records', 'Inspection reports', 'Maintenance coordination', 'Digital documentation'].map(text => <li key={text}><Check size={17} aria-hidden="true" />{text}</li>)}</ul>
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
          <p className={s.attribution}>Sudish Kumar S — Founder<span className={h.founderRole}>Cypress Property Management Services</span></p>
          <Link href="/about/founder" className={s.textLink}>Why I Started Cypress<ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <aside className={h.founderMotto}><span aria-hidden="true">“</span>Technology for Convenience.<br /><strong>Transparency for Trust.</strong></aside>
      </div>
    </Section>

    <Section title="Quick Answers for Owners and Tenants." eyebrow="Frequently asked questions" id="faqs" className={`${h.centered} ${h.homeFaqs}`}>
      <div className={s.twoColumns}>
        <details className={h.faqGroup}><summary><House aria-hidden="true" /><span>Owner FAQs<small>Pricing, maintenance, approvals and more.</small></span></summary><FaqList items={ownerFaqs.slice(0, 4)} /><Link className={s.textLink} href="/owners/faqs">All Owner FAQs<ArrowRight size={16} aria-hidden="true" /></Link></details>
        <details className={h.faqGroup}><summary><Users aria-hidden="true" /><span>Tenant FAQs<small>Renting, maintenance, documents and more.</small></span></summary><FaqList items={tenantFaqs.slice(0, 3)} /><Link className={s.textLink} href="/tenants/faqs">All Tenant FAQs<ArrowRight size={16} aria-hidden="true" /></Link></details>
      </div>
    </Section>

    <Section tone="dark" className={h.closing}>
      <div><h2>Ready for Simpler Property Management?</h2><p className={s.lead}>Let Cypress help you manage the everyday details while keeping you informed and involved in important decisions.</p></div>
      <Actions secondaryHref="/contact" secondaryLabel="Talk to Cypress" />
    </Section>
  </div>;
}