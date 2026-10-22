'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUserRound, MessageCircle, Phone, Search } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { navigation } from '@/lib/site-content';
import { siteConfig, whatsappUrl } from '@/lib/site-config';
import s from './marketing.module.css';

function SearchBox({ id }: { id: string }) {
  return (
    <form action="/search" method="get" role="search" className={s.searchForm}>
      <label htmlFor={id} className="sr-only">Search properties, services and FAQs</label>
      <input id={id} type="search" name="q" required maxLength={150} placeholder="Search properties, services, FAQs..." autoComplete="off" />
      <button type="submit" aria-label="Search"><Search size={16} aria-hidden="true" /></button>
    </form>
  );
}

export function MarketingNavigation() {
  const header = useRef<HTMLElement>(null);
  const pathname = usePathname() ?? '/';
  const whatsapp = whatsappUrl(pathname);
  const inGroup = (links: readonly { href: string }[]) => links.some(({ href }) => pathname === href || pathname.startsWith(`${href}/`) || (href === '/tenants/find-property' && pathname.startsWith('/explore')));

  useEffect(() => {
    const closeMenus = () => header.current?.querySelectorAll('details[open]').forEach((menu) => menu.removeAttribute('open'));
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) closeMenus();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !(document.activeElement instanceof HTMLElement)) return;
      const menu = document.activeElement.closest('details[open]');
      if (menu) {
        event.preventDefault();
        menu.removeAttribute('open');
        menu.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  function closeOnNavigation(event: React.MouseEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest('a')) {
      header.current?.querySelectorAll('details[open]').forEach((menu) => menu.removeAttribute('open'));
    }
  }

  return (
    <header ref={header} className={s.header} onClick={closeOnNavigation}>
      <div className={`${s.container} ${s.headerRow}`}>
        <Link href="/" className={s.brand} aria-label="Cypress Property Management home">
          <BrandLogo className={s.brandLogo} priority />
        </Link>
        <nav className={s.desktopNav} aria-label="Main navigation">
          {navigation.map((group) => (
            <details key={group.label} className={s.dropdown} name="desktop-navigation">
              <summary className={inGroup(group.links) ? s.active : undefined}>{group.label}</summary>
              <div className={s.dropdownPanel}>{group.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div>
            </details>
          ))}
          <Link href="/contact" className={`${s.navLink} ${pathname === '/contact' ? s.active : ''}`}>Contact</Link>
        </nav>
        <SearchBox id="site-search-desktop" />
        <div className={s.headerRight}>
          <div className={s.contactRow}>
            {siteConfig.phone && <a href={`tel:${siteConfig.phone}`}><Phone size={15} aria-hidden="true" />{siteConfig.phone}</a>}
            {whatsapp && <a href={whatsapp} className={s.waDot} target="_blank" rel="noopener noreferrer" aria-label="Chat with Cypress on WhatsApp (opens a new tab)"><MessageCircle size={15} aria-hidden="true" /></a>}
            <details className={`${s.dropdown} ${s.rightMenu}`} name="desktop-navigation">
              <summary><CircleUserRound size={18} aria-hidden="true" />Login</summary>
              <div className={s.dropdownPanel}>
                <Link href={siteConfig.ownerLogin}>Owner Portal</Link>
                <Link href={siteConfig.tenantLogin}>Tenant Portal</Link>
              </div>
            </details>
          </div>
          <div className={s.buttonsRow}>
            <Link href="/tenant-inquiry" className={s.secondary}>Tenant Inquiry</Link>
            <Link href="/owner-inquiry" className={s.button}>List Your Property</Link>
          </div>
        </div>
        <ThemeSwitcher className={s.themeControl} />
        <details className={s.mobileMenu}>
          <summary>Menu</summary>
          <div className={s.mobilePanel}>
            <SearchBox id="site-search-mobile" />
            <nav aria-label="Mobile navigation">
              {navigation.map((group) => (
                <details key={group.label} name="mobile-navigation">
                  <summary>{group.label}</summary>
                  {group.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
                </details>
              ))}
              <Link href="/contact">Contact</Link>
              <Link href={siteConfig.ownerLogin}>Owner Login</Link>
              <Link href={siteConfig.tenantLogin}>Tenant Login</Link>
              {siteConfig.phone && <a href={`tel:${siteConfig.phone}`}>Call Cypress</a>}
            </nav>
            <div className={s.actions}>
              <Link href="/owner-inquiry" className={s.button}>List Your Property</Link>
              <Link href="/tenant-inquiry" className={s.secondary}>Tenant Inquiry</Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
