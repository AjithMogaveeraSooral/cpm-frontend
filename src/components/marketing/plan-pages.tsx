import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Check, CircleAlert, Crown, Info, Minus, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Section, marketingStyles as s } from './sections';
import { Reveal, Stagger, StaggerItem } from './motion';
import { endToEndComparison, endToEndExclusions, goldIncludedReplacements, planBySlug, planCatalog, planGroups, planHref, plansInGroup, tierUpgrades, type PlanDetail, type PlanSlug } from '@/lib/plan-catalog';
import { pageMetadata } from '@/lib/site-config';
import heroLiving from '../../../public/brand/hd-hero-living.webp';
import heroVilla from '../../../public/brand/hd-hero-villa.webp';
import plansLoft from '../../../public/brand/hd-plans-loft.webp';
import rentalCare from '../../../public/brand/hd-rental-care.webp';
import homeGuardian from '../../../public/brand/hd-home-guardian.webp';
import landGuardian from '../../../public/brand/hd-land-guardian.webp';
import propertySales from '../../../public/brand/hd-property-sales.webp';
import p from './plans.module.css';

const images: Record<PlanDetail['image'], StaticImageData> = { living: heroLiving, villa: heroVilla, loft: plansLoft, rental: rentalCare, home: homeGuardian, land: landGuardian, sales: propertySales };

export function planMetadata(slug: PlanSlug) {
  const plan = planBySlug(slug);
  return pageMetadata(`${plan.name} | Cypress Property Management`, `${plan.tagline}. ${plan.summary}`, planHref(slug));
}

function inquiryHref(plan: PlanDetail) {
  return plan.inquiryPlan ? `/owner-inquiry?plan=${encodeURIComponent(plan.inquiryPlan)}` : '/owner-inquiry';
}

/* ── Bronze / Silver / Gold comparison with upgrade highlighting ─────────── */

export function EndToEndComparison({ focus, caption = 'Bronze, Silver and Gold compared' }: { focus?: 'bronze' | 'silver' | 'gold'; caption?: string }) {
  const tiers = ['bronze', 'silver', 'gold'] as const;
  const names = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' };
  const rates = { bronze: '5% of rent', silver: '10% of rent', gold: '15% of rent' };
  return <div className={p.compareWrap}>
    <div className={s.tableScroll} role="region" aria-label="Plan comparison, scroll horizontally on smaller screens" tabIndex={0}>
      <table className={`${s.table} ${p.compare}`}>
        <caption className="sr-only">{caption}</caption>
        <thead><tr><th scope="col">Feature</th>{tiers.map((tier) => <th key={tier} scope="col" className={`${p.tierHead} ${focus === tier ? p.focus : ''}`}>{names[tier]}<small>{rates[tier]} · GST incl.</small></th>)}</tr></thead>
        <tbody>{endToEndComparison.map((row) => {
          const gains = row.upgrade === 'both' ? ['silver', 'gold'] : row.upgrade ? [row.upgrade] : [];
          return <tr key={row.feature}>
            <th scope="row">{row.feature}</th>
            {tiers.map((tier) => {
              const value = row[tier];
              const gain = gains.includes(tier);
              const content = value === '—' ? <Minus size={18} aria-label="Not included" /> : value === 'Included' ? <><Check size={18} className={p.yes} aria-hidden="true" /> Included</> : value;
              return <td key={tier} className={`${gain ? p.gain : ''} ${focus === tier ? p.focus : ''}`}>{content}{gain && <span className={p.gainTag}>{tier === 'silver' ? 'Silver extra' : 'Gold extra'}</span>}</td>;
            })}
          </tr>;
        })}</tbody>
      </table>
    </div>
    <div className={p.legend}>
      <span><i className={p.legendSwatch} aria-hidden="true" /> Highlighted cells show what the tier adds over the one before it</span>
      <span><Check size={15} className={p.yes} aria-hidden="true" /> Included in the plan</span>
      <span><Minus size={15} aria-hidden="true" /> Not included</span>
    </div>
  </div>;
}

export function TierUpgrades() {
  const silver = tierUpgrades('silver');
  const gold = tierUpgrades('gold');
  return <div className={p.upgrades}>
    <Reveal className={`${p.upgrade} ${p.silverUp}`}>
      <span className={p.badge}><Sparkles size={14} aria-hidden="true" />Bronze → Silver</span>
      <h3>What Silver adds over Bronze</h3>
      <ul>{silver.map((row) => <li key={row.feature}><BadgeCheck size={20} aria-hidden="true" /><span><strong>{row.silver}</strong><small>{row.feature} · Bronze: {row.bronze}</small></span></li>)}</ul>
    </Reveal>
    <Reveal delay={0.12} className={`${p.upgrade} ${p.goldUp}`}>
      <span className={p.badge}><Crown size={14} aria-hidden="true" className={p.goldUpIcon} />Silver → Gold</span>
      <h3>What Gold adds over Silver</h3>
      <ul>{gold.map((row) => <li key={row.feature}><BadgeCheck size={20} aria-hidden="true" /><span><strong>{row.gold}</strong><small>{row.feature} · Silver: {row.silver}</small></span></li>)}</ul>
    </Reveal>
  </div>;
}

/* ── Overview tiles ──────────────────────────────────────────────────────── */

function PlanTile({ plan, featured = false }: { plan: PlanDetail; featured?: boolean }) {
  return <StaggerItem as="article" className={`${p.planTile} ${featured ? p.featuredTile : ''}`}>
    <div className={p.tileImage}>
      <Image src={images[plan.image]} alt="" fill sizes="(max-width: 560px) 100vw, (max-width: 1000px) 50vw, 33vw" />
      <span className={p.tileBadge}>{plan.shortName}</span>
      {featured && <span className={p.featured}>Most Popular</span>}
    </div>
    <div className={p.tileBody}>
      <h3>{plan.name}</h3>
      <div className={p.tilePrice}><strong>{plan.price}</strong><span>{plan.priceNote}</span></div>
      <p>{plan.tagline}. {plan.audience}</p>
      <ul>{plan.highlights.slice(0, 3).map((item) => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul>
      <Link href={planHref(plan.slug)} className={`${s.secondary} ${s.fullWidth}`}>Explore {plan.shortName}<ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  </StaggerItem>;
}

export function PlansOverview() {
  const [endToEnd, specialised] = planGroups;
  return <>
    <section className={p.hero}>
      <Image src={heroVilla} alt="" fill priority sizes="100vw" className={p.heroImage} />
      <div className={p.heroShade} aria-hidden="true" />
      <div className={`${s.container} ${p.heroInner}`}>
        <div>
          <ol className={p.heroBreadcrumb}><li><Link href="/">Home</Link></li><li><Link href="/owner-services">Owners</Link></li><li><span aria-current="page">All Plans</span></li></ol>
          <span className={`${s.eyebrow} ${p.eyebrowLight}`}>Owner plans</span>
          <h1>Every Property Situation.<br /><em>One Transparent Plan for It.</em></h1>
          <p className={p.heroText}>From full end-to-end management of a rented home to looking after a vacant plot, every Cypress plan is priced clearly, delivered through the same connected platform and documented in your owner dashboard.</p>
          <ul className={p.heroHighlights}>
            {['₹0 onboarding on Bronze, Silver and Gold', 'GST-inclusive management fees', 'Owner approvals before any chargeable work', 'Digital records, reports and statements'].map((item) => <li key={item}><ShieldCheck size={18} aria-hidden="true" />{item}</li>)}
          </ul>
        </div>
        <div className={p.priceCard}>
          <small>Not sure which plan?</small>
          <span className={p.price}>Talk to us</span>
          <p className={p.priceNote}>Share your property details and Cypress will recommend the right plan — with every inclusion and exclusion explained before you sign.</p>
          <div className={p.cta}>
            <Link href="/owner-inquiry" className={s.button}>List Your Property<ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/owners/plans-pricing" className={s.secondary}>Compare Bronze, Silver &amp; Gold</Link>
          </div>
        </div>
      </div>
    </section>

    <Section id="end-to-end" eyebrow={endToEnd.eyebrow} title={endToEnd.title}>
      <p className={s.lead}>{endToEnd.text}</p>
      <Stagger className={p.planGrid}>{plansInGroup('end-to-end').map((plan) => <PlanTile key={plan.slug} plan={plan} featured={plan.slug === 'gold'} />)}</Stagger>
      <Reveal><TierUpgrades /></Reveal>
    </Section>

    <Section tone="soft" eyebrow="Side by side" title="Compare Bronze, Silver and Gold" className={p.center}>
      <p className={s.lead}>Highlighted cells show exactly what you gain as you move up a tier. Response targets are service-level targets, not repair-completion guarantees.</p>
      <EndToEndComparison />
    </Section>

    <Section id="specialised" eyebrow={specialised.eyebrow} title={specialised.title}>
      <p className={s.lead}>{specialised.text}</p>
      <Stagger className={`${p.planGrid} ${p.four}`}>{plansInGroup('specialised').map((plan) => <PlanTile key={plan.slug} plan={plan} />)}</Stagger>
      <ul className={p.notes}>
        <li><Info size={18} aria-hidden="true" />Specialised plan prices are indicative and confirmed, with applicable GST, in your signed service agreement.</li>
        <li><Info size={18} aria-hidden="true" />Rent tracking is not a rent guarantee; Home Guardian and Land Guardian do not provide security or encroachment guarantees.</li>
      </ul>
    </Section>

    <Section tone="dark">
      <div className={s.ctaBand}>
        <div><h2>Ready to Choose a Plan?</h2><p className={s.lead}>Tell us about your property. Cypress will walk you through the plan that fits and share the full coverage schedule before you commit.</p></div>
        <div className={s.actions}><Link href="/owner-inquiry" className={s.button}>List Your Property<ArrowRight size={16} aria-hidden="true" /></Link><Link href="/contact" className={s.secondary}>Talk to Cypress</Link></div>
      </div>
    </Section>
  </>;
}

/* ── Individual plan detail page ─────────────────────────────────────────── */

export function PlanDetailPage({ slug }: { slug: PlanSlug }) {
  const plan = planBySlug(slug);
  const endToEnd = plan.group === 'end-to-end';
  const siblings = plansInGroup(plan.group);
  const groupTitle = planGroups.find((group) => group.id === plan.group)?.title ?? 'Owner plans';

  return <>
    <section className={p.hero}>
      <Image src={images[plan.image]} alt="" fill priority sizes="100vw" className={p.heroImage} />
      <div className={p.heroShade} aria-hidden="true" />
      <div className={`${s.container} ${p.heroInner}`}>
        <div>
          <ol className={p.heroBreadcrumb}><li><Link href="/">Home</Link></li><li><Link href="/owners/plans">All Plans</Link></li><li><span aria-current="page">{plan.shortName}</span></li></ol>
          <span className={`${s.eyebrow} ${p.eyebrowLight}`}>{groupTitle}</span>
          <h1>{plan.name}<br /><em>{plan.tagline}.</em></h1>
          <p className={p.heroText}>{plan.summary}</p>
          <ul className={p.heroHighlights}>{plan.highlights.map((item) => <li key={item}><Check size={18} aria-hidden="true" />{item}</li>)}</ul>
        </div>
        <div className={p.priceCard}>
          <small>{endToEnd ? 'Management fee' : 'Indicative pricing'}</small>
          <span className={p.price}>{plan.price}</span>
          <p className={p.priceNote}>{plan.priceNote}</p>
          <div className={p.cta}>
            <Link href={inquiryHref(plan)} className={s.button}>Choose {plan.shortName}<ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/contact" className={s.secondary}>Ask a Question</Link>
          </div>
        </div>
      </div>
    </section>

    <Section eyebrow="Who it is for" title={plan.tagline}>
      <Reveal>
        <p className={p.lede}>{plan.summary}</p>
        <div className={p.audience}><Users size={20} aria-hidden="true" /><span>{plan.audience}</span></div>
      </Reveal>
      {plan.tiers && <>
        <div className={p.tiers}>{plan.tiers.map((tier, index) => <Reveal key={tier.name} delay={index * 0.08} className={p.tier}><strong>{tier.name}</strong><span className={p.tierPrice}>{tier.price}</span><span className={p.tierCadence}>{tier.cadence}</span><p>{tier.detail}</p></Reveal>)}</div>
      </>}
    </Section>

    <Section tone="soft" eyebrow="Coverage" title={`What ${plan.shortName} includes — and what it does not`}>
      <div className={p.columns}>
        <Reveal className={p.panel}>
          <h3><Check size={22} aria-hidden="true" />Included</h3>
          <ul className={p.list}>{plan.included.map((item) => <li key={item}><Check size={18} className={p.yes} aria-hidden="true" />{item}</li>)}</ul>
        </Reveal>
        <Reveal delay={0.1} className={`${p.panel} ${p.excluded}`}>
          <h3><CircleAlert size={22} aria-hidden="true" />Not included</h3>
          <ul className={p.list}>{plan.excluded.map((item) => <li key={item}><Minus size={18} className={p.no} aria-hidden="true" />{item}</li>)}</ul>
        </Reveal>
      </div>
      {slug === 'gold' && <Reveal className={p.panel} delay={0.1} style={{ marginTop: 28 }}>
        <h3><Crown size={22} aria-hidden="true" />Standard replacements covered under Gold</h3>
        <p className={s.note} style={{ marginTop: 8 }}>Like-for-like standard items replaced without a separate approval, subject to the signed coverage schedule and its per-incident and annual limits.</p>
        <ul className={p.list}>{goldIncludedReplacements.map((item) => <li key={item}><Check size={18} className={p.yes} aria-hidden="true" />{item}</li>)}</ul>
      </Reveal>}
      <ul className={p.notes}>{plan.notes.map((note) => <li key={note}><Info size={18} aria-hidden="true" />{note}</li>)}</ul>
    </Section>

    <Section eyebrow="How it works" title={`${plan.shortName} in four steps`} className={p.center}>
      <Stagger as="ol" className={p.steps}>{plan.steps.map((step) => <StaggerItem as="li" key={step.title}><h3>{step.title}</h3><p>{step.text}</p></StaggerItem>)}</Stagger>
    </Section>

    {endToEnd && <>
      <Section tone="soft" eyebrow="Compare" title={slug === 'bronze' ? 'See what Silver and Gold add' : slug === 'silver' ? 'How Silver compares with Bronze and Gold' : 'Everything Gold adds over Silver and Bronze'} className={p.center}>
        <p className={s.lead}>Highlighted cells show what each tier adds over the previous one. The {plan.shortName} column is outlined.</p>
        <EndToEndComparison focus={slug as 'bronze' | 'silver' | 'gold'} />
        <Reveal><TierUpgrades /></Reveal>
      </Section>
      <Section eyebrow="Exclusions" title="Outside every End-to-End plan">
        <p className={s.lead}>Cypress still coordinates and quotes this work for your approval — the cost is simply not absorbed by any plan.</p>
        <ul className={`${p.list} ${s.twoColumns}`} style={{ marginTop: 28 }}>{endToEndExclusions.map((item) => <li key={item}><Minus size={18} className={p.no} aria-hidden="true" />{item}</li>)}</ul>
      </Section>
    </>}

    <Section tone="soft" eyebrow="Other plans" title={`More ${endToEnd ? 'End-to-End' : 'specialised'} plans`}>
      <nav aria-label="Related plans" className={p.siblingNav}>
        {siblings.map((sibling) => <Link key={sibling.slug} href={planHref(sibling.slug)} aria-current={sibling.slug === slug ? 'page' : undefined}><strong>{sibling.name}</strong><span>{sibling.tagline} · {sibling.price}</span></Link>)}
      </nav>
      <div className={s.actions}><Link href="/owners/plans" className={s.textLink}>View all owner plans<ArrowRight size={16} aria-hidden="true" /></Link></div>
    </Section>

    <Section tone="dark">
      <div className={s.ctaBand}>
        <div><h2>Start with {plan.shortName}</h2><p className={s.lead}>Share your property details and Cypress will confirm the plan, coverage schedule and next steps — nothing is charged until you agree.</p></div>
        <div className={s.actions}><Link href={inquiryHref(plan)} className={s.button}>Choose {plan.shortName}<ArrowRight size={16} aria-hidden="true" /></Link><Link href="/contact" className={s.secondary}>Talk to Cypress</Link></div>
      </div>
    </Section>
  </>;
}

export const allPlanSlugs = planCatalog.map((plan) => plan.slug);
