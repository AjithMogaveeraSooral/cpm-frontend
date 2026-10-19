import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { navigation } from '@/lib/site-content';
import { siteConfig } from '@/lib/site-config';
import { MarketingNavigation } from './navigation';
import { WhatsAppLink } from './whatsapp-link';
import s from './marketing.module.css';

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.site}>
      <a href="#main-content" className={s.skip}>Skip to content</a>
      <MarketingNavigation />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className={s.footer}>
        <div className={s.container}>
          <div className={s.footerGrid}>
            <div>
              <Link href="/" className={s.footerBrand} aria-label="Cypress Property Management home"><BrandLogo /></Link>
              <p>Technology for Convenience.<br />Transparency for Trust.</p>
              <p className="mt-4">Property management, tenant coordination, rent tracking, maintenance and digital property services in Bengaluru.</p>
              <Link href="/contact">Contact &amp; Customer Support</Link>
              {siteConfig.phone && <a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a>}
              {siteConfig.email && <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>}
            </div>
            {navigation.map((group) => <nav key={group.label} aria-label={`${group.label} footer links`}><strong>{group.label}</strong>{group.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>)}
          </div>
          <div className={s.footerBottom}>
            <span>© {new Date().getFullYear()} {siteConfig.name}</span>
            <div className="flex flex-wrap gap-x-6">
              <Link href="/owner-inquiry">Owner Inquiry</Link><Link href="/tenant-inquiry">Tenant Inquiry</Link>
              <Link href={siteConfig.ownerLogin}>Owner Login</Link><Link href={siteConfig.tenantLogin}>Tenant Login</Link>
            </div>
          </div>
        </div>
      </footer>
      <WhatsAppLink />
    </div>
  );
}