import { PlanDetailPage, planMetadata } from '@/components/marketing/plan-pages';

export const metadata = planMetadata('home-guardian');

export default function HomeGuardianPlanPage() {
  return <PlanDetailPage slug="home-guardian" />;
}
