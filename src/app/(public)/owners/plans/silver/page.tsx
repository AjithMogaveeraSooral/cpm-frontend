import { PlanDetailPage, planMetadata } from '@/components/marketing/plan-pages';

export const metadata = planMetadata('silver');

export default function SilverPlanPage() {
  return <PlanDetailPage slug="silver" />;
}
