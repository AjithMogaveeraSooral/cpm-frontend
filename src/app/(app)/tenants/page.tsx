'use client';

import { UsersPanel } from '@/components/admin/users-panel';

export default function TenantsPage() {
  return <UsersPanel role="tenant" title="Tenant Users" singular="tenant" />;
}
