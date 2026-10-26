import type { Metadata } from 'next';

// Publish only business-approved contact values. Empty/invalid values stay hidden.
function publicSiteUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return undefined;
    if (/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(url.hostname) || url.hostname.endsWith('.local')) return undefined;
    return `${url.origin}${url.pathname.replace(/\/$/, '')}`;
  } catch {
    return undefined;
  }
}

function phoneNumber(value: string | undefined) {
  const cleaned = value?.trim().replace(/[\s()-]/g, '');
  return cleaned && /^\+?[1-9]\d{7,14}$/.test(cleaned) ? cleaned : undefined;
}

const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

export const siteConfig = {
  name: 'Cypress Property Management Services',
  url: publicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  phone: phoneNumber(process.env.NEXT_PUBLIC_CONTACT_PHONE),
  email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
  whatsapp: phoneNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)?.replace(/^\+/, ''),
  ownerLogin: '/owner-login',
  tenantLogin: '/tenant-login',
} as const;

export function siteUrl(path: string): string | undefined {
  return siteConfig.url ? `${siteConfig.url}${path === '/' ? '/' : path}` : undefined;
}

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const canonical = siteUrl(path);
  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title, description, siteName: siteConfig.name, type: 'website', locale: 'en_IN',
      ...(canonical ? { url: canonical } : {}),
    },
  };
}

export function whatsappUrl(pathname: string) {
  if (!siteConfig.whatsapp) return undefined;
  // Fixed messages only: do not forward query strings, property IDs or personal data.
  const topic = pathname.includes('nri-property-management') ? 'NRI property management'
    : pathname.includes('plans-pricing') || /\/owners\/plans\/(bronze|silver|gold)/.test(pathname) ? 'the Bronze, Silver and Gold plans'
    : pathname.includes('/owners/plans/rental-care') ? 'Cypress Rental Care'
    : pathname.includes('/owners/plans/home-guardian') ? 'Cypress Home Guardian'
    : pathname.includes('/owners/plans/land-guardian') ? 'Cypress Land Guardian'
    : pathname.includes('/owners/plans/property-sales') ? 'Cypress Property Sales'
    : pathname.startsWith('/owners/plans') ? 'the Cypress owner plans'
    : pathname.startsWith('/tenants') || pathname === '/tenant-inquiry' || pathname === '/explore' ? 'rental homes and tenant services'
    : pathname.startsWith('/about') ? 'Cypress property management'
    : 'property management in Bengaluru';
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Hello Cypress, I would like to know more about ${topic}.`)}`;
}

// Only public, deliberate destinations; do not enumerate portal records or property IDs.
export const publicRoutes = [
  '/', '/owner-services', '/owners/plans', '/owners/plans-pricing', '/owners/nri-property-management',
  '/owners/plans/bronze', '/owners/plans/silver', '/owners/plans/gold',
  '/owners/plans/rental-care', '/owners/plans/home-guardian', '/owners/plans/land-guardian', '/owners/plans/property-sales',
  '/owners/faqs', '/tenants/find-property', '/tenants/services', '/tenants/faqs',
  '/about', '/about/founder', '/about/service-partners', '/about/application',
  '/contact', '/owner-inquiry', '/tenant-inquiry',
] as const;