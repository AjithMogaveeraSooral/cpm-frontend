import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { navigation } from '@/lib/site-content';
import { siteConfig } from '@/lib/site-config';
import { MarketingNavigation } from './navigation';
import { WhatsAppLink } from './whatsapp-link';
import s from './marketing.module.css';

const supportLinks = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Owner Inquiry', href: '/owner-inquiry' },
  { label: 'Tenant Inquiry', href: '/tenant-inquiry' },
] as const;

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.site}>
      <a href="#main-content" className={s.skip}>Skip to content</a>
      <MarketingNavigation />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className={s.footer}>
        <div className={`${s.container} ${s.footerMain}`}>
          <div className={s.footerGrid}>
            <div>
              <Link href="/" className={s.footerBrand} aria-label="Cypress Property Management home"><BrandLogo className="h-auto w-[170px] max-w-full" /></Link>
              <p>Technology for Convenience.<br />Transparency for Trust.</p>
            </div>
            {navigation.map((group) => <nav key={group.label} aria-label={`${group.label} footer links`}><strong>{group.label}</strong>{group.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>)}
            <nav aria-label="Contact and support footer links"><strong>Contact &amp; Support</strong>{supportLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
            <div className={s.footerContact}>
              {siteConfig.phone && <a href={`tel:${siteConfig.phone}`}><Phone size={16} aria-hidden="true" />{siteConfig.phone}</a>}
              {siteConfig.email && <a href={`mailto:${siteConfig.email}`}><Mail size={16} aria-hidden="true" />{siteConfig.email}</a>}
              <span><MapPin size={16} aria-hidden="true" />Bengaluru, Karnataka, India</span>
            </div>
          </div>
        </div>
        <div className={s.footerBottom}>
          <div className={s.container}>
            <span>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
            <div className={s.footerLinks}>
              <Link href={siteConfig.ownerLogin}>Owner Login</Link>
              <Link href={siteConfig.tenantLogin}>Tenant Login</Link>
            </div>
          </div>
        </div>
      </footer>
      <WhatsAppLink />
    </div>
  );
}
