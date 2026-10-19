import { MarketingHome, homeMetadata } from '@/components/marketing/home';
import { MarketingShell } from '@/components/marketing/shell';

export const metadata = homeMetadata;

export default function HomePage() {
  return <MarketingShell><MarketingHome /></MarketingShell>;
}
