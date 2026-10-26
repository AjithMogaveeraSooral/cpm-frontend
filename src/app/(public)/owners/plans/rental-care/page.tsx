import { PlanDetailPage, planMetadata } from '@/components/marketing/plan-pages';

export const metadata = planMetadata('rental-care');

export default function RentalCarePlanPage() {
  return <PlanDetailPage slug="rental-care" />;
}
