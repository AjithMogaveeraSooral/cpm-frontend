'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AssociationMaintenanceRecord,
  CityOption,
  DirectoryUser,
  Lead,
  MoveInOutCharge,
  Property,
  PropertyDocument,
  PropertyInventoryItem,
  RenewalAlert,
  RentHistoryItem,
  RentReceipt,
  Role,
  ServicePlan,
  Ticket,
  UserSummary,
} from './types';
import { useAuth } from './auth-store';
import { api } from './api-client';
import { idbLoadAllAttachments, idbSaveAttachment } from './media-idb';
import type { RentPayment } from './payment';
import { idbLoadRentPayments, idbSaveRentPayment } from './payments-idb';

export const CITIES_MASTER: CityOption[] = [
  {
    id: 'city-blr',
    name: 'Bengaluru',
    code: 'BLR',
    state: 'Karnataka',
    status: 'active',
    description: 'Silicon Valley of India — 120+ active properties under management across Whitefield, Koramangala, Indiranagar, and Sarjapur.',
  },
  {
    id: 'city-hsr',
    name: 'Hosur',
    code: 'HSR',
    state: 'Tamil Nadu',
    status: 'coming_soon',
    description: 'Upcoming automotive & electronics tech hub — launching operations Q4 2026. Pre-registrations open!',
  },
  {
    id: 'city-chn',
    name: 'Chennai',
    code: 'CHN',
    state: 'Tamil Nadu',
    status: 'coming_soon',
    description: 'Metro expansion on OMR & ECR IT corridors — launching Q1 2027. Pre-registrations open!',
  },
];

export const SERVICE_PLANS: ServicePlan[] = [
  {
    id: 'plan-bronze',
    tier: 'bronze',
    name: 'Bronze Essential',
    commission_pct: 5,
    sla_hours: 72,
    visits_per_year: 2,
    media_format: 'Photo Inspection',
  },
  {
    id: 'plan-silver',
    tier: 'silver',
    name: 'Silver Comprehensive',
    commission_pct: 10,
    sla_hours: 48,
    visits_per_year: 4,
    media_format: 'Photo Vault & Detailed Reports',
  },
  {
    id: 'plan-gold',
    tier: 'gold',
    name: 'Gold NRI Prime',
    commission_pct: 15,
    sla_hours: 24,
    visits_per_year: 6,
    media_format: 'HD Video Walkthrough & Priority Support',
  },
];

// Directory users are provisioned via the backend admin API (`/auth/users`).
// No hardcoded owners/tenants are seeded on the client.
export const INITIAL_DIRECTORY_USERS: DirectoryUser[] = [];

// Properties are created and managed through the onboarding flow / backend.
// No hardcoded demo properties are seeded on the client.
const INITIAL_PROPERTIES: Property[] = [];

const INITIAL_RECEIPTS: RentReceipt[] = [];

const INITIAL_RENT_HISTORY: RentHistoryItem[] = [];

const INITIAL_TICKETS: Ticket[] = [];

const INITIAL_LEADS: Lead[] = [];

// ApiProperty is the backend property projection (entity.Property) returned by
// GET /properties and GET /properties/:id. Related records are nested objects.
interface ApiProperty {
  id: string;
  upid: string;
  owner_id: string;
  city_id?: string;
  locality_id?: string;
  apartment_id?: string;
  plan_id?: string;
  flat_no: string;
  property_type: string;
  bhk: number;
  area_sqft?: number;
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
  plan?: { id: string; tier: string; name: string; commission_pct: number; sla_hours: number };
  city?: { id: string; name: string };
  locality?: { id: string; name: string };
  apartment?: { id: string; name: string };
  media?: { s3_key: string; media_type: string; is_cover: boolean }[];
}

// mapApiProperty flattens the backend property (with nested plan/city/locality/
// apartment) into the flat Property shape the UI renders. Owner and tenant
// display fields are not part of the property payload and are left unset.
function mapApiProperty(p: ApiProperty): Property {
  const photos = (p.media || []).filter((m) => m.media_type === 'image').map((m) => m.s3_key);
  const video = (p.media || []).find((m) => m.media_type === 'video')?.s3_key;
  return {
    id: p.id,
    upid: p.upid,
    owner_id: p.owner_id,
    city_id: p.city_id,
    city_name: p.city?.name,
    locality_name: p.locality?.name,
    apartment_name: p.apartment?.name,
    flat_no: p.flat_no,
    property_type: p.property_type,
    bhk: p.bhk,
    area_sqft: p.area_sqft,
    furnishing: p.furnishing,
    monthly_rent: p.monthly_rent,
    deposit: p.deposit,
    occupancy_status: (p.occupancy_status as Property['occupancy_status']) || 'vacant',
    is_listed: p.is_listed,
    plan_id: p.plan_id,
    plan_tier: p.plan?.tier as Property['plan_tier'],
    plan_name: p.plan?.name,
    plan_commission_pct: p.plan?.commission_pct,
    plan_sla_hours: p.plan?.sla_hours,
    latitude: p.latitude,
    longitude: p.longitude,
    google_place_id: p.google_place_id,
    address: p.address,
    landmark: p.landmark,
    pincode: p.pincode,
    version: p.version,
    created_at: p.created_at,
    ...(photos.length ? { media_photos: photos } : {}),
    ...(video ? { media_video: video } : {}),
  };
}

// ApiRentPayment mirrors the backend TenantRentPayment JSON. Optional fields are
// nullable/absent when unset.
interface ApiRentPayment {
  id: string;
  property_id: string;
  property_upid?: string;
  tenant_id: string;
  tenant_name?: string;
  period: string;
  amount: number;
  method: string;
  reference?: string | null;
  payment_date?: string;
  status: RentPayment['status'];
  notes?: string | null;
  receipt_name?: string | null;
  receipt_data_url?: string | null;
  receipt_content_type?: string | null;
  receipt_size_kb?: number | null;
  paid_to?: RentPayment['paid_to'] | null;
  created_at: string;
}

// mapApiRentPayment converts a backend payment record into the UI RentPayment
// shape, coercing SQL NULLs to undefined.
function mapApiRentPayment(p: ApiRentPayment): RentPayment {
  return {
    id: p.id,
    property_id: p.property_id,
    property_upid: p.property_upid ?? '',
    tenant_id: p.tenant_id,
    tenant_name: p.tenant_name ?? '',
    period: p.period,
    amount: p.amount,
    method: p.method as RentPayment['method'],
    reference: p.reference ?? undefined,
    payment_date: p.payment_date ?? '',
    status: p.status,
    notes: p.notes ?? undefined,
    receipt_name: p.receipt_name ?? undefined,
    receipt_data_url: p.receipt_data_url ?? undefined,
    receipt_content_type: p.receipt_content_type ?? undefined,
    receipt_size_kb: p.receipt_size_kb ?? undefined,
    paid_to: p.paid_to ?? undefined,
    created_at: p.created_at,
  };
}


// a freshly loaded property list. Owner/tenant assignments are managed on the
// client and are NOT part of the backend /properties payload, so without this
// merge a connection would disappear on every page refresh (which reloads
// properties from the API). It also injects any assigned property the API did
// not return — e.g. a tenant whose backend listing is owner-scoped and therefore
// excludes their rented unit.
function overlayAssignments(
  list: Property[],
  assignments: Record<string, Property>,
): Property[] {
  const applied = list.map((p) => {
    const snap = assignments[p.id];
    if (!snap) return p;
    return {
      ...p,
      owner_id: snap.owner_id ?? p.owner_id,
      owner_name: snap.owner_name ?? p.owner_name,
      owner_phone: snap.owner_phone ?? p.owner_phone,
      owner_email: snap.owner_email ?? p.owner_email,
      owner_pan: snap.owner_pan ?? p.owner_pan,
      // Tenant fields are applied verbatim so that ending a tenancy (snapshot
      // with cleared tenant fields) also survives a refresh.
      active_tenant_id: snap.active_tenant_id,
      active_tenant_name: snap.active_tenant_name,
      active_tenant_phone: snap.active_tenant_phone,
      active_tenant_email: snap.active_tenant_email,
      monthly_rent: snap.monthly_rent ?? p.monthly_rent,
      deposit: snap.deposit ?? p.deposit,
      lease_start_date: snap.lease_start_date,
      lease_end_date: snap.lease_end_date,
      occupancy_status: snap.occupancy_status ?? p.occupancy_status,
      is_listed: snap.is_listed ?? p.is_listed,
    };
  });
  const presentIds = new Set(list.map((p) => p.id));
  const injected = Object.values(assignments).filter((s) => !presentIds.has(s.id));
  return [...applied, ...injected];
}

// StoredMediaAsset is a user-uploaded photo/video kept locally as a base64 data
// URL so it can be previewed and downloaded without a storage backend.
export interface StoredMediaAsset {
  id: string;
  name: string;
  data_url: string;
  content_type: string;
  size_kb: number;
  uploaded_at: string;
}

// PropertyAttachmentBucket holds the documents, photos and videos a user has
// uploaded for a single property. These are stored durably in IndexedDB (see
// media-idb.ts) rather than localStorage, whose small quota cannot hold videos.
export interface PropertyAttachmentBucket {
  documents: PropertyDocument[];
  photos: StoredMediaAsset[];
  videos: StoredMediaAsset[];
}

interface DataStoreState {
  currentRole: 'cypress_admin' | 'owner' | 'tenant';
  selectedCity: string;
  properties: Property[];
  receipts: RentReceipt[];
  rentHistory: RentHistoryItem[];
  tickets: Ticket[];
  leads: Lead[];
  cities: CityOption[];
  plans: ServicePlan[];
  renewalAlerts: RenewalAlert[];
  registeredUsers: DirectoryUser[];
  propertyAttachments: Record<string, PropertyAttachmentBucket>;
  attachmentsLoaded: boolean;
  // Tenant-submitted rent payments (offline transfer + uploaded receipt),
  // stored durably in IndexedDB. Loaded via loadRentPayments().
  rentPayments: RentPayment[];
  rentPaymentsLoaded: boolean;
  // Persisted owner/tenant connection snapshots keyed by property id. These
  // survive a refresh and are re-applied to the backend-loaded property list.
  assignedProperties: Record<string, Property>;
  propertiesLoading: boolean;
  propertiesLoaded: boolean;

  // Role switching
  switchRole: (role: 'cypress_admin' | 'owner' | 'tenant') => void;
  setCity: (cityId: string) => void;

  // Backend hydration — properties are sourced from the database.
  loadPropertiesFromApi: () => Promise<void>;
  loadPropertyFromApi: (id: string) => Promise<Property | null>;

  // User management & Assignment actions
  assignOwnerUser: (propertyId: string, ownerUserId: string) => void;
  assignTenantUser: (
    propertyId: string,
    tenantUserId: string,
    rent?: number,
    deposit?: number,
    startDate?: string,
    endDate?: string
  ) => void;
  endTenancy: (propertyId: string) => void;
  registerDirectoryUser: (user: Omit<DirectoryUser, 'id'>) => DirectoryUser;
  upsertDirectoryUser: (user: DirectoryUser) => DirectoryUser;

  // Property & Onboarding actions
  addProperty: (property: Partial<Property>) => Property;
  convertLeadToProperty: (leadId: string, planTier: 'bronze' | 'silver' | 'gold', flatNo: string, rent: number, deposit: number) => Property;
  assignTenant: (propertyId: string, tenantName: string, tenantPhone: string, rent: number, deposit?: number, startDate?: string) => void;
  upgradePropertyPlan: (propertyId: string, newTier: 'bronze' | 'silver' | 'gold') => void;
  updateListingStatus: (propertyId: string, isListed: boolean) => void;

  // Document & Inventory actions
  addDocument: (propertyId: string, doc: Omit<PropertyDocument, 'id' | 'property_id' | 'uploaded_at'>) => void;
  addInventoryItem: (propertyId: string, item: Omit<PropertyInventoryItem, 'id' | 'property_id'>) => void;
  updateInventoryCondition: (propertyId: string, itemId: string, condition: 'good' | 'fair' | 'needs_repair') => void;

  // Property attachments (user-uploaded files, stored durably in IndexedDB)
  loadAttachments: () => Promise<void>;
  addPropertyDocument: (propertyId: string, doc: Omit<PropertyDocument, 'id' | 'property_id' | 'uploaded_at'>) => Promise<void>;
  removePropertyDocument: (propertyId: string, docId: string) => void;
  addPropertyPhotos: (propertyId: string, assets: Omit<StoredMediaAsset, 'id' | 'uploaded_at'>[]) => Promise<void>;
  removePropertyPhoto: (propertyId: string, id: string) => void;
  addPropertyVideo: (propertyId: string, asset: Omit<StoredMediaAsset, 'id' | 'uploaded_at'>) => Promise<void>;
  removePropertyVideo: (propertyId: string, id: string) => void;

  // Rent payments (offline; scalable to a payment gateway later)
  loadRentPayments: () => Promise<void>;
  submitRentPayment: (input: Omit<RentPayment, 'id' | 'status' | 'created_at'>) => Promise<RentPayment>;
  updateRentPaymentStatus: (paymentId: string, status: RentPayment['status']) => Promise<void>;

  // Association maintenance & move charges
  updateAssociationMaintenance: (propertyId: string, record: Partial<AssociationMaintenanceRecord>) => void;
  updateMoveCharge: (propertyId: string, charge: MoveInOutCharge) => void;
  submitVacateRequest: (propertyId: string, initiator: 'owner' | 'tenant', requestedDate: string, reason: string) => void;
  acknowledgeVacateRequest: (propertyId: string) => void;

  // Rent Receipt Generator
  generateRentReceipt: (input: Omit<RentReceipt, 'id' | 'created_at'>) => RentReceipt;

  // Ticket lifecycle actions
  raiseTicket: (input: { propertyId: string; category: Ticket['category']; title: string; description: string; priority: Ticket['priority'] }) => Ticket;
  acknowledgeTicket: (ticketId: string, planCovered: boolean, estimatedCost?: number, note?: string) => void;
  ownerApproveTicket: (ticketId: string, approved: boolean, note?: string) => void;
  resolveTicket: (ticketId: string, note?: string) => void;
  tenantAcknowledgeTicket: (ticketId: string) => void;

  // Lead actions
  updateLeadStatus: (leadId: string, status: Lead['status']) => void;

  // Reset demo data
  resetToDefaults: () => void;
}

function calculateRenewalAlerts(properties: Property[]): RenewalAlert[] {
  const now = new Date();
  const alerts: RenewalAlert[] = [];

  properties.forEach((p) => {
    if (p.plan_expires_at) {
      const exp = new Date(p.plan_expires_at);
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 45) {
        alerts.push({
          id: `alert-plan-${p.id}`,
          property_id: p.id,
          property_upid: p.upid,
          property_name: `${p.flat_no}, ${p.apartment_name || p.property_type}`,
          plan_tier: p.plan_name || p.plan_tier || 'Bronze',
          expires_at: p.plan_expires_at,
          days_left: diffDays,
          type: 'plan_renewal',
        });
      }
    }
  });

  return alerts;
}

export const useDataStore = create<DataStoreState>()(
  persist(
    (set, get) => ({
      currentRole: 'cypress_admin',
      selectedCity: 'city-blr',
      properties: INITIAL_PROPERTIES,
      receipts: INITIAL_RECEIPTS,
      rentHistory: INITIAL_RENT_HISTORY,
      tickets: INITIAL_TICKETS,
      leads: INITIAL_LEADS,
      cities: CITIES_MASTER,
      plans: SERVICE_PLANS,
      renewalAlerts: calculateRenewalAlerts(INITIAL_PROPERTIES),
      registeredUsers: INITIAL_DIRECTORY_USERS,
      propertyAttachments: {},
      attachmentsLoaded: false,
      rentPayments: [],
      rentPaymentsLoaded: false,
      assignedProperties: {},
      propertiesLoading: false,
      propertiesLoaded: false,

      switchRole: (role) => {
        set({ currentRole: role });
      },

      setCity: (cityId) => set({ selectedCity: cityId }),

      loadPropertiesFromApi: async () => {
        set({ propertiesLoading: true });
        try {
          const res = await api.get<ApiProperty[]>('/properties', {
            query: { page: 1, page_size: 100 },
          });
          const mapped = (res.data ?? []).map(mapApiProperty);
          const merged = overlayAssignments(mapped, get().assignedProperties);
          set({
            properties: merged,
            renewalAlerts: calculateRenewalAlerts(merged),
            propertiesLoaded: true,
          });
        } catch {
          // Leave any previously loaded state intact on failure.
          set({ propertiesLoaded: true });
        } finally {
          set({ propertiesLoading: false });
        }
      },

      loadPropertyFromApi: async (id) => {
        try {
          const res = await api.get<ApiProperty>(`/properties/${id}`);
          if (!res.data) return null;
          const mapped = mapApiProperty(res.data);
          const existing = get().properties.find((p) => p.id === mapped.id);
          // Preserve any locally-held enrichment (owner/tenant display, docs)
          // that the backend property payload does not carry.
          const base = existing ? { ...existing, ...mapped } : mapped;
          const [merged] = overlayAssignments([base], get().assignedProperties);
          const others = get().properties.filter((p) => p.id !== mapped.id);
          const next = [merged, ...others];
          set({ properties: next, renewalAlerts: calculateRenewalAlerts(next) });
          return merged;
        } catch {
          return null;
        }
      },

      addProperty: (input) => {
        const id = `prop-${Date.now()}`;
        const plan = get().plans.find((p) => p.tier === input.plan_tier) || get().plans[0];
        const upid = input.upid || `CPM-BLR-${input.flat_no?.replace(/[^a-zA-Z0-9]/g, '') || 'FLAT'}-${Date.now().toString().slice(-4)}`;

        const newProp: Property = {
          id,
          upid,
          owner_id: input.owner_id || (get().currentRole === 'owner' ? 'user-owner-1' : 'user-owner-1'),
          owner_name: input.owner_name || 'Ramesh Kumar',
          owner_phone: input.owner_phone || '+91 98765 43210',
          owner_email: input.owner_email || 'ramesh.kumar@cypress.local',
          owner_pan: input.owner_pan || 'ABCDE1234F',
          city_id: input.city_id || 'city-blr',
          city_name: input.city_name || 'Bengaluru',
          locality_name: input.locality_name || 'Bengaluru Central',
          apartment_name: input.apartment_name || 'Greenwood Heights',
          flat_no: input.flat_no || '101',
          property_type: input.property_type || 'apartment',
          bhk: input.bhk || 2,
          area_sqft: input.area_sqft || 1200,
          furnishing: input.furnishing || 'semi',
          monthly_rent: input.monthly_rent || 30000,
          deposit: input.deposit || 150000,
          occupancy_status: 'vacant', // newly onboarded properties start as vacant!
          is_listed: true, // listed on rental explore page when vacant!
          plan_id: plan.id,
          plan_tier: plan.tier as any,
          plan_name: plan.name,
          plan_commission_pct: plan.commission_pct,
          plan_sla_hours: plan.sla_hours,
          plan_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          address: input.address || `${input.flat_no}, Greenwood Heights, Bengaluru`,
          pincode: input.pincode || '560001',
          version: 1,
          created_at: new Date().toISOString(),
          documents: [
            {
              id: `doc-${Date.now()}`,
              property_id: id,
              name: `Cypress_${plan.name}_Agreement.pdf`,
              type: 'pdf',
              category: 'cypress_owner_agreement',
              file_url: '#',
              size_kb: 1050,
              uploaded_at: new Date().toISOString(),
              uploaded_by: 'Cypress Operations',
            },
          ],
          inventory: [
            { id: `inv-${Date.now()}-1`, property_id: id, name: 'Ceiling Fans & LED Lights', category: 'fixture', quantity: 4, condition: 'good' },
            { id: `inv-${Date.now()}-2`, property_id: id, name: 'Main Door Keys (3 copies)', category: 'key', quantity: 3, condition: 'good' },
          ],
          association_maintenance: {
            id: `maint-${Date.now()}`,
            property_id: id,
            society_name: `${input.apartment_name || 'Society'} Owners Welfare Association`,
            amount: 3500,
            frequency: 'monthly',
            payer: 'owner',
            status: 'pending',
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
          move_charges: [
            {
              id: `charge-${Date.now()}-in`,
              property_id: id,
              type: 'move_in',
              amount: 4000,
              payer: 'tenant',
              cypress_assisted: true,
              status: 'scheduled',
              notes: 'Society move-in shifting charges & Cypress inspection',
            },
          ],
        };

        const updated = [newProp, ...get().properties];
        set({ properties: updated, renewalAlerts: calculateRenewalAlerts(updated) });
        return newProp;
      },

      convertLeadToProperty: (leadId, planTier, flatNo, rent, deposit) => {
        const lead = get().leads.find((l) => l.id === leadId);
        const plan = get().plans.find((p) => p.tier === planTier) || get().plans[0];
        const propName = lead?.message ? lead.message.split('at ')[1]?.split(' ')[0] || 'Apartment' : 'Greenfield';
        const upid = `CPM-BLR-${flatNo.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

        const newProp: Property = {
          id: `prop-${Date.now()}`,
          upid,
          owner_id: 'user-owner-1',
          owner_name: lead?.name || 'New Property Owner',
          owner_phone: lead?.phone || '+91 98765 00000',
          owner_email: lead?.email || 'owner@prospect.com',
          city_id: 'city-blr',
          city_name: 'Bengaluru',
          locality_name: 'Bengaluru South',
          apartment_name: propName,
          flat_no: flatNo || 'B-302',
          property_type: 'apartment',
          bhk: 3,
          area_sqft: 1650,
          furnishing: 'semi',
          monthly_rent: rent || 35000,
          deposit: deposit || 200000,
          occupancy_status: 'vacant', // status is vacant on conversion!
          is_listed: true, // listed for rent on explore page!
          plan_id: plan.id,
          plan_tier: plan.tier as any,
          plan_name: plan.name,
          plan_commission_pct: plan.commission_pct,
          plan_sla_hours: plan.sla_hours,
          plan_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          address: `${flatNo}, ${propName}, Bengaluru, Karnataka`,
          pincode: '560068',
          version: 1,
          created_at: new Date().toISOString(),
          association_maintenance: {
            id: `maint-${Date.now()}`,
            property_id: `prop-${Date.now()}`,
            society_name: `${propName} Apartment Association`,
            amount: 3800,
            frequency: 'monthly',
            payer: 'tenant',
            status: 'pending',
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
          documents: [
            {
              id: `doc-${Date.now()}`,
              property_id: `prop-${Date.now()}`,
              name: `Cypress_${plan.name}_Agreement_${lead?.name?.replace(/\s+/g, '') || 'Owner'}.pdf`,
              type: 'pdf',
              category: 'cypress_owner_agreement',
              file_url: '#',
              size_kb: 1120,
              uploaded_at: new Date().toISOString(),
              uploaded_by: 'Cypress Operations Desk',
            },
          ],
          inventory: [
            { id: `inv-${Date.now()}-1`, property_id: `prop-${Date.now()}`, name: 'Modular Kitchen Cabinets', category: 'fixture', quantity: 1, condition: 'good' },
            { id: `inv-${Date.now()}-2`, property_id: `prop-${Date.now()}`, name: 'Water Geyser 25L', category: 'appliance', quantity: 2, condition: 'good' },
          ],
        };

        const updatedProps = [newProp, ...get().properties];
        const updatedLeads = get().leads.map((l) => (l.id === leadId ? { ...l, status: 'converted' as const } : l));
        set({
          properties: updatedProps,
          leads: updatedLeads,
          renewalAlerts: calculateRenewalAlerts(updatedProps),
        });
        return newProp;
      },

      assignOwnerUser: (propertyId, ownerUserId) => {
        const owner = get().registeredUsers.find((u) => u.id === ownerUserId && u.role === 'owner');
        if (!owner) return;
        const props = get().properties.map((p) => {
          if (p.id !== propertyId) return p;
          return {
            ...p,
            owner_id: owner.id,
            owner_name: owner.full_name,
            owner_phone: owner.mobile,
            owner_email: owner.email,
            owner_pan: owner.pan || p.owner_pan,
          };
        });
        const updated = props.find((p) => p.id === propertyId);
        set({
          properties: props,
          assignedProperties: updated
            ? { ...get().assignedProperties, [propertyId]: updated }
            : get().assignedProperties,
        });
      },

      assignTenantUser: (propertyId, tenantUserId, rent, deposit, startDate, endDate) => {
        const tenant = get().registeredUsers.find((u) => u.id === tenantUserId && u.role === 'tenant');
        if (!tenant) return;
        const start = startDate || new Date().toISOString();
        const end = endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const props = get().properties.map((p) => {
          if (p.id !== propertyId) return p;
          return {
            ...p,
            active_tenant_id: tenant.id, // Formal User ID connected!
            active_tenant_name: tenant.full_name,
            active_tenant_phone: tenant.mobile,
            active_tenant_email: tenant.email,
            monthly_rent: rent !== undefined ? rent : p.monthly_rent,
            deposit: deposit !== undefined ? deposit : p.deposit,
            lease_start_date: start,
            lease_end_date: end,
            occupancy_status: 'occupied' as const,
            is_listed: false, // Delisted upon tenancy assignment
            documents: [
              ...(p.documents || []),
              {
                id: `doc-${Date.now()}`,
                property_id: p.id,
                name: `Tenancy_Agreement_${tenant.full_name.replace(/\s+/g, '')}_${p.flat_no}.pdf`,
                type: 'pdf' as const,
                category: 'tenant_lease' as const,
                file_url: '#',
                size_kb: 1180,
                uploaded_at: new Date().toISOString(),
                uploaded_by: 'Cypress Admin',
              },
            ],
          };
        });
        const updated = props.find((p) => p.id === propertyId);
        set({
          properties: props,
          renewalAlerts: calculateRenewalAlerts(props),
          assignedProperties: updated
            ? { ...get().assignedProperties, [propertyId]: updated }
            : get().assignedProperties,
        });
      },

      endTenancy: (propertyId) => {
        const props = get().properties.map((p) => {
          if (p.id !== propertyId) return p;
          return {
            ...p,
            active_tenant_id: undefined,
            active_tenant_name: undefined,
            active_tenant_phone: undefined,
            active_tenant_email: undefined,
            lease_start_date: undefined,
            lease_end_date: undefined,
            occupancy_status: 'vacant' as const,
            is_listed: true, // Re-listed for rent
          };
        });
        const updated = props.find((p) => p.id === propertyId);
        set({
          properties: props,
          renewalAlerts: calculateRenewalAlerts(props),
          assignedProperties: updated
            ? { ...get().assignedProperties, [propertyId]: updated }
            : get().assignedProperties,
        });
      },

      registerDirectoryUser: (user) => {
        const id = `user-${user.role}-${Date.now().toString().slice(-4)}`;
        const newUser: DirectoryUser = {
          ...user,
          id,
          created_at: new Date().toISOString(),
        };
        set({ registeredUsers: [newUser, ...get().registeredUsers] });
        return newUser;
      },

      upsertDirectoryUser: (user) => {
        // Link a user resolved from the backend directory into the local store,
        // preserving its real ID so assignment lookups resolve correctly.
        const existing = get().registeredUsers.find((u) => u.id === user.id);
        if (existing) {
          const merged = { ...existing, ...user };
          set({
            registeredUsers: get().registeredUsers.map((u) => (u.id === user.id ? merged : u)),
          });
          return merged;
        }
        set({ registeredUsers: [user, ...get().registeredUsers] });
        return user;
      },

      assignTenant: (propertyId, tenantName, tenantPhone, rent, deposit, startDate) => {
        // Fallback backward-compatible method that links or creates a tenant user
        let tenant = get().registeredUsers.find(
          (u) => u.role === 'tenant' && (u.full_name.toLowerCase() === (tenantName || '').toLowerCase() || u.mobile === tenantPhone)
        );
        if (!tenant) {
          tenant = get().registerDirectoryUser({
            full_name: tenantName || 'Tenant User',
            mobile: tenantPhone || '+91 98765 00000',
            email: `${(tenantName || 'tenant').toLowerCase().replace(/\s+/g, '')}@cypress.local`,
            role: 'tenant',
            status: 'active',
          });
        }
        get().assignTenantUser(propertyId, tenant.id, rent, deposit, startDate);
      },

      upgradePropertyPlan: (propertyId, newTier) => {
        const plan = get().plans.find((p) => p.tier === newTier);
        if (!plan) return;
        const props = get().properties.map((p) => {
          if (p.id !== propertyId) return p;
          return {
            ...p,
            plan_id: plan.id,
            plan_tier: plan.tier as any,
            plan_name: plan.name,
            plan_commission_pct: plan.commission_pct,
            plan_sla_hours: plan.sla_hours,
            plan_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          };
        });
        set({ properties: props, renewalAlerts: calculateRenewalAlerts(props) });
      },

      updateListingStatus: (propertyId, isListed) => {
        const props = get().properties.map((p) => (p.id === propertyId ? { ...p, is_listed: isListed } : p));
        set({ properties: props });
      },

      addDocument: (propertyId, doc) => {
        const newDoc: PropertyDocument = {
          ...doc,
          id: `doc-${Date.now()}`,
          property_id: propertyId,
          uploaded_at: new Date().toISOString(),
        };
        const props = get().properties.map((p) => (p.id === propertyId ? { ...p, documents: [...(p.documents || []), newDoc] } : p));
        set({ properties: props });
      },

      loadAttachments: async () => {
        if (get().attachmentsLoaded) return;
        const stored = await idbLoadAllAttachments();
        // Merge stored buckets in, letting any in-memory buckets (added earlier
        // this session) take precedence.
        set({
          propertyAttachments: { ...stored, ...get().propertyAttachments },
          attachmentsLoaded: true,
        });
      },

      addPropertyDocument: async (propertyId, doc) => {
        const newDoc: PropertyDocument = {
          ...doc,
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          property_id: propertyId,
          uploaded_at: new Date().toISOString(),
        };
        const buckets = get().propertyAttachments;
        const bucket = buckets[propertyId] || { documents: [], photos: [], videos: [] };
        const nextBucket = { ...bucket, documents: [...bucket.documents, newDoc] };
        set({ propertyAttachments: { ...buckets, [propertyId]: nextBucket } });
        await idbSaveAttachment(propertyId, nextBucket);
      },

      removePropertyDocument: (propertyId, docId) => {
        const buckets = get().propertyAttachments;
        const bucket = buckets[propertyId];
        if (!bucket) return;
        const nextBucket = { ...bucket, documents: bucket.documents.filter((d) => d.id !== docId) };
        set({ propertyAttachments: { ...buckets, [propertyId]: nextBucket } });
        idbSaveAttachment(propertyId, nextBucket).catch((e) => console.error('persist attachments', e));
      },

      addPropertyPhotos: async (propertyId, assets) => {
        const buckets = get().propertyAttachments;
        const bucket = buckets[propertyId] || { documents: [], photos: [], videos: [] };
        const now = new Date().toISOString();
        const newAssets: StoredMediaAsset[] = assets.map((a, i) => ({
          ...a,
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
          uploaded_at: now,
        }));
        const nextBucket = { ...bucket, photos: [...bucket.photos, ...newAssets] };
        set({ propertyAttachments: { ...buckets, [propertyId]: nextBucket } });
        await idbSaveAttachment(propertyId, nextBucket);
      },

      removePropertyPhoto: (propertyId, id) => {
        const buckets = get().propertyAttachments;
        const bucket = buckets[propertyId];
        if (!bucket) return;
        const nextBucket = { ...bucket, photos: bucket.photos.filter((p) => p.id !== id) };
        set({ propertyAttachments: { ...buckets, [propertyId]: nextBucket } });
        idbSaveAttachment(propertyId, nextBucket).catch((e) => console.error('persist attachments', e));
      },

      addPropertyVideo: async (propertyId, asset) => {
        const buckets = get().propertyAttachments;
        const bucket = buckets[propertyId] || { documents: [], photos: [], videos: [] };
        const newAsset: StoredMediaAsset = {
          ...asset,
          id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          uploaded_at: new Date().toISOString(),
        };
        const nextBucket = { ...bucket, videos: [...bucket.videos, newAsset] };
        set({ propertyAttachments: { ...buckets, [propertyId]: nextBucket } });
        // Await the durable write so callers can surface quota/save failures and
        // only report success once the video is actually saved.
        await idbSaveAttachment(propertyId, nextBucket);
      },

      removePropertyVideo: (propertyId, id) => {
        const buckets = get().propertyAttachments;
        const bucket = buckets[propertyId];
        if (!bucket) return;
        const nextBucket = { ...bucket, videos: bucket.videos.filter((v) => v.id !== id) };
        set({ propertyAttachments: { ...buckets, [propertyId]: nextBucket } });
        idbSaveAttachment(propertyId, nextBucket).catch((e) => console.error('persist attachments', e));
      },

      loadRentPayments: async () => {
        // Source of truth is the backend so an admin on any device sees tenant
        // submissions. IndexedDB is a local cache/offline fallback.
        const byId = new Map<string, RentPayment>();
        try {
          const res = await api.get<ApiRentPayment[]>('/rent/payments', {
            query: { page: 1, page_size: 200 },
          });
          (res.data ?? []).map(mapApiRentPayment).forEach((p) => byId.set(p.id, p));
          // Cache backend records locally for offline viewing.
          for (const p of byId.values()) idbSaveRentPayment(p).catch(() => {});
        } catch {
          // Backend unreachable: fall back to whatever is cached locally.
          const stored = await idbLoadRentPayments();
          stored.forEach((p) => byId.set(p.id, p));
        }
        // Merge any records still only present locally (e.g. offline submissions).
        [...get().rentPayments].forEach((p) => {
          if (!byId.has(p.id)) byId.set(p.id, p);
        });
        const merged = Array.from(byId.values()).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
        set({ rentPayments: merged, rentPaymentsLoaded: true });
      },

      submitRentPayment: async (input) => {
        try {
          // Persist server-side so the Cypress admin can approve it from any
          // device. The backend derives tenant_id from the auth token.
          const res = await api.post<ApiRentPayment>('/rent/payments', {
            property_id: input.property_id,
            property_upid: input.property_upid,
            tenant_name: input.tenant_name,
            period: input.period,
            amount: input.amount,
            method: input.method,
            reference: input.reference,
            payment_date: input.payment_date,
            notes: input.notes,
            receipt_name: input.receipt_name,
            receipt_data_url: input.receipt_data_url,
            receipt_content_type: input.receipt_content_type,
            receipt_size_kb: input.receipt_size_kb,
            paid_to: input.paid_to,
          });
          const payment = mapApiRentPayment(res.data);
          await idbSaveRentPayment(payment).catch(() => {});
          set({ rentPayments: [payment, ...get().rentPayments] });
          return payment;
        } catch {
          // Offline / backend down: record locally so the tenant isn't blocked.
          // It will remain visible on this device until connectivity returns.
          const payment: RentPayment = {
            ...input,
            id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            status: 'awaiting_verification',
            created_at: new Date().toISOString(),
          };
          await idbSaveRentPayment(payment);
          set({ rentPayments: [payment, ...get().rentPayments] });
          return payment;
        }
      },

      updateRentPaymentStatus: async (paymentId, status) => {
        const existing = get().rentPayments.find((p) => p.id === paymentId);
        if (!existing) return;
        // Approve/reject on the backend so the decision is shared across devices.
        try {
          const res = await api.post<ApiRentPayment>(`/rent/payments/${paymentId}/decision`, { status });
          const updated = mapApiRentPayment(res.data);
          await idbSaveRentPayment(updated).catch(() => {});
          set({ rentPayments: get().rentPayments.map((p) => (p.id === paymentId ? updated : p)) });
        } catch {
          // Fallback: update locally (works for locally-only records / offline).
          const updated = { ...existing, status };
          await idbSaveRentPayment(updated).catch(() => {});
          set({ rentPayments: get().rentPayments.map((p) => (p.id === paymentId ? updated : p)) });
        }
      },

      addInventoryItem: (propertyId, item) => {
        const newItem: PropertyInventoryItem = {
          ...item,
          id: `inv-${Date.now()}`,
          property_id: propertyId,
        };
        const props = get().properties.map((p) => (p.id === propertyId ? { ...p, inventory: [...(p.inventory || []), newItem] } : p));
        set({ properties: props });
      },

      updateInventoryCondition: (propertyId, itemId, condition) => {
        const props = get().properties.map((p) => {
          if (p.id !== propertyId) return p;
          return {
            ...p,
            inventory: (p.inventory || []).map((i) => (i.id === itemId ? { ...i, condition } : i)),
          };
        });
        set({ properties: props });
      },

      updateAssociationMaintenance: (propertyId, record) => {
        const props = get().properties.map((p) => {
          if (p.id !== propertyId) return p;
          const current = p.association_maintenance || {
            id: `maint-${Date.now()}`,
            property_id: propertyId,
            society_name: 'Apartment Association',
            amount: 3000,
            frequency: 'monthly' as const,
            payer: 'tenant' as const,
            status: 'pending' as const,
            due_date: new Date().toISOString(),
          };
          return {
            ...p,
            association_maintenance: { ...current, ...record },
          };
        });
        set({ properties: props });
      },

      updateMoveCharge: (propertyId, charge) => {
        const props = get().properties.map((p) => {
          if (p.id !== propertyId) return p;
          const current = p.move_charges || [];
          const idx = current.findIndex((c) => c.id === charge.id);
          const updated = idx >= 0 ? current.map((c) => (c.id === charge.id ? charge : c)) : [...current, charge];
          return { ...p, move_charges: updated };
        });
        set({ properties: props });
      },

      submitVacateRequest: (propertyId, initiator, requestedDate, reason) => {
        const prop = get().properties.find((p) => p.id === propertyId);
        const req: any = {
          id: `vacate-${Date.now()}`,
          property_id: propertyId,
          property_upid: prop?.upid || 'CPM-PROP',
          initiator,
          requested_date: requestedDate,
          notice_period_days: 30,
          reason,
          status: 'submitted',
          created_at: new Date().toISOString(),
        };
        const props = get().properties.map((p) => (p.id === propertyId ? { ...p, vacate_request: req } : p));
        set({ properties: props });
      },

      acknowledgeVacateRequest: (propertyId) => {
        const props = get().properties.map((p) => {
          if (p.id !== propertyId || !p.vacate_request) return p;
          return {
            ...p,
            vacate_request: { ...p.vacate_request, status: 'acknowledged_by_cypress' as const },
          };
        });
        set({ properties: props });
      },

      generateRentReceipt: (input) => {
        const receipt: RentReceipt = {
          ...input,
          id: `rec-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        const historyItem: RentHistoryItem = {
          id: `rh-${Date.now()}`,
          period: input.month_year,
          rent_amount: input.rent_amount,
          maintenance_amount: input.maintenance_amount || 0,
          advance_balance: input.advance_amount || 0,
          status: 'paid',
          paid_at: input.payment_date,
          receipt_id: receipt.id,
          receipt_no: receipt.receipt_no,
        };

        set({
          receipts: [receipt, ...get().receipts],
          rentHistory: [historyItem, ...get().rentHistory],
        });
        return receipt;
      },

      raiseTicket: ({ propertyId, category, title, description, priority }) => {
        const prop = get().properties.find((p) => p.id === propertyId);
        const user = useAuth.getState().user;
        const role = get().currentRole;

        const ticket: Ticket = {
          id: `tkt-${Date.now()}`,
          property_upid: prop?.upid || 'CPM-PROP',
          property_id: propertyId,
          created_by: user?.id || 'user-tenant-1',
          created_by_name: user?.full_name || 'Tenant',
          created_by_role: role,
          category,
          title,
          description,
          priority,
          status: 'open',
          plan_covered: prop?.plan_tier === 'gold' || category === 'electrical' || category === 'plumber',
          sla_hours: prop?.plan_sla_hours || 48,
          sla_due_at: new Date(Date.now() + (prop?.plan_sla_hours || 48) * 60 * 60 * 1000).toISOString(),
          version: 1,
          created_at: new Date().toISOString(),
          history: [
            {
              id: `th-${Date.now()}`,
              ticket_id: `tkt-${Date.now()}`,
              to_status: 'open',
              note: `Ticket raised. Owner (${prop?.owner_name || 'Owner'}) and Cypress Operations notified.`,
              actor_id: user?.id || 'user',
              actor_name: user?.full_name || 'Reporter',
              created_at: new Date().toISOString(),
            },
          ],
        };

        set({ tickets: [ticket, ...get().tickets] });
        return ticket;
      },

      acknowledgeTicket: (ticketId, planCovered, estimatedCost, note) => {
        const tickets = get().tickets.map((t) => {
          if (t.id !== ticketId) return t;
          const nextStatus = planCovered ? 'cypress_acknowledged' : 'owner_approval_pending';
          const historyEntry = {
            id: `th-${Date.now()}`,
            ticket_id: ticketId,
            from_status: t.status,
            to_status: nextStatus,
            note: note || (planCovered
              ? 'Covered in property management service plan. Work initiated with Cypress team.'
              : `Work requires owner approval (Estimated cost: ₹${estimatedCost || 0}). Request dispatched to owner.`),
            actor_id: 'user-admin',
            actor_name: 'Cypress Operations',
            created_at: new Date().toISOString(),
          };
          return {
            ...t,
            status: nextStatus as any,
            plan_covered: planCovered,
            estimated_cost: estimatedCost,
            owner_approval_status: (planCovered ? undefined : 'pending') as 'pending' | undefined,
            history: [...(t.history || []), historyEntry],
          };
        });
        set({ tickets });
      },

      ownerApproveTicket: (ticketId, approved, note) => {
        const tickets = get().tickets.map((t) => {
          if (t.id !== ticketId) return t;
          const nextStatus = approved ? 'in_progress' : 'rejected';
          const historyEntry = {
            id: `th-${Date.now()}`,
            ticket_id: ticketId,
            from_status: t.status,
            to_status: nextStatus,
            note: note || (approved ? 'Owner approved estimated cost. Cypress authorized to proceed.' : 'Owner declined work proposal.'),
            actor_id: 'user-owner',
            actor_name: 'Property Owner',
            created_at: new Date().toISOString(),
          };
          return {
            ...t,
            status: nextStatus as any,
            owner_approval_status: (approved ? 'approved' : 'rejected') as 'approved' | 'rejected',
            history: [...(t.history || []), historyEntry],
          };
        });
        set({ tickets });
      },

      resolveTicket: (ticketId, note) => {
        const tickets = get().tickets.map((t) => {
          if (t.id !== ticketId) return t;
          const historyEntry = {
            id: `th-${Date.now()}`,
            ticket_id: ticketId,
            from_status: t.status,
            to_status: 'resolved',
            note: note || 'Maintenance task completed by technician. Notified tenant for completion acknowledgment.',
            actor_id: 'user-admin',
            actor_name: 'Cypress Operations',
            created_at: new Date().toISOString(),
          };
          return {
            ...t,
            status: 'resolved' as any,
            resolved_at: new Date().toISOString(),
            tenant_acknowledged: false,
            history: [...(t.history || []), historyEntry],
          };
        });
        set({ tickets });
      },

      tenantAcknowledgeTicket: (ticketId) => {
        const tickets = get().tickets.map((t) => {
          if (t.id !== ticketId) return t;
          const historyEntry = {
            id: `th-${Date.now()}`,
            ticket_id: ticketId,
            from_status: 'resolved',
            to_status: 'closed',
            note: 'Tenant verified work and confirmed completion satisfactory.',
            actor_id: 'user-tenant',
            actor_name: 'Tenant',
            created_at: new Date().toISOString(),
          };
          return {
            ...t,
            status: 'closed' as any,
            tenant_acknowledged: true,
            history: [...(t.history || []), historyEntry],
          };
        });
        set({ tickets });
      },

      updateLeadStatus: (leadId, status) => {
        const leads = get().leads.map((l) => (l.id === leadId ? { ...l, status } : l));
        set({ leads });
      },

      resetToDefaults: () => {
        set({
          properties: INITIAL_PROPERTIES,
          receipts: INITIAL_RECEIPTS,
          rentHistory: INITIAL_RENT_HISTORY,
          tickets: INITIAL_TICKETS,
          leads: INITIAL_LEADS,
          renewalAlerts: calculateRenewalAlerts(INITIAL_PROPERTIES),
        });
      },
    }),
    {
      name: 'cpm-data-store-v3',
      // Properties, the user directory, and derived alerts are sourced from the
      // backend database on each load — never persist them, so stale cached
      // records can't leak into the UI. Attachments live in IndexedDB (media-idb)
      // because their base64 media payloads exceed the localStorage quota.
      partialize: (state) => {
        const {
          properties: _properties,
          registeredUsers: _registeredUsers,
          renewalAlerts: _renewalAlerts,
          propertiesLoading: _propertiesLoading,
          propertiesLoaded: _propertiesLoaded,
          propertyAttachments: _propertyAttachments,
          attachmentsLoaded: _attachmentsLoaded,
          rentPayments: _rentPayments,
          rentPaymentsLoaded: _rentPaymentsLoaded,
          ...rest
        } = state;
        return rest;
      },
    }
  )
);
