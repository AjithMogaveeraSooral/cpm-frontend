import { PlanDetailPage, planMetadata } from '@/components/marketing/plan-pages';

export const metadata = planMetadata('property-sales');

export default function PropertySalesPlanPage() {
  return <PlanDetailPage slug="property-sales" />;
}
