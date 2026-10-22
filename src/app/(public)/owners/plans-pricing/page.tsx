import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, FileText, HelpCircle, IndianRupee, Minus, Percent, Smartphone } from 'lucide-react';
import { PageHero, PlanCards, Section, marketingStyles as s } from '@/components/marketing/sections';
import { PlanCalculator } from '@/components/marketing/plan-calculator';
import { plans } from '@/lib/site-content';
import { pageMetadata } from '@/lib/site-config';
import pricingHero from '../../../../../public/brand/pricing-hero.webp';
import p from '@/components/marketing/pages.module.css';

export const metadata = pageMetadata('Property Management Plans & Pricing | Cypress', 'Compare Bronze 5%, Silver 10% and Gold 15% property management plans, inclusive of GST. ₹0 onboarding; clear maintenance coverage and exclusions.', '/owners/plans-pricing');

const yes = <Check size={18} className={p.yes} aria-label="Included" />;
const no = <Minus size={18} className={p.dash} aria-label="Not included" />;
const rows: [string, ...React.ReactNode[]][] = [
  ['Onboarding Fee', '₹0', '₹0', '₹0'],
  ['Tenant Sourcing & Screening', yes, yes, yes],
  ['Rent Tracking & Documentation', yes, yes, yes],
  ['Property Visits per Year', 'Up to 2', 'Up to 4', 'Up to 6'],
  ['Maintenance Coordination', 'Owner-funded', 'Selectable option', 'All-inclusive option'],
  ['Maintenance Response (Initial)', 'Within 72 hours', 'Within 48 hours', 'Within 24 hours'],
  ['Dedicated Property Manager', '—', yes, yes],
  ['Owner Dashboard Access', yes, yes, yes],
  ['Inspection Reports (Photos)', yes, yes, yes],
  ['Priority Support', '—', '—', yes],
];

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
      <p className={s.lead}>All plans are designed to give you a well-managed, well-maintained property with complete visibility.</p>
      <PlanCards detailed />
    </Section>

    <Section tone="soft">
      <PlanCalculator />
    </Section>

    <Section eyebrow="Plan comparison" title="Compare Plan Features">
      <div className={p.compareLegend}>
        <span><Check size={15} className={p.yes} aria-hidden="true" /> Included</span>
        <span><Minus size={15} className={p.dash} aria-hidden="true" /> Not included</span>
        <span><span className={p.dotOpt} /> Optional / Plan specific</span>
      </div>
      <div className={s.tableScroll} role="region" aria-label="Plan comparison, scroll horizontally on smaller screens" tabIndex={0}>
        <table className={`${s.table} ${p.compare}`}>
          <thead><tr><th scope="col">Feature</th>{plans.map((plan) => <th key={plan.name} scope="col">{plan.name}<br /><small>{plan.rate} (GST incl.)</small></th>)}</tr></thead>
          <tbody>{rows.map(([label, ...values]) => <tr key={label}><th scope="row">{label}</th>{values.map((value, index) => <td key={plans[index].name}>{value}</td>)}</tr>)}</tbody>
        </table>
      </div>
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

