import { PlanDetailPage, planMetadata } from '@/components/marketing/plan-pages';

export const metadata = planMetadata('bronze');

export default function BronzePlanPage() {
  return <PlanDetailPage slug="bronze" />;
}
