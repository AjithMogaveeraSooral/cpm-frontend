import type { Metadata } from 'next';
import { ExploreMarketplace } from '@/components/marketplace/explore-marketplace';

export const metadata: Metadata = {
  title: 'Find a Rental Home | Cypress Property Management',
  description: 'Explore listed, vacant rental homes. Search by locality, city, BHK, monthly rent and furnishing, and enquire with Cypress.',
};

export default function ExplorePage() {
  return <ExploreMarketplace />;
}
