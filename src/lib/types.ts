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
  owner_id?: string;
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

// AdminUser is the admin-directory projection of a user account.
export interface AdminUser {
  id: string;
  mobile: string;
  full_name?: string;
  email?: string;
  status: string;
  roles: Role[];
  created_at: string;
}

// AdminCreateUserInput mirrors the backend admin user-provisioning DTO.
export interface AdminCreateUserInput {
  mobile: string;
  role: Extract<Role, 'tenant' | 'owner'>;
  full_name: string;
  email?: string;
  password?: string;
}

// AdminUpdateUserInput mirrors the backend admin user-edit DTO. All fields are
// optional; omitted fields are left unchanged.
export interface AdminUpdateUserInput {
  full_name?: string;
  email?: string;
  status?: 'active' | 'suspended';
  password?: string;
}

// Tenancy mirrors the backend tenancy entity returned by /tenancies.
export type TenancyStatus = 'proposed' | 'approved' | 'rejected' | 'active' | 'ended';

export interface Tenancy {
  id: string;
  property_id: string;
  tenant_id: string;
  status: TenancyStatus;
  start_date?: string;
  end_date?: string;
  rent_amount: number;
  deposit_amount: number;
  approved_at?: string;
  created_at: string;
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

export type LeadType = 'enquiry' | 'callback' | 'visit';
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed';

export interface Lead {
  id: string;
  type: LeadType;
  name: string;
  phone: string;
  email?: string;
  property_upid?: string;
  message?: string;
  status: LeadStatus;
  created_at: string;
}

export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string;
  property_upid?: string;
  message?: string;
}

// NotificationItem mirrors the backend in-app notification entity.
export interface NotificationItem {
  id: string;
  user_id?: string;
  channel: string;
  template: string;
  payload?: Record<string, unknown>;
  status: string;
  created_at: string;
}

// AddPropertyMediaInput reserves a presigned upload slot for property media.
export interface AddPropertyMediaInput {
  media_type: 'image' | 'video';
  filename: string;
  content_type: string;
  is_cover?: boolean;
  duration_sec?: number;
}

// PropertyMediaPresign is returned after reserving a property media slot.
export interface PropertyMediaPresign {
  media_id: string;
  s3_key: string;
  upload_url: string;
  expires_in_seconds: number;
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
  property_id: string;
  created_by: string;
  vendor_id?: string;
  category: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  sla_hours: number;
  sla_due_at: string;
  resolved_at?: string;
  version: number;
  created_at: string;
  vendor?: Vendor;
  history?: TicketHistory[];
  attachments?: TicketAttachment[];
}

export interface TicketHistory {
  id: string;
  ticket_id: string;
  from_status?: string;
  to_status: string;
  note?: string;
  actor_id: string;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  s3_key: string;
  stage: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  trade: string;
  phone?: string;
  email?: string;
  rating: number;
  active: boolean;
}

// RaiseTicketInput mirrors the backend POST /tickets DTO.
export interface RaiseTicketInput {
  property_id: string;
  category: string;
  title: string;
  description?: string;
  priority?: string;
}

// PresignedUpload is returned when reserving an attachment upload slot.
export interface PresignedUpload {
  attachment_id: string;
  key: string;
  url: string;
  expires_in_sec: number;
}


export interface DashboardSummary {
  properties: { total: number; listed: number; occupied: number };
  tenancies: { active: number; proposed: number };
  tickets: { open: number; escalated: number; overdue: number };
  rent_to_verify: number;
  new_leads: number;
  active_vouchers: number;
}
