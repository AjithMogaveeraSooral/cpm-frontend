import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Camera, Check, ClipboardCheck, FileText, Fingerprint, Headphones, House, IndianRupee, MapPin, ShieldCheck, Smartphone, Users, Wrench } from 'lucide-react';
import { Actions, FaqList, PlanCards, Section, Services, marketingStyles as s } from './sections';
import { Float, Reveal, Stagger, StaggerItem } from './motion';
import { ownerFaqs, tenantFaqs } from '@/lib/site-content';
import { pageMetadata } from '@/lib/site-config';
import founder from '../../../public/brand/sudish-kumar.webp';
import heroLiving from '../../../public/brand/hd-hero-living.webp';
import skyline from '../../../public/brand/hd-bengaluru-skyline.webp';
import nriFlight from '../../../public/brand/hd-nri-flight.webp';
import recordBackdrop from '../../../public/brand/hd-maintenance-kitchen.webp';
import h from './home.module.css';

export const homeMetadata = pageMetadata('Property Management Services in Bangalore | Cypress', 'Smart, transparent, app-based property management in Bengaluru. Compare GST-inclusive Bronze, Silver and Gold plans with ₹0 onboarding fees.', '/');

const trustPoints = [
  { label: 'Bengaluru Based', text: 'Local team, local partners and on-ground visits.', Icon: MapPin },
  { label: 'Transparent Fees', text: 'Percentage-of-rent plans, inclusive of GST.', Icon: IndianRupee },
  { label: 'Partner Screening', text: 'Service professionals vetted before they visit.', Icon: ShieldCheck },
  { label: 'Digital Records', text: 'Agreements, receipts and reports in one place.', Icon: FileText },
  { label: 'Inspection Reports', text: 'Scheduled visits with documented condition.', Icon: Camera },
  { label: 'Service Coordination', text: 'Requests, estimates and approvals handled for you.', Icon: Headphones },
];

const steps = [
  { title: 'Register Your Property', text: 'Share your property details, location and management requirements.', Icon: House },
  { title: 'Choose Your Plan', text: 'Select Bronze, Silver or Gold based on your service requirements.', Icon: BadgeCheck },
  { title: 'Stay Connected', text: 'Access updates on rent, services, inspections and documents through Cypress.', Icon: Smartphone },
];

const recordTabs = [
  { label: 'Documents', Icon: FileText, text: 'Agreement, inventory and ID records' },
  { label: 'Rent', Icon: IndianRupee, text: 'Receipts, reminders and statements' },
  { label: 'Inspections', Icon: ClipboardCheck, text: 'Scheduled visits with photo reports' },
  { label: 'Maintenance', Icon: Wrench, text: 'Tickets, estimates and approvals' },
];

export function MarketingHome() {
  return <div className={h.home} data-marketing-home>
    {/* Hero ─────────────────────────────────────────────────────────────── */}
    <section className={h.hero} aria-labelledby="home-heading">
      <div className={h.heroBackdrop} aria-hidden="true" />
      <div className={`${s.container} ${h.heroGrid}`}>
        <div className={h.heroCopy}>
          <span className={s.eyebrow}>Smart, Transparent, App-Based Property Management in Bengaluru</span>
          <h1 id="home-heading">Your Property.<br />Our Responsibility.<br /><em>Complete Peace of Mind.</em></h1>
          <p className={h.heroDescription}>Owning a rental property should be rewarding, not overwhelming. Cypress simplifies tenant management, rent tracking, maintenance, inspections and documentation through one connected platform.</p>
          <ul className={h.benefits} aria-label="Management benefits">
            <li><IndianRupee aria-hidden="true" /><span><strong>₹0</strong>Onboarding Fees</span></li>
            <li><ShieldCheck aria-hidden="true" /><span><strong>Plans from 5%</strong>Inclusive of GST</span></li>
            <li><Smartphone aria-hidden="true" /><span><strong>Digital Property</strong>Management</span></li>
          </ul>
          <Actions ownerLabel="List Your Property" secondaryLabel="Explore Our Services" secondaryHref="/owner-services" />
        </div>
        <div className={h.heroVisual}>
          <figure className={h.heroFrame}>
            <Image src={heroLiving} alt="Contemporary living room with garden-facing windows — illustrative photograph" fill sizes="(max-width: 800px) 100vw, 52vw" quality={90} priority className={h.heroImage} />
            <figcaption className={h.location}><MapPin aria-hidden="true" /><span><strong>Bengaluru</strong>Our Focus. Your Advantage.</span></figcaption>
          </figure>
          <Float className={`${h.chip} ${h.chipOne}`} amplitude={8} duration={7}>
            <span className={h.chipIcon}><ClipboardCheck size={18} aria-hidden="true" /></span>
            <span><strong>Inspection report</strong>Photos uploaded to your dashboard</span>
          </Float>
          <Float className={`${h.chip} ${h.chipTwo}`} amplitude={10} duration={8}>
            <span className={h.chipIcon}><Wrench size={18} aria-hidden="true" /></span>
            <span><strong>Maintenance request</strong>Estimate shared · awaiting your approval</span>
          </Float>
          <Float className={`${h.chip} ${h.chipThree}`} amplitude={7} duration={6.5}>
            <span className={h.chipIcon}><IndianRupee size={18} aria-hidden="true" /></span>
            <span><strong>Rent receipt</strong>Generated and shared with your tenant</span>
          </Float>
        </div>
      </div>
    </section>

    {/* Services ─────────────────────────────────────────────────────────── */}
    <Section title="Everything Your Property Needs. In One Place." eyebrow="Our services" id="services" className={`${h.centered} ${h.services}`}>
      <p className={s.lead}>Six connected services, one accountable team and a single digital record for every property.</p>
      <Reveal><Services /></Reveal>
    </Section>

    {/* Why trust ────────────────────────────────────────────────────────── */}
    <Section id="why-us" className={h.trust}>
      <div className={h.trustGrid}>
        <Reveal className={h.trustCopy}>
          <span className={s.eyebrow}>Why Trust Cypress?</span>
          <h2>Built on Experience.<br /><em>Driven by Transparency.</em></h2>
          <p className={s.lead}>Cypress was founded by someone who understands renting and property ownership firsthand, supported by over a decade of experience delivering enterprise technology solutions.</p>
          <p className={s.lead}>Our approach brings together clear communication, transparent pricing, documented processes and technology-enabled property management.</p>
        </Reveal>
        <Reveal delay={0.1} className={h.trustVisual}>
          <Image src={skyline} alt="Bengaluru residential skyline at dusk" fill sizes="(max-width: 900px) 100vw, 44vw" className={h.trustImage} />
          <span className={h.trustCaption}><MapPin size={16} aria-hidden="true" />Bengaluru, Karnataka</span>
        </Reveal>
      </div>
      <Stagger as="ul" className={h.trustPoints}>{trustPoints.map(({ label, text, Icon }) => <StaggerItem as="li" key={label}><Icon size={24} aria-hidden="true" /><div><strong>{label}</strong><span>{text}</span></div></StaggerItem>)}</Stagger>
    </Section>

    {/* How it works ─────────────────────────────────────────────────────── */}
    <Section title="How Cypress Works" eyebrow="Three simple steps" id="how-it-works" className={`${h.centered} ${h.howItWorks}`}>
      <p className={s.lead}>From first enquiry to a fully managed property, every step is documented and visible to you.</p>
      <Stagger as="ol" className={h.steps}>{steps.map(({ title, text, Icon }, index) => <StaggerItem as="li" key={title}><span className={h.step}>0{index + 1}</span><Icon size={26} aria-hidden="true" className={h.stepIcon} /><h3>{title}</h3><p>{text}</p></StaggerItem>)}</Stagger>
    </Section>

    {/* Application / UPID ───────────────────────────────────────────────── */}
    <Section id="application" className={h.application}>
      <div className={h.split}>
        <Reveal>
          <span className={s.eyebrow}>The Cypress application</span>
          <h2>One Property.<br /><em>One Digital Record.</em></h2>
          <p className={s.lead}>Every property receives a unique Cypress Property ID, connecting its documents, rental records, inspections and maintenance history.</p>
          <p className={`${s.lead} ${h.tight}`}>One connected platform. Fewer follow-ups. Better visibility.</p>
          <div className={s.actions}>
            <Link href="/about/application" className={s.button}>Explore Our Application<ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/owners/plans" className={s.textLink}>See what each plan includes</Link>
          </div>
        </Reveal>
        <Reveal delay={0.12} className={h.record}>
          <Image src={recordBackdrop} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" className={h.recordBackdrop} />
          <div className={h.recordCard}>
            <div className={h.recordHead}>
              <span className={h.recordIcon}><Fingerprint size={22} aria-hidden="true" /></span>
              <div><small>Cypress Property ID · sample</small><strong>CPM-KA-BLR-SAMPLE-01</strong></div>
            </div>
            <ul className={h.recordTabs}>{recordTabs.map(({ label, Icon, text }) => <li key={label}><Icon size={18} aria-hidden="true" /><div><strong>{label}</strong><span>{text}</span></div></li>)}</ul>
            <p className={h.recordFoot}><ShieldCheck size={16} aria-hidden="true" />Owner and tenant views of the same record, with approvals and history retained.</p>
          </div>
        </Reveal>
      </div>
    </Section>

    {/* Plans ────────────────────────────────────────────────────────────── */}
    <Section title="Our Plans at a Glance" eyebrow="End-to-End Cypress Property Management Plans" id="plans" className={`${h.centered} ${h.plans}`}>
      <p className={s.lead}>Bronze, Silver and Gold are priced as a percentage of monthly rent, inclusive of GST, with ₹0 onboarding fees. Specialised plans cover existing tenants, vacant homes, plots and property sales.</p>
      <PlanCards />
      <div className={`${s.actions} ${h.centerActions}`}>
        <Link href="/owners/plans-pricing" className={s.button}>Compare Plans &amp; Pricing<ArrowRight size={16} aria-hidden="true" /></Link>
        <Link href="/owners/plans" className={s.secondary}>All Owner Plans</Link>
      </div>
    </Section>

    {/* NRI ──────────────────────────────────────────────────────────────── */}
    <Section id="nri-support" className={h.nri}>
      <Reveal className={h.nriGrid}>
        <div className={h.nriCopy}>
          <span className={s.eyebrow}>Own a Bengaluru Property While Living Abroad?</span>
          <h2>Distance Shouldn’t Mean<br /><em>Losing Control.</em></h2>
          <p className={s.lead}>Whether you’re in the UAE, UK, USA, Singapore or elsewhere, Cypress helps you coordinate tenant management, rent, inspections, maintenance and documentation remotely.</p>
          <div className={s.actions}><Link href="/owners/nri-property-management" className={s.button}>Explore NRI Property Management<ArrowRight size={16} aria-hidden="true" /></Link></div>
        </div>
        <div className={h.remoteVisual}>
          <Image src={nriFlight} alt="View from an aircraft window at sunset" fill sizes="(max-width: 800px) 100vw, 44vw" className={h.remoteImage} />
          <ul className={h.remoteFeatures}>{['Remote property monitoring', 'Rental income tracking', 'Inspection reports', 'Maintenance approvals', 'Digital documentation'].map(text => <li key={text}><Check size={17} aria-hidden="true" />{text}</li>)}</ul>
        </div>
      </Reveal>
    </Section>

    {/* Founder ──────────────────────────────────────────────────────────── */}
    <Section id="founder" className={h.founderSection}>
      <div className={h.founderGrid}>
        <Reveal className={h.founderPhotoWrap}>
          <Image src={founder} alt="Sudish Kumar S, founder of Cypress" width={960} height={906} sizes="(max-width: 600px) 100vw, (max-width: 1000px) 35vw, 320px" className={h.founderPhoto} />
        </Reveal>
        <Reveal delay={0.1}>
          <span className={s.eyebrow}>A Note From Our Founder</span>
          <blockquote className={h.founderQuote}>“I have experienced renting and property ownership firsthand. After spending more than a decade delivering end-to-end enterprise solutions, I wanted to bring that same connected, process-driven approach to property management.”</blockquote>
          <p className={s.attribution}>Sudish Kumar S — Founder<br /><span className={h.founderRole}>Founder, Cypress Property Management Services</span></p>
          <Link href="/about/founder" className={s.textLink}>Why I Started Cypress<ArrowRight size={16} aria-hidden="true" /></Link>
        </Reveal>
        <Reveal delay={0.2} as="div" className={h.founderMotto}><span aria-hidden="true">“</span>Technology<br />for Convenience.<br /><strong>Transparency<br />for Trust.</strong></Reveal>
      </div>
    </Section>

    {/* FAQs ─────────────────────────────────────────────────────────────── */}
    <Section title="Quick Answers for Owners and Tenants." eyebrow="Frequently asked questions" id="faqs" className={`${h.centered} ${h.homeFaqs}`}>
      <Reveal className={s.twoColumns}>
        <details className={h.faqGroup}><summary><House aria-hidden="true" /><span>Owner FAQs<small>Pricing, maintenance, deposits, approvals and more.</small></span></summary><FaqList items={ownerFaqs.slice(0, 4)} /><Link className={s.textLink} href="/owners/faqs">All Owner FAQs<ArrowRight size={16} aria-hidden="true" /></Link></details>
        <details className={h.faqGroup}><summary><Users aria-hidden="true" /><span>Tenant FAQs<small>Renting, maintenance, documents and more.</small></span></summary><FaqList items={tenantFaqs.slice(0, 3)} /><Link className={s.textLink} href="/tenants/faqs">All Tenant FAQs<ArrowRight size={16} aria-hidden="true" /></Link></details>
      </Reveal>
    </Section>

    {/* Closing ──────────────────────────────────────────────────────────── */}
    <Section tone="dark" className={h.closing}>
      <Reveal className={h.closingInner}>
        <div><h2>Ready for Simpler Property Management?</h2><p className={s.lead}>Let Cypress help you manage the everyday details while keeping you informed and involved in important decisions.</p></div>
        <div className={s.actions}>
          <Link href="/owner-inquiry" className={`${s.button} ${h.whiteButton}`}>List Your Property<ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/contact" className={s.secondary}>Talk to Cypress</Link>
        </div>
      </Reveal>
    </Section>
  </div>;
}
