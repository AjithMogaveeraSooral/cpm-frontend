import Link from 'next/link';
import { ArrowRight, Check, FileText, IndianRupee, Minus, Percent, Smartphone } from 'lucide-react';
import { ClosingCTA, PageHero, PlanCards, Section, marketingStyles as s } from '@/components/marketing/sections';
import { PlanCalculator } from '@/components/marketing/plan-calculator';
import { plans } from '@/lib/site-content';
import { pageMetadata } from '@/lib/site-config';
import propertyHero from '../../../../../public/brand/property-hero.webp';
import p from '@/components/marketing/pages.module.css';

export const metadata = pageMetadata('Property Management Plans & Pricing | Cypress', 'Compare Bronze 5%, Silver 10% and Gold 15% property management plans, inclusive of GST. ₹0 onboarding; clear maintenance coverage and exclusions.', '/owners/plans-pricing');

const yes = <Check size={18} className={p.yes} aria-label="Included" />;
const no = <Minus size={18} className={p.dash} aria-label="Not included" />;
const rows: [string, ...React.ReactNode[]][] = [
  ['Onboarding fee', '₹0', '₹0', '₹0'],
  ['Tenant sourcing & screening', yes, yes, yes],
  ['Rent tracking & documentation', yes, yes, yes],
  ['Property visits per year', ...plans.map((plan) => plan.visits)],
  ['Maintenance coordination', ...plans.map((plan) => plan.coverage)],
  ['Maintenance response target', ...plans.map((plan) => `Within ${plan.response}`)],
  ['Property manager', ...plans.map((plan) => plan.manager)],
  ['Owner dashboard access*', yes, yes, yes],
  ['Inspection reports', ...plans.map((plan) => plan.reports)],
  ['Priority support', no, no, yes],
];

export default function PricingPage() {
  return <>
    <PageHero eyebrow="Plans & pricing" title="Simple Plans." accent="Transparent Property Management." description="Choose a plan that suits your needs. All plans include ₹0 onboarding fees, clear services and a dedicated digital platform. No hidden charges." image={propertyHero} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Owners', href: '/owner-services' }, { label: 'Plans & Pricing' }]}>
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

    <Section tone="soft"><PlanCalculator /><p className={s.note}>These figures are illustrative estimates assuming the full rent is received. They do not account for repair costs, taxes, deductions or other obligations.</p></Section>

    <Section eyebrow="Plan comparison" title="Compare Plan Features">
      <div className={s.tableScroll} role="region" aria-label="Plan comparison, scroll horizontally on smaller screens" tabIndex={0}>
        <table className={`${s.table} ${p.compare}`}>
          <caption>Monthly fees are a percentage of monthly rent, inclusive of GST.</caption>
          <thead><tr><th scope="col">Feature</th>{plans.map((plan) => <th key={plan.name} scope="col">{plan.name}<br /><small>{plan.rate} (GST incl.)</small></th>)}</tr></thead>
          <tbody>{rows.map(([label, ...values]) => <tr key={label}><th scope="row">{label}</th>{values.map((value, index) => <td key={plans[index].name}>{value}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className={s.note}><strong>Response target, not a completion guarantee:</strong> the 72 / 48 / 24-hour targets describe maintenance response, not the time to finish a repair. Coverage and authorization conditions are governed by your service agreement.</p>
      <p className={s.note}>*Dashboard access is included; individual workflows and records depend on the application release, your selected plan and available property information.</p>
    </Section>

    <Section title="Maintenance Coverage Options" tone="soft">
      <div className={s.grid}>{plans.map((plan) => <article className={s.card} key={plan.name}><h3>{plan.name} — {plan.name === 'Bronze' ? 'Owner-Funded Maintenance' : plan.name === 'Silver' ? 'Flexible Maintenance Coverage' : 'Comprehensive Property Care'}</h3><p>{plan.description}</p></article>)}</div>
      <p className={s.note}>No plan promises unlimited repairs or unrestricted replacement of expensive equipment. Check the signed coverage schedule for eligible repairs, limits and approval conditions.</p>
    </Section>

    <Section title="What’s Not Automatically Included?">
      <p className={s.lead}>Unless expressly covered by the selected plan, expenses such as property taxes, association dues, utilities, major structural repairs, renovations, tenant-caused damage and legal proceedings are separate.</p>
      <p className={s.note}>Detailed exclusions and approval conditions will be provided in the applicable service agreement.</p>
      <div className={s.actions}><Link href="/owners/faqs" className={s.secondary}>View FAQs<ArrowRight size={16} aria-hidden="true" /></Link></div>
    </Section>

    <ClosingCTA title="Ready to Get Started?" description="Tell us about your property and explore a management plan that suits your needs." />
  </>;
}
