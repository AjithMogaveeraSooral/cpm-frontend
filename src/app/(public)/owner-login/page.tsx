import { PortalEntry } from '@/components/marketing/portal-entry';
import { pageMetadata } from '@/lib/site-config';

export const metadata = { ...pageMetadata('Owner Login | Cypress', 'Access your Cypress owner account.', '/owner-login'), robots: { index: false, follow: true } };
export default function OwnerLoginPage() { return <PortalEntry role="Owner" />; }