import Link from 'next/link';
import { ArrowRight, Building2, ClipboardCheck, FileText, House, KeyRound, Tag, Trees, Users, Wallet, Wrench } from 'lucide-react';
import { plans, services, serviceOfferings, type FAQ } from '@/lib/site-content';
import s from './marketing.module.css';

export { default as marketingStyles } from './marketing.module.css';

export function Actions({ ownerLabel = 'List Your Property', secondaryLabel = 'Tenant Inquiry', secondaryHref = '/tenant-inquiry' }: { ownerLabel?: string; secondaryLabel?: string; secondaryHref?: string }) {
  return <div className={s.actions}><Link href="/owner-inquiry" className={s.button}>{ownerLabel}<ArrowRight size={16} aria-hidden="true" /></Link><Link href={secondaryHref} className={s.secondary}>{secondaryLabel}</Link></div>;
}

export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <section className={s.hero}><div className={s.container}><span className={s.eyebrow}>{eyebrow}</span><h1>{title}</h1><p>{description}</p>{children}</div></section>;
}

export function Section({ title, eyebrow, children, tone, id, className = '' }: { title?: string; eyebrow?: string; children: React.ReactNode; tone?: 'soft' | 'dark'; id?: string; className?: string }) {
  return <section id={id} className={`${s.section} ${tone ? s[tone] : ''} ${className}`}><div className={s.container}>{eyebrow && <span className={s.eyebrow}>{eyebrow}</span>}{title && <h2>{title}</h2>}{children}</div></section>;
}

const serviceIcons = [KeyRound, Wallet, Wrench, ClipboardCheck, FileText, Building2];

export function Services() {
  return <div className={s.grid}>{services.map((service, index) => {
    const Icon = serviceIcons[index];
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

export function PlanCards() {
  return <div className={s.grid}>{plans.map((plan) => <article className={`${s.card} ${s.planCard}`} data-plan={plan.name.toLowerCase()} key={plan.name}><span className={s.eyebrow}>{plan.subtitle}</span><h3>{plan.name}</h3><div className={s.rate}>{plan.rate}</div><p>of monthly rent · GST included</p><ul className={s.planDetails}><li>₹0 onboarding fees</li><li>{plan.manager}</li><li>{plan.visits} site visits per year</li><li>{plan.response} maintenance response target</li></ul><div className="mt-6"><Link href="/owners/plans-pricing" className={s.textLink}>Compare {plan.name} coverage<ArrowRight size={16} aria-hidden="true" /></Link></div></article>)}</div>;
}

export function FaqList({ items }: { items: FAQ[] }) {
  return <div className={s.faq}>{items.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>;
}

export function ClosingCTA({ title = 'Ready for Simpler Property Management?', description = 'Let Cypress help you manage the everyday details while keeping you informed and involved in important decisions.' }: { title?: string; description?: string }) {
  return <Section title={title} tone="dark"><p className={s.lead}>{description}</p><Actions secondaryHref="/contact" secondaryLabel="Talk to Cypress" /></Section>;
}