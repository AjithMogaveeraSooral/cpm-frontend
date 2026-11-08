'use client';

import { UsersPanel } from '@/components/admin/users-panel';

export default function AdminsPage() {
  return <UsersPanel role="cypress_admin" title="Cypress Administrators" singular="Cypress Admin" />;
}