import { PlansOverview } from '@/components/marketing/plan-pages';
import { pageMetadata } from '@/lib/site-config';

export const metadata = pageMetadata('Owner Plans | Cypress Property Management', 'All Cypress owner plans: End-to-End Bronze, Silver and Gold property management, plus Rental Care, Home Guardian, Land Guardian and Property Sales.', '/owners/plans');

export default function OwnerPlansPage() {
  return <PlansOverview />;
}
