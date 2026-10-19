import { PortalEntry } from '@/components/marketing/portal-entry';
import { pageMetadata } from '@/lib/site-config';

export const metadata = { ...pageMetadata('Tenant Login | Cypress', 'Access your Cypress tenant account.', '/tenant-login'), robots: { index: false, follow: true } };
export default function TenantLoginPage() { return <PortalEntry role="Tenant" />; }