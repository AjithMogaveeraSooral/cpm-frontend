import Link from 'next/link';
import { PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata, siteConfig, whatsappUrl } from '@/lib/site-config';

export const metadata = pageMetadata('Contact Cypress Property Management Bangalore', 'Contact Cypress in Bengaluru for owner services, rental requirements and existing customer support. Start with an owner or tenant inquiry.', '/contact');

export default function ContactPage() {
  const whatsapp = whatsappUrl('/contact');
  const hasContacts = siteConfig.phone || siteConfig.email || whatsapp;
  return <>
    <PageHero eyebrow="Contact & support" title="Let’s Talk About Your Property." description="Whether you’re an owner looking for management support, a tenant searching for a home or an existing customer needing assistance, Cypress is here to help." />
    <Section title="Contact Cypress Property Management Services">
      <p className={s.lead}>Bengaluru, Karnataka, India</p>
      {hasContacts && <div className={s.actions}>
        {siteConfig.phone && <a className={s.secondary} href={`tel:${siteConfig.phone}`}>Call {siteConfig.phone}</a>}
        {siteConfig.email && <a className={s.secondary} href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>}
        {whatsapp && <a className={s.button} href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Cypress <span className="sr-only">(opens a new tab)</span></a>}
      </div>}
      <div className={s.grid}>
        <article className={s.card}><h3>Owner Inquiry</h3><p>Share a few details about your property and discuss suitable management options.</p><div className={s.actions}><Link href="/owner-inquiry" className={s.button}>List Your Property</Link></div></article>
        <article className={s.card}><h3>Tenant Inquiry</h3><p>Tell us your preferred locality, budget and move-in date to help us understand your rental requirements.</p><div className={s.actions}><Link href="/tenant-inquiry" className={s.button}>Submit Rental Requirement</Link></div></article>
        <article className={s.card}><h3>Customer Support</h3><p>Existing customers can access property-related service requests where available in the application. Use the inquiry forms to contact Cypress if you need help with access.</p><div className={s.actions}><Link href={siteConfig.ownerLogin} className={s.secondary}>Owner Portal</Link><Link href={siteConfig.tenantLogin} className={s.secondary}>Tenant Portal</Link></div></article>
      </div>
    </Section>
  </>;
}

