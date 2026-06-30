// Shared API types mirroring the Go backend's httpx envelope and core DTOs.

export type Role = 'app_admin' | 'cypress_admin' | 'owner' | 'tenant';

export interface ErrorBody {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: ErrorBody;
  meta?: { pagination?: Pagination };
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
  refresh_expires_at: string;
  token_type: string;
}

export interface UserSummary {
  id: string;
  mobile: string;
  full_name?: string;
  email?: string;
  roles: Role[];
  pending_roles?: Role[];
  status?: string;
  locale: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  location_place_id?: string;
}

// Master-data lookups used to populate the property registration form.
export interface City {
  id: string;
  name: string;
  code: string;
}

export interface Locality {
  id: string;
  city_id: string;
  name: string;
  code: string;
}

export interface Apartment {
  id: string;
  locality_id: string;
  name: string;
  code: string;
  builder?: string;
}

export interface ServicePlan {
  id: string;
  tier: string;
  name: string;
  commission_pct: number;
  sla_hours: number;
  visits_per_year: number;
  media_format: string;
}

export interface Amenity {
  id: string;
  name: string;
}

// CreatePropertyInput mirrors the backend property registration DTO.
export interface CreatePropertyInput {
  city_id: string;
  locality_id: string;
  apartment_id?: string;
  plan_id: string;
  flat_no: string;
  property_type: string;
  bhk: number;
  area_sqft?: number;
  furnishing?: string;
  monthly_rent: number;
  deposit?: number;
  maintenance_coverage?: string;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  address?: string;
  landmark?: string;
  pincode?: string;
  amenity_ids?: string[];
}

// UpdateProfileInput mirrors the backend PATCH /auth/me DTO.
export interface UpdateProfileInput {
  full_name?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  location_place_id?: string;
}

export interface AuthResult {
  user: UserSummary;
  tokens: TokenPair;
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface Registration {
  id: string;
  user_id: string;
  mobile: string;
  full_name?: string;
  email?: string;
  role: Role;
  status: RegistrationStatus;
  note?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface PublicProperty {
  upid: string;
  property_type: string;
  bhk: number;
  area_sqft?: number;
  furnishing: string;
  monthly_rent: number;
  deposit: number;
  occupancy_status: string;
  city?: string;
  locality?: string;
  cover_image_key?: string;
}

export interface Property {
  id: string;
  upid: string;
  owner_id: string;
  flat_no: string;
  property_type: string;
  bhk: number;
  furnishing: string;
  monthly_rent: number;
  deposit: number;
  occupancy_status: string;
  is_listed: boolean;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  address?: string;
  landmark?: string;
  pincode?: string;
  version: number;
  created_at: string;
}

export interface Ticket {
  id: string;
  property_upid: string;
  category: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  sla_hours: number;
  sla_due_at: string;
  resolved_at?: string;
  created_at: string;
}

export interface DashboardSummary {
  properties: { total: number; listed: number; occupied: number };
  tenancies: { active: number; proposed: number };
  tickets: { open: number; escalated: number; overdue: number };
  rent_to_verify: number;
  new_leads: number;
  active_vouchers: number;
}
