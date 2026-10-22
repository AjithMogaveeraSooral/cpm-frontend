import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Camera, FileText, Headphones, Mail, MessageCircle, Phone, Receipt, Wrench } from 'lucide-react';
import { siteConfig, whatsappUrl } from '@/lib/site-config';
import { ownerFaqs, tenantFaqs } from '@/lib/site-content';
import { FaqExplorer } from './faq-explorer';
import { ClosingCTA, PageHero, Section, marketingStyles as s } from './sections';
import faqHero from '../../../public/brand/faq-hero.webp';
import faqDevices from '../../../public/brand/faq-devices.webp';
import p from './pages.module.css';

const content = {
  owner: {
    faqs: ownerFaqs,
    eyebrow: 'Owners: FAQs',
    title: 'Your Property Management',
    accent: 'Questions, Answered.',
    description: 'Find clear answers about our services, pricing, tenant management, maintenance, deposits and more.',
    crumbs: [{ label: 'Home', href: '/' }, { label: 'Owners', href: '/owner-services' }, { label: 'FAQs' }],
    heroImage: faqHero,
    panelTitle: 'Manage Your Property With Confidence',
    panelText: 'The owner dashboard is designed to give you visibility on rent activity, maintenance requests, inspection reports and important documents, subject to the application release and your plan.',
    panelImage: faqDevices,
    items: [
      { title: 'Rent activity and statements', text: 'Track collections and payment status', Icon: Receipt },
      { title: 'Maintenance updates', text: 'View requests, approvals and progress', Icon: Wrench },
      { title: 'Inspection reports', text: 'Access photos and condition reports', Icon: Camera },
      { title: 'Important documents', text: 'Agreements, inventory and more', Icon: FileText },
    ],
    closingTitle: 'Ready to Get Started?',
    closingText: 'List your property and experience hassle-free rental management with Cypress.',
  },
  tenant: {
    faqs: tenantFaqs,
    eyebrow: 'Tenants: FAQs',
    title: 'A Clearer',
    accent: 'Rental Experience.',
    description: 'Information about finding a home, requesting support and accessing your tenancy records.',
    crumbs: [{ label: 'Home', href: '/' }, { label: 'Tenants', href: '/tenants/services' }, { label: 'FAQs' }],
    heroImage: faqHero,
    panelTitle: 'Manage Your Tenancy With Ease',
    panelText: 'The tenant dashboard is designed to keep your rent records, requests and documents in one place, subject to the application release and records available for your tenancy.',
    panelImage: faqDevices,
    items: [
      { title: 'Rent & receipts', text: 'Access available payment records', Icon: Receipt },
      { title: 'Maintenance requests', text: 'Report issues and follow updates', Icon: Wrench },
      { title: 'Documents', text: 'Rental agreements and tenancy records', Icon: FileText },
      { title: 'Help & support', text: 'Contact Cypress for assistance', Icon: Headphones },
    ],
    closingTitle: 'Let’s Help You Find Your Next Home.',
    closingText: 'Share your preferred locality, budget and move-in date and Cypress can contact you about suitable properties.',
  },
} as const;

export function FaqPage({ audience }: { audience: 'owner' | 'tenant' }) {
  const c = content[audience];
  const whatsapp = whatsappUrl(audience === 'owner' ? '/owners/faqs' : '/tenants/faqs');
  return <>
    <PageHero
      eyebrow={c.eyebrow}
      title={c.title}
      accent={c.accent}
      description={c.description}
      image={c.heroImage}
      breadcrumbs={[...c.crumbs]}
    />
    <Section>
      <div className={p.faqLayout}>
        <FaqExplorer items={[...c.faqs]} audience={audience} />
        <aside className={p.faqSide} aria-label="Related information">
          <div className={p.sidePanel}>
            {c.panelImage && (
              <Image
                src={c.panelImage}
                alt="Owner and Tenant Dashboard view"
                className={p.sideImg}
                sizes="(max-width: 1100px) 100vw, 360px"
              />
            )}
            <h2>{c.panelTitle}</h2>
            <p>{c.panelText}</p>
            <ul className={p.sideList}>
              {c.items.map(({ title, text, Icon }) => (
                <li key={title}>
                  <Icon aria-hidden="true" />
                  <span>
                    <strong>{title}</strong>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
            <div className={s.actions}>
              <Link href="/about/application" className={`${s.secondary} ${s.fullWidth}`}>
                Explore Our Application<ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className={p.sidePanel}>
            <h2>Still Have Questions? Talk to Our Team.</h2>
            <p>We’re happy to help with any questions about your {audience === 'owner' ? 'property and our management services' : 'rental and tenancy'}.</p>
            <div className={p.talkIcons}>
              {siteConfig.phone && <a href={`tel:${siteConfig.phone}`}><Phone size={16} aria-hidden="true" />Call Us</a>}
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} aria-hidden="true" />WhatsApp<span className="sr-only"> (opens a new tab)</span>
                </a>
              )}
              {siteConfig.email && <a href={`mailto:${siteConfig.email}`}><Mail size={16} aria-hidden="true" />Email Us</a>}
            </div>
            <div className={s.actions}>
              <Link href="/contact" className={`${s.button} ${s.fullWidth}`}>
                Contact Us<ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </Section>
    {audience === 'owner' ? (
      <ClosingCTA title={c.closingTitle} description={c.closingText} />
    ) : (
      <Section tone="dark">
        <div className={s.ctaBand}>
          <div>
            <h2>{c.closingTitle}</h2>
            <p className={s.lead}>{c.closingText}</p>
          </div>
          <div className={s.actions}>
            <Link href="/tenants/find-property" className={s.button}>
              Find a Property<ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/tenant-inquiry" className={s.secondary}>
              Submit Tenant Inquiry
            </Link>
          </div>
        </div>
      </Section>
    )}
  </>;
}
