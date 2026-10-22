import Link from 'next/link';
import { Mail, MapPin, Phone, Linkedin, Youtube, Instagram } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { siteConfig } from '@/lib/site-config';
import { MarketingNavigation } from './navigation';
import { WhatsAppLink } from './whatsapp-link';
import s from './marketing.module.css';

const footerSections = [
  {
    title: 'Owners',
    links: [
      { label: 'Property Management', href: '/owner-services' },
      { label: 'Plans & Pricing', href: '/owners/plans-pricing' },
      { label: 'NRI Owners', href: '/owners/nri-property-management' },
      { label: 'FAQs', href: '/owners/faqs' },
    ],
  },
  {
    title: 'Tenants',
    links: [
      { label: 'Find a Property', href: '/tenants/find-property' },
      { label: 'Tenant Services', href: '/tenants/services' },
      { label: 'FAQs', href: '/tenants/faqs' },
    ],
  },
  {
    title: 'About Us',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Why I Started Cypress', href: '/about/founder' },
      { label: 'Our Service Partners', href: '/about/service-partners' },
      { label: 'Our Application', href: '/about/application' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'Contact & Support', href: '/contact' },
      { label: 'Owner Inquiry', href: '/owner-inquiry' },
      { label: 'Tenant Inquiry', href: '/tenant-inquiry' },
    ],
  },
] as const;

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const phone = siteConfig.phone ?? '+91 98450 12345';
  const email = siteConfig.email ?? 'support@cypress.co.in';

  return (
    <div className={s.site}>
      <a href="#main-content" className={s.skip}>Skip to content</a>
      <MarketingNavigation />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className={s.footer}>
        <div className={`${s.container} ${s.footerMain}`}>
          <div className={s.footerGrid}>
            <div className={s.footerBrandCol}>
              <Link href="/" className={s.footerBrand} aria-label="Cypress Property Management home">
                <BrandLogo className="h-auto w-[170px] max-w-full" />
              </Link>
              <p className={s.footerTagline}>Technology for Convenience.<br />Transparency for Trust.</p>
            </div>
            {footerSections.map((group) => (
              <nav key={group.title} aria-label={`${group.title} footer links`} className={s.footerNav}>
                <strong>{group.title}</strong>
                {group.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
              </nav>
            ))}
            <div className={s.footerContact}>
              <a href={`tel:${phone.replace(/\s+/g, '')}`}><Phone size={15} aria-hidden="true" />{phone}</a>
              <a href={`mailto:${email}`}><Mail size={15} aria-hidden="true" />{email}</a>
              <span><MapPin size={15} aria-hidden="true" />Bengaluru, Karnataka, India</span>
              <div className={s.footerSocials}>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Cypress on LinkedIn"><Linkedin size={18} /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Cypress on YouTube"><Youtube size={18} /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Cypress on Instagram"><Instagram size={18} /></a>
              </div>
            </div>
          </div>
        </div>
        <div className={s.footerBottom}>
          <div className={s.container}>
            <span>© 2025 Cypress Property Management Services. All rights reserved.</span>
            <div className={s.footerLinks}>
              <Link href="/privacy">Privacy Policy</Link>
              <span>|</span>
              <Link href="/terms">Terms of Service</Link>
              <span>|</span>
              <Link href="/cancellation">Cancellation Policy</Link>
            </div>
          </div>
        </div>
      </footer>
      <WhatsAppLink />
    </div>
  );
}

