import Link from 'next/link';
import { ArrowRight, ChevronDown, FileText, HelpCircle, IndianRupee, Percent, Smartphone } from 'lucide-react';
import { PageHero, PlanCards, Section, marketingStyles as s } from '@/components/marketing/sections';
import { PlanCalculator } from '@/components/marketing/plan-calculator';
import { EndToEndComparison, TierUpgrades } from '@/components/marketing/plan-pages';
import { pageMetadata } from '@/lib/site-config';
import pricingHero from '../../../../../public/brand/hd-plans-loft.webp';
import p from '@/components/marketing/pages.module.css';

export const metadata = pageMetadata('Property Management Plans & Pricing | Cypress', 'Compare Bronze 5%, Silver 10% and Gold 15% property management plans, inclusive of GST. ₹0 onboarding; clear maintenance coverage and exclusions.', '/owners/plans-pricing');

export default function PricingPage() {
  return <>
    <PageHero eyebrow="Plans & pricing" title="Simple Plans." accent="Transparent Property Management." description="Choose a plan that suits your needs. All plans include ₹0 onboarding fees, clear services and a dedicated digital platform. No hidden charges." image={pricingHero} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Owners', href: '/owner-services' }, { label: 'Plans & Pricing' }]}>
      <ul className={p.heroBadges}>
        <li><IndianRupee aria-hidden="true" /><span>₹0<br />Onboarding Fees</span></li>
        <li><FileText aria-hidden="true" /><span>Clear Service<br />Inclusions</span></li>
        <li><Percent aria-hidden="true" /><span>GST Included<br />in All Plans</span></li>
        <li><Smartphone aria-hidden="true" /><span>App-Based<br />Management</span></li>
      </ul>
    </PageHero>

    <Section eyebrow="Our plans" title="Choose the Right Care for Your Property" className={p.centerHead}>
      <p className={s.lead}>All plans are designed to give you a well-managed, well-maintained property with complete visibility. Explore each plan in detail, or see every Cypress owner plan — including Rental Care, Home Guardian, Land Guardian and Property Sales.</p>
      <PlanCards detailed />
      <div className={s.actions} style={{ justifyContent: 'center' }}>
        <Link href="/owners/plans" className={s.textLink}>View all owner plans<ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </Section>

    <Section tone="soft">
      <PlanCalculator />
    </Section>

    <Section eyebrow="Plan comparison" title="Compare Plan Features">
      <p className={s.lead}>Highlighted cells show exactly what Silver adds over Bronze and what Gold adds over Silver. Response targets are service-level targets, not repair-completion guarantees.</p>
      <EndToEndComparison />
      <TierUpgrades />
    </Section>

    <Section tone="soft">
      <div className={p.faqCtaCard}>
        <div>
          <span className={s.eyebrow}>Common Questions</span>
          <h2>Frequently Asked Questions</h2>
          <p className={s.lead}>Quick answers about pricing, inclusions, maintenance and more.</p>
        </div>
        <Link href="/owners/faqs" className={p.faqButton}>
          <HelpCircle size={18} aria-hidden="true" />
          <span>View FAQs</span>
          <ChevronDown size={18} aria-hidden="true" />
        </Link>
      </div>
    </Section>

    <Section tone="dark" className={p.plansClosing}>
      <div>
        <h2>Ready to Get Started?</h2>
        <p className={s.lead}>Tell us about your property and explore a management plan that suits your needs.</p>
      </div>
      <div className={s.actions}>
        <Link href="/owner-inquiry" className={`${s.button} ${p.whiteBtn}`}>List Your Property<ArrowRight size={16} aria-hidden="true" /></Link>
        <Link href="/contact" className={`${s.secondary} ${p.darkBtn}`}>Talk to Cypress</Link>
      </div>
    </Section>
  </>;
}

