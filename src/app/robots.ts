import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const sitemap = siteUrl('/sitemap.xml');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Exact matches preserve the public /owners/* and /tenants/* subroutes.
      // Crawl instructions are not an authorization boundary.
      disallow: ['/api/', '/login', '/signup', '/pending', '/owner-login', '/tenant-login', '/dashboard', '/owners$', '/owners/$', '/owners?', '/owners/?', '/tenants$', '/tenants/$', '/tenants?', '/tenants/?', '/properties', '/tenancies', '/invoices', '/tickets', '/profile', '/billing', '/payments', '/maintenance', '/inspections', '/documents', '/reports', '/settings', '/users', '/approvals', '/notifications', '/leads'],
    },
    ...(sitemap ? { sitemap } : {}),
  };
}