import Link from 'next/link';
import { PageHero, Section, marketingStyles as s } from './sections';

export function PortalEntry({ role }: { role: 'Owner' | 'Tenant' }) {
  const portal = role === 'Owner' ? 'owner' : 'tenant';
  return (
    <>
      <PageHero eyebrow={`${role} portal`} title={`${role} Login`} description={`Access your Cypress ${role.toLowerCase()} account through the secure login screen.`} />
      <Section title="Continue to Your Account Portal">
        <p className={s.lead}>The <strong>{role === 'Owner' ? 'Property Owner' : 'Tenant'}</strong> portal will be preselected. Sign in with your password or OTP. Access requires an approved account for this portal; pending applications remain subject to approval.</p>
        <div className={s.actions}>
          <Link className={s.button} href={`/login?role=${portal}`}>Continue to Login</Link>
          <Link className={s.secondary} href="/contact">Need Help With Access?</Link>
        </div>
      </Section>
    </>
  );
}