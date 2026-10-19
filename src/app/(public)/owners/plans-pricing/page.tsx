import { Actions, PageHero, PlanCards, Section, marketingStyles as s } from '@/components/marketing/sections';
import { plans } from '@/lib/site-content';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('Property Management Plans & Pricing | Cypress', 'Compare Bronze 5%, Silver 10% and Gold 15% property management plans, inclusive of GST. ₹0 onboarding; clear maintenance coverage and exclusions.', '/owners/plans-pricing');

const rows = [
  ['Monthly management fee', ...plans.map((p) => p.rate)],
  ['GST', 'Included', 'Included', 'Included'],
  ['Onboarding fee', '₹0', '₹0', '₹0'],
  ['Tenant sourcing and screening', 'Included', 'Included', 'Included'],
  ['Rent tracking and documentation', 'Included', 'Included', 'Included'],
  ['Management contact', ...plans.map((p) => p.manager)],
  ['Site visits per year', ...plans.map((p) => p.visits)],
  ['Inspection reports', ...plans.map((p) => p.reports)],
  ['Maintenance response target', ...plans.map((p) => p.response)],
  ['Maintenance coverage', ...plans.map((p) => p.coverage)],
  ['Owner dashboard', 'Included*', 'Included*', 'Included*'],
  ['Tenant dashboard', 'Included*', 'Included*', 'Included*'],
];

export default function PricingPage() {
  return <>
    <PageHero eyebrow="Plans & pricing" title="Straightforward Pricing. Flexible Property Care." description="No onboarding fees. Three service levels. One connected property-management experience."><Actions ownerLabel="Get Started — ₹0 Onboarding" secondaryHref="/owners/faqs" secondaryLabel="Owner FAQs" /></PageHero>
    <Section title="Choose the Level of Care Your Property Needs."><PlanCards /></Section>
    <Section title="Compare Plans & Coverage" tone="soft">
      <div className={s.tableScroll} role="region" aria-label="Plan comparison, scroll horizontally on smaller screens" tabIndex={0}>
        <table className={s.table}>
          <caption>Monthly fees are a percentage of monthly rent, inclusive of GST.</caption>
          <thead><tr><th scope="col">Features</th>{plans.map((p) => <th key={p.name} scope="col">{p.name}</th>)}</tr></thead>
          <tbody>{rows.map(([label, ...values]) => <tr key={label}><th scope="row">{label}</th>{values.map((value, index) => <td key={plans[index].name}>{value}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className={s.note}><strong>Response SLA, not a completion guarantee:</strong> the 72 / 48 / 24-hour targets describe maintenance response, not the time to finish a repair. Coverage and authorization conditions are governed by your service agreement.</p>
      <p className={s.note}>*Dashboard access is included; individual workflows and records depend on the application release, your selected plan and available property information.</p>
    </Section>
    <Section title="Maintenance Coverage Options">
      <div className={s.grid}>{plans.map((plan) => <article className={s.card} key={plan.name}><h3>{plan.name} — {plan.name === 'Bronze' ? 'Owner-Funded Maintenance' : plan.name === 'Silver' ? 'Flexible Maintenance Coverage' : 'Comprehensive Property Care'}</h3><p>{plan.description}</p></article>)}</div>
      <p className={s.note}>No plan promises unlimited repairs or unrestricted replacement of expensive equipment. Check the signed coverage schedule for eligible repairs, limits and approval conditions.</p>
    </Section>
    <Section title="Example: ₹30,000 Monthly Rent" tone="soft">
      <div className={s.tableScroll} role="region" aria-label="Monthly fee illustration, scroll horizontally on smaller screens" tabIndex={0}>
        <table className={s.table}><caption>Illustration assuming the full rent is received.</caption><thead><tr><th scope="col">Plan</th><th scope="col">Cypress fee, including GST</th><th scope="col">Balance before other deductions</th></tr></thead><tbody>{plans.map((p) => <tr key={p.name}><th scope="row">{p.name}</th><td>{p.fee}</td><td>{p.balance}</td></tr>)}</tbody></table>
      </div>
      <p className={s.note}>These balances are illustrative. They do not account for repair costs, taxes, deductions or other obligations.</p>
    </Section>
    <Section title="What’s Not Automatically Included?">
      <p className={s.lead}>Unless expressly covered by the selected plan, expenses such as property taxes, association dues, utilities, major structural repairs, renovations, tenant-caused damage and legal proceedings are separate.</p>
      <p className={s.note}>Detailed exclusions and approval conditions will be provided in the applicable service agreement.</p>
      <Actions ownerLabel="Get Started — ₹0 Onboarding" secondaryLabel="Discuss Coverage" secondaryHref="/contact" />
    </Section>
  </>;
}