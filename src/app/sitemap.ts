import type { MetadataRoute } from 'next';
import { publicRoutes, siteConfig, siteUrl } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // Never publish a made-up origin. Configure NEXT_PUBLIC_SITE_URL before release.
  if (!siteConfig.url) return [];
  return publicRoutes.map((path) => ({ url: siteUrl(path)! }));
}