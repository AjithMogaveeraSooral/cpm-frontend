import Link from 'next/link';
import { ArrowRight, Headphones, House, Mail, MapPin, MessageCircle, Phone, Users } from 'lucide-react';
import { PageHero, Section, marketingStyles as s } from '@/components/marketing/sections';
import { pageMetadata, siteConfig, whatsappUrl } from '@/lib/site-config';
import contactBalcony from '../../../../public/brand/contact-balcony.webp';
import p from '@/components/marketing/pages.module.css';

export const metadata = pageMetadata('Contact Cypress Property Management Bangalore', 'Contact Cypress in Bengaluru for owner services, rental requirements and existing customer support. Start with an owner or tenant inquiry.', '/contact');

export default function ContactPage() {
  const whatsapp = whatsappUrl('/contact');
  return <>
    <PageHero
      eyebrow="Contact us"
      title="Let’s Talk About"
      accent="Your Property."
      description="Whether you’re an owner looking for management support, a tenant searching for a home or an existing customer needing assistance, Cypress is here to help."
      image={contactBalcony}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
    >
      <div className={p.contactGrid}>
        <div className={p.infoCard}>
          <div className={p.infoRow}>
            <div className={p.cardIcon}><MapPin size={20} aria-hidden="true" /></div>
            <div><small>Location</small><strong>Bengaluru, Karnataka, India</strong></div>
          </div>
          {siteConfig.phone && (
            <div className={p.infoRow}>
              <div className={p.cardIcon}><Phone size={20} aria-hidden="true" /></div>
              <div><small>Phone</small><a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a></div>
            </div>
          )}
          {whatsapp && (
            <div className={p.infoRow}>
              <div className={p.cardIcon}><MessageCircle size={20} aria-hidden="true" /></div>
              <div><small>WhatsApp</small><a href={whatsapp} target="_blank" rel="noopener noreferrer">Chat with Cypress <span className="sr-only">(opens a new tab)</span></a></div>
            </div>
          )}
          {siteConfig.email && (
            <div className={p.infoRow}>
              <div className={p.cardIcon}><Mail size={20} aria-hidden="true" /></div>
              <div><small>Email</small><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></div>
            </div>
          )}
        </div>
        <div className={p.helpCard}>
          <h2>How can we help you?</h2>
          <p>Choose an option below or send us a message and our team will get back to you.</p>
          <div className={p.helpLinks}>
            <Link href="/owner-inquiry"><House size={18} aria-hidden="true" /><span>Owner Inquiry</span><ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/tenant-inquiry"><Users size={18} aria-hidden="true" /><span>Tenant Inquiry</span><ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="#customer-support"><Headphones size={18} aria-hidden="true" /><span>Customer Support</span><ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </PageHero>
    <Section id="customer-support">
      <div className={p.audienceRow}>
        <div>
          <div className={p.cardIcon}><House size={26} aria-hidden="true" /></div>
          <div>
            <h3>For Owners</h3>
            <p>Get professional management support for your property.</p>
            <Link href="/owner-inquiry" className={s.textLink}>Owner Inquiry<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div>
          <div className={`${p.cardIcon} ${p.icBlue}`}><Users size={26} aria-hidden="true" /></div>
          <div>
            <h3>For Tenants</h3>
            <p>Find a home or get support during your tenancy.</p>
            <Link href="/tenant-inquiry" className={s.textLink}>Tenant Inquiry<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div>
          <div className={`${p.cardIcon} ${p.icAmber}`}><Headphones size={26} aria-hidden="true" /></div>
          <div>
            <h3>Existing Customers</h3>
            <p>Need assistance? Sign in to raise a service request, or use the inquiry forms if you need help with access.</p>
            <div className="flex flex-wrap gap-x-5">
              <Link href={siteConfig.ownerLogin} className={s.textLink}>Owner Portal</Link>
              <Link href={siteConfig.tenantLogin} className={s.textLink}>Tenant Portal</Link>
            </div>
          </div>
        </div>
      </div>
    </Section>
  </>;
}
