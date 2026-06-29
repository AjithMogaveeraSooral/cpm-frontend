// Selectable user types for the login and signup flows. app_admin is omitted —
// it is provisioned out-of-band and never self-registered.
import type { Role } from './types';

export interface UserTypeOption {
  value: Extract<Role, 'tenant' | 'owner' | 'cypress_admin'>;
  label: string;
  description: string;
}

export const USER_TYPES: UserTypeOption[] = [
  { value: 'tenant', label: 'Tenant', description: 'Rent and manage your home' },
  { value: 'owner', label: 'Property Owner', description: 'List and manage your properties' },
  { value: 'cypress_admin', label: 'Cypress Admin', description: 'Operations and approvals' },
];

export function userTypeLabel(role: Role): string {
  return USER_TYPES.find((t) => t.value === role)?.label ?? role;
}
