'use client';

import { UsersPanel } from '@/components/admin/users-panel';

export default function OwnersPage() {
  return <UsersPanel role="owner" title="Property Owners" singular="owner" />;
}
