import { PlanDetailPage, planMetadata } from '@/components/marketing/plan-pages';

export const metadata = planMetadata('gold');

export default function GoldPlanPage() {
  return <PlanDetailPage slug="gold" />;
}
