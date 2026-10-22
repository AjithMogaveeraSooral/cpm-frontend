import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Check, ChevronRight, ClipboardCheck, Crown, FileText, House, KeyRound, Tag, Trees, Users, Wallet, Wrench } from 'lucide-react';
import { plans, planFeatures, services, serviceOfferings, type FAQ } from '@/lib/site-content';
import s from './marketing.module.css';

export { default as marketingStyles } from './marketing.module.css';

export function Actions({ ownerLabel = 'List Your Property', secondaryLabel = 'Tenant Inquiry', secondaryHref = '/tenant-inquiry' }: { ownerLabel?: string; secondaryLabel?: string; secondaryHref?: string }) {
  return <div className={s.actions}><Link href="/owner-inquiry" className={s.button}>{ownerLabel}<ArrowRight size={16} aria-hidden="true" /></Link><Link href={secondaryHref} className={s.secondary}>{secondaryLabel}<ArrowRight size={16} aria-hidden="true" /></Link></div>;
}

export type Crumb = { label: string; href?: string };

export function PageHero({ eyebrow, title, accent, description, image, breadcrumbs, children }: { eyebrow: string; title: string; accent?: string; description: string; image?: StaticImageData; breadcrumbs?: Crumb[]; children?: React.ReactNode }) {
  return <section className={s.hero}>
    {image && <div className={s.heroArt} aria-hidden="true"><Image src={image} alt="" fill sizes="(max-width: 800px) 0px, 50vw" priority className={s.heroImg} /></div>}
    <div className={s.container}>
      {breadcrumbs && <nav aria-label="Breadcrumb"><ol className={s.breadcrumb}>{breadcrumbs.map((crumb) => <li key={crumb.label}>{crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}</li>)}</ol></nav>}
      <span className={s.eyebrow}>{eyebrow}</span>
      <h1>{title}{accent && <>{' '}<em>{accent}</em></>}</h1>
      <p>{description}</p>
      {children}
    </div>
  </section>;
}

export function Section({ title, eyebrow, children, tone, id, className = '' }: { title?: string; eyebrow?: string; children: React.ReactNode; tone?: 'soft' | 'dark'; id?: string; className?: string }) {
  return <section id={id} className={`${s.section} ${tone ? s[tone] : ''} ${className}`}><div className={s.container}>{eyebrow && <span className={s.eyebrow}>{eyebrow}</span>}{title && <h2>{title}</h2>}{children}</div></section>;
}

const serviceIcons = [Users, Wallet, Wrench, ClipboardCheck, FileText, Building2];

export function Services() {
  return <div className={s.grid}>{services.map((service, index) => {
    const Icon = serviceIcons[index] ?? KeyRound;
    return <article className={s.card} key={service.title}><div className={s.cardIcon}><Icon size={22} aria-hidden="true" /></div><h3>{service.title}</h3><p>{service.text}</p></article>;
  })}</div>;
}

const offeringIcons = { Building2, Users, House, Trees, Tag } as const;

export function ServiceOfferings() {
  return <div className={s.grid}>{serviceOfferings.map((offering) => {
    const Icon = offeringIcons[offering.icon as keyof typeof offeringIcons] ?? Building2;
    return <article className={s.card} key={offering.title}>
      <div className={s.cardIcon}><Icon size={22} aria-hidden="true" /></div>
      <span className={s.eyebrow}>{offering.audience}</span>
      <h3>{offering.title}</h3>
      <p>{offering.text}</p>
      <div className="mt-6"><Link href={offering.href} className={s.textLink}>{offering.cta}<ArrowRight size={16} aria-hidden="true" /></Link></div>
    </article>;
  })}</div>;
}

const planIcons = {
  bronze: House,
  silver: Building2,
  gold: Crown,
} as const;

export function PlanCards({ detailed = false }: { detailed?: boolean }) {
  return <div className={s.grid}>{plans.map((plan) => {
    const slug = plan.name.toLowerCase() as keyof typeof planIcons;
    const PlanIcon = planIcons[slug];
    const bullets = detailed
      ? planFeatures[plan.name]
      : plan.name === 'Bronze'
        ? ['Essential management', 'Up to 2 visits/year', '72-hour response']
        : plan.name === 'Silver'
          ? ['Enhanced property care', 'Up to 4 visits/year', '48-hour response']
          : ['Comprehensive management', 'Up to 6 visits/year', '24-hour response'];

    return <article className={`${s.card} ${s.planCard}`} data-plan={slug} key={plan.name}>
      {plan.name === 'Gold' && <span className={s.popular}>Most Popular</span>}
      {detailed && PlanIcon && (
        <div className={s.planCornerIcon}>
          <PlanIcon size={22} aria-hidden="true" />
        </div>
      )}
      <div className={s.planHeaderRow}>
        <h3>{plan.name}</h3>
        {!detailed && <ChevronRight size={18} className={s.planChevron} aria-hidden="true" />}
      </div>
      {detailed && <span className={s.eyebrow}>{plan.subtitle}</span>}
      <div className={s.rateRow}>
        <span className={s.rate}>{plan.rate}</span>
        <span>of monthly rent<br />GST included</span>
      </div>
      <ul className={s.planDetails}>{bullets.map((item) => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul>
      <div className="mt-6">{detailed
        ? <Link href={`/owner-inquiry?plan=${slug}`} className={`${s.secondary} ${s.fullWidth}`}>Choose {plan.name}<ArrowRight size={16} aria-hidden="true" /></Link>
        : <Link href="/owners/plans-pricing" className={`${s.secondary} ${s.fullWidth}`}>View Plan Details</Link>}</div>
    </article>;
  })}</div>;
}


export function FaqList({ items }: { items: FAQ[] }) {
  return <div className={s.faq}>{items.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>;
}

export function ClosingCTA({ title = 'Ready for Simpler Property Management?', description = 'Let Cypress help you manage the everyday details while keeping you informed and involved in important decisions.' }: { title?: string; description?: string }) {
  return <Section tone="dark"><div className={s.ctaBand}><div><h2>{title}</h2><p className={s.lead}>{description}</p></div><Actions secondaryHref="/contact" secondaryLabel="Talk to Cypress" /></div></Section>;
}
