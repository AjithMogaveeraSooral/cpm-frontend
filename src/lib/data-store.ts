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

export const INITIAL_DIRECTORY_USERS: DirectoryUser[] = [
  // Registered Property Owners
  {
    id: 'user-owner-1',
    full_name: 'Ramesh Kumar',
    mobile: '+91 98765 43210',
    email: 'ramesh.kumar@cypress.local',
    role: 'owner',
    pan: 'ABCDE1234F',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    created_at: '2025-01-10T09:00:00Z',
  },
  {
    id: 'user-owner-2',
    full_name: 'Priya Sundaram',
    mobile: '+91 98765 11223',
    email: 'priya.s@cypress.local',
    role: 'owner',
    pan: 'FGHIJ5678K',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    created_at: '2025-02-14T11:20:00Z',
  },
  {
    id: 'user-owner-3',
    full_name: 'Vikramaditya Hegde',
    mobile: '+91 98765 99887',
    email: 'vikram.hegde@cypress.local',
    role: 'owner',
    pan: 'KLMNO9012P',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    created_at: '2025-03-01T15:40:00Z',
  },
  {
    id: 'user-owner-4',
    full_name: 'Sangeetha Narayanan',
    mobile: '+91 98765 44332',
    email: 'sangeetha.n@cypress.local',
    role: 'owner',
    pan: 'PQRST3456U',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    created_at: '2025-04-18T10:15:00Z',
  },

  // Registered Tenants
  {
    id: 'user-tenant-1',
    full_name: 'Rahul Sharma',
    mobile: '+91 98765 43222',
    email: 'rahul.tenant@cypress.local',
    role: 'tenant',
    pan: 'TENNT1122A',
    employment_company: 'Infosys Technologies Ltd',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    created_at: '2025-05-20T14:30:00Z',
  },
  {
    id: 'user-tenant-2',
    full_name: 'Sneha Kulkarni',
    mobile: '+91 98765 77665',
    email: 'sneha.kulkarni@cypress.local',
    role: 'tenant',
    pan: 'TENNT3344B',
    employment_company: 'Cisco Systems India',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    created_at: '2025-06-12T08:50:00Z',
  },
  {
    id: 'user-tenant-3',
    full_name: 'Amitav Roy',
    mobile: '+91 98765 88990',
    email: 'amitav.roy@cypress.local',
    role: 'tenant',
    pan: 'TENNT5566C',
    employment_company: 'Flipkart Internet Pvt Ltd',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    created_at: '2025-07-04T12:10:00Z',
  },
  {
    id: 'user-tenant-4',
    full_name: 'Divya Chandran',
    mobile: '+91 98765 22334',
    email: 'divya.c@cypress.local',
    role: 'tenant',
    pan: 'TENNT7788D',
    employment_company: 'Google India (RMZ Infinity)',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop&q=80',
    created_at: '2025-08-19T16:00:00Z',
  },
];

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    upid: 'CPM-BLR-KNG-PRST-A804',
    owner_id: 'user-owner-1',
    owner_name: 'Ramesh Kumar',
    owner_phone: '+91 98765 43210',
    owner_email: 'ramesh.kumar@cypress.local',
    owner_pan: 'ABCDE1234F',
    city_id: 'city-blr',
    city_name: 'Bengaluru',
    locality_name: 'Kanakapura Road',
    apartment_name: 'Prestige Falcon City',
    flat_no: 'A-804',
    property_type: 'apartment',
    bhk: 3,
    area_sqft: 1820,
    furnishing: 'semi',
    monthly_rent: 42000,
    deposit: 250000,
    occupancy_status: 'occupied',
    is_listed: false,
    plan_id: 'plan-gold',
    plan_tier: 'gold',
    plan_name: 'Gold NRI Prime',
    plan_commission_pct: 15,
    plan_sla_hours: 24,
    plan_expires_at: '2027-03-31T00:00:00Z',
    address: 'Tower A, Flat 804, Prestige Falcon City, Kanakapura Main Rd, Doddakallasandra, Bengaluru',
    landmark: 'Opposite Forum Falcon City Mall',
    pincode: '560062',
    version: 3,
    created_at: '2025-06-15T10:00:00Z',
    active_tenant_id: 'user-tenant-1',
    active_tenant_name: 'Rahul Sharma',
    active_tenant_phone: '+91 98765 43222',
    lease_start_date: '2025-07-01T00:00:00Z',
    lease_end_date: '2026-06-30T00:00:00Z',
    association_maintenance: {
      id: 'maint-1',
      property_id: 'prop-1',
      society_name: 'Prestige Falcon City Apartment Owners Association',
      amount: 4500,
      frequency: 'monthly',
      payer: 'tenant', // Paid by tenant as per lease agreement
      status: 'paid',
      due_date: '2026-09-10T00:00:00Z',
      paid_at: '2026-09-02T14:20:00Z',
      receipt_no: 'PFCAOA-2026-SEP-084',
    },
    move_charges: [
      {
        id: 'charge-1',
        property_id: 'prop-1',
        type: 'move_in',
        amount: 5000,
        payer: 'tenant',
        cypress_assisted: true,
        status: 'completed',
        scheduled_date: '2025-07-01',
        notes: 'Pre-inspection completed, association move-in fee paid and receipt filed.',
      },
      {
        id: 'charge-2',
        property_id: 'prop-1',
        type: 'move_out',
        amount: 5000,
        payer: 'tenant',
        cypress_assisted: true,
        status: 'scheduled',
        notes: 'Deposit settlement checklist and exit inspection to be assisted by Cypress on lease completion.',
      },
    ],
    documents: [
      {
        id: 'doc-1',
        property_id: 'prop-1',
        name: 'Cypress_Owner_Management_Agreement_2025_26.pdf',
        type: 'pdf',
        category: 'cypress_owner_agreement',
        file_url: '#',
        size_kb: 1420,
        uploaded_at: '2025-06-16T11:30:00Z',
        uploaded_by: 'Cypress Legal',
      },
      {
        id: 'doc-2',
        property_id: 'prop-1',
        name: 'Registered_Rental_Agreement_RahulSharma.docx',
        type: 'docx',
        category: 'tenant_lease',
        file_url: '#',
        size_kb: 890,
        uploaded_at: '2025-06-28T16:00:00Z',
        uploaded_by: 'Cypress Admin',
      },
      {
        id: 'doc-3',
        property_id: 'prop-1',
        name: 'Owner_KYC_PAN_Aadhaar_Verified.pdf',
        type: 'pdf',
        category: 'kyc',
        file_url: '#',
        size_kb: 640,
        uploaded_at: '2025-06-15T10:45:00Z',
        uploaded_by: 'Ramesh Kumar',
      },
      {
        id: 'doc-4',
        property_id: 'prop-1',
        name: 'Prestige_Society_NOC_Tenant_MoveIn.pdf',
        type: 'pdf',
        category: 'association_noc',
        file_url: '#',
        size_kb: 320,
        uploaded_at: '2025-06-30T09:15:00Z',
        uploaded_by: 'Cypress Admin',
      },
    ],
    inventory: [
      { id: 'inv-1', property_id: 'prop-1', name: 'Daikin Inverter AC 1.5 Ton (Master Bed)', category: 'appliance', quantity: 1, condition: 'good', notes: 'Serviced July 2026' },
      { id: 'inv-2', property_id: 'prop-1', name: 'Haier Inverter AC 1.0 Ton (Guest Bed)', category: 'appliance', quantity: 1, condition: 'good' },
      { id: 'inv-3', property_id: 'prop-1', name: 'Racold 25L Storage Geyser', category: 'appliance', quantity: 3, condition: 'good' },
      { id: 'inv-4', property_id: 'prop-1', name: 'Modular Kitchen with Faber Chimney & Hob', category: 'fixture', quantity: 1, condition: 'good' },
      { id: 'inv-5', property_id: 'prop-1', name: 'Solid Teak 6-Seater Dining Table', category: 'furniture', quantity: 1, condition: 'good' },
      { id: 'inv-6', property_id: 'prop-1', name: 'L-Shaped Fabric Sofa (3+2)', category: 'furniture', quantity: 1, condition: 'fair', notes: 'Minor fabric wear on left armrest' },
      { id: 'inv-7', property_id: 'prop-1', name: 'Main Door Godrej Smart Lock & Master Keys', category: 'key', quantity: 3, condition: 'good', notes: 'RFID tags + 3 physical backup keys handed over' },
    ],
    media_photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&auto=format&fit=crop&q=80',
    ],
    media_video: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4',
  },
  {
    id: 'prop-2',
    upid: 'CPM-BLR-WFD-BRGD-C402',
    owner_id: 'user-owner-2',
    owner_name: 'Vikram Mehta',
    owner_phone: '+91 99001 23456',
    owner_email: 'vikram.mehta@example.com',
    city_id: 'city-blr',
    city_name: 'Bengaluru',
    locality_name: 'Whitefield',
    apartment_name: 'Brigade Cosmopolis',
    flat_no: 'C-402',
    property_type: 'apartment',
    bhk: 2,
    area_sqft: 1350,
    furnishing: 'full',
    monthly_rent: 36000,
    deposit: 180000,
    occupancy_status: 'vacant',
    is_listed: true,
    plan_id: 'plan-silver',
    plan_tier: 'silver',
    plan_name: 'Silver Comprehensive',
    plan_commission_pct: 10,
    plan_sla_hours: 48,
    plan_expires_at: '2026-11-30T00:00:00Z',
    address: 'Tower C, Flat 402, Brigade Cosmopolis, ITPL Main Rd, Whitefield, Bengaluru',
    landmark: 'Near Hope Farm Junction',
    pincode: '560066',
    version: 1,
    created_at: '2026-01-10T14:00:00Z',
    association_maintenance: {
      id: 'maint-2',
      property_id: 'prop-2',
      society_name: 'Brigade Cosmopolis Resident Welfare Association',
      amount: 3800,
      frequency: 'monthly',
      payer: 'owner', // Paid by owner while vacant
      status: 'paid',
      due_date: '2026-09-15T00:00:00Z',
      receipt_no: 'BCRWA-2026-AUG-112',
    },
    documents: [
      {
        id: 'doc-201',
        property_id: 'prop-2',
        name: 'Cypress_Silver_Management_Agreement_VikramMehta.pdf',
        type: 'pdf',
        category: 'cypress_owner_agreement',
        file_url: '#',
        size_kb: 1150,
        uploaded_at: '2026-01-11T12:00:00Z',
        uploaded_by: 'Cypress Legal',
      },
    ],
    inventory: [
      { id: 'inv-201', property_id: 'prop-2', name: 'LG 43-inch 4K Smart TV', category: 'appliance', quantity: 1, condition: 'good' },
      { id: 'inv-202', property_id: 'prop-2', name: 'Samsung Double Door Refrigerator 265L', category: 'appliance', quantity: 1, condition: 'good' },
      { id: 'inv-203', property_id: 'prop-2', name: 'Bosch Front Load Washing Machine 7kg', category: 'appliance', quantity: 1, condition: 'good' },
      { id: 'inv-204', property_id: 'prop-2', name: 'Queen Bed with Orthopedic Mattress (2 rooms)', category: 'furniture', quantity: 2, condition: 'good' },
    ],
    media_photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'prop-3',
    upid: 'CPM-BLR-SJP-SBHA-B1201',
    owner_id: 'user-owner-1',
    owner_name: 'Ramesh Kumar',
    owner_phone: '+91 98765 43210',
    owner_email: 'ramesh.kumar@cypress.local',
    city_id: 'city-blr',
    city_name: 'Bengaluru',
    locality_name: 'Sarjapur Road',
    apartment_name: 'Sobha Dream Acres',
    flat_no: 'B-1201',
    property_type: 'apartment',
    bhk: 2,
    area_sqft: 1210,
    furnishing: 'unfurnished',
    monthly_rent: 28000,
    deposit: 150000,
    occupancy_status: 'occupied',
    is_listed: false,
    plan_id: 'plan-bronze',
    plan_tier: 'bronze',
    plan_name: 'Bronze Essential',
    plan_commission_pct: 5,
    plan_sla_hours: 72,
    plan_expires_at: '2026-09-25T00:00:00Z', // Expiring in 18 days! -> Nearing renewal!
    address: 'Wing B, Flat 1201, Sobha Dream Acres, Panathur Main Rd, Off Sarjapur Rd, Bengaluru',
    landmark: 'Near Varthur Police Station',
    pincode: '560087',
    version: 2,
    created_at: '2025-09-25T11:00:00Z',
    active_tenant_id: 'user-tenant-2',
    active_tenant_name: 'Deepak Nair',
    active_tenant_phone: '+91 98450 11223',
    lease_start_date: '2025-10-01T00:00:00Z',
    lease_end_date: '2026-09-30T00:00:00Z', // Lease also ending this month!
    association_maintenance: {
      id: 'maint-3',
      property_id: 'prop-3',
      society_name: 'Sobha Dream Acres Owners Association',
      amount: 3200,
      frequency: 'monthly',
      payer: 'tenant',
      status: 'pending',
      due_date: '2026-09-10T00:00:00Z',
    },
    documents: [
      {
        id: 'doc-301',
        property_id: 'prop-3',
        name: 'Sobha_DreamAcres_Bronze_Agreement.pdf',
        type: 'pdf',
        category: 'cypress_owner_agreement',
        file_url: '#',
        size_kb: 940,
        uploaded_at: '2025-09-26T10:00:00Z',
        uploaded_by: 'Cypress Legal',
      },
    ],
    inventory: [
      { id: 'inv-301', property_id: 'prop-3', name: 'Havells Ceiling Fans with Speed Regulators', category: 'fixture', quantity: 4, condition: 'good' },
      { id: 'inv-302', property_id: 'prop-3', name: 'Water Purifier Aquaguard Ro+UV', category: 'appliance', quantity: 1, condition: 'fair', notes: 'Filter replacement due in 3 months' },
    ],
    media_photos: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    ],
  },
];

const INITIAL_RECEIPTS: RentReceipt[] = [
  {
    id: 'rec-001',
    receipt_no: 'CPM-REC-2026-08-012',
    property_id: 'prop-1',
    property_upid: 'CPM-BLR-KNG-PRST-A804',
    property_address: 'Flat A-804, Prestige Falcon City, Kanakapura Main Rd, Bengaluru 560062',
    owner_id: 'user-owner-1',
    owner_name: 'Ramesh Kumar',
    owner_pan: 'ABCDE1234F',
    tenant_id: 'user-tenant-1',
    tenant_name: 'Rahul Sharma',
    month_year: 'August 2026',
    rent_amount: 42000,
    maintenance_amount: 4500,
    advance_amount: 0,
    total_amount: 46500,
    payment_mode: 'UPI',
    transaction_id: 'UPI-HDFC-623498112344',
    payment_date: '2026-08-04',
    generated_by: 'Cypress Administrator (Automated Post Rent Verification)',
    created_at: '2026-08-05T10:15:00Z',
    notes: 'Official rent payment receipt for HRA tax exemption proof.',
  },
  {
    id: 'rec-002',
    receipt_no: 'CPM-REC-2026-07-009',
    property_id: 'prop-1',
    property_upid: 'CPM-BLR-KNG-PRST-A804',
    property_address: 'Flat A-804, Prestige Falcon City, Kanakapura Main Rd, Bengaluru 560062',
    owner_id: 'user-owner-1',
    owner_name: 'Ramesh Kumar',
    owner_pan: 'ABCDE1234F',
    tenant_id: 'user-tenant-1',
    tenant_name: 'Rahul Sharma',
    month_year: 'July 2026',
    rent_amount: 42000,
    maintenance_amount: 4500,
    advance_amount: 0,
    total_amount: 46500,
    payment_mode: 'NEFT',
    transaction_id: 'NEFT-ICIC-0982218491',
    payment_date: '2026-07-03',
    generated_by: 'Cypress Administrator',
    created_at: '2026-07-04T09:30:00Z',
  },
];

const INITIAL_RENT_HISTORY: RentHistoryItem[] = [
  { id: 'rh-1', period: 'August 2026', rent_amount: 42000, maintenance_amount: 4500, advance_balance: 250000, status: 'paid', paid_at: '2026-08-04', receipt_id: 'rec-001', receipt_no: 'CPM-REC-2026-08-012' },
  { id: 'rh-2', period: 'July 2026', rent_amount: 42000, maintenance_amount: 4500, advance_balance: 250000, status: 'paid', paid_at: '2026-07-03', receipt_id: 'rec-002', receipt_no: 'CPM-REC-2026-07-009' },
  { id: 'rh-3', period: 'June 2026', rent_amount: 42000, maintenance_amount: 4500, advance_balance: 250000, status: 'paid', paid_at: '2026-06-05', receipt_no: 'CPM-REC-2026-06-004' },
  { id: 'rh-4', period: 'May 2026', rent_amount: 42000, maintenance_amount: 4500, advance_balance: 250000, status: 'paid', paid_at: '2026-05-04', receipt_no: 'CPM-REC-2026-05-018' },
  { id: 'rh-5', period: 'September 2026', rent_amount: 42000, maintenance_amount: 4500, advance_balance: 250000, status: 'pending' },
];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt-1',
    property_upid: 'CPM-BLR-KNG-PRST-A804',
    property_id: 'prop-1',
    created_by: 'user-tenant-1',
    created_by_name: 'Rahul Sharma',
    created_by_role: 'tenant',
    category: 'electrical',
    title: 'Master Bedroom AC trip switch / MCB sparking',
    description: 'The 16A MCB in the distribution board trips whenever the master bedroom AC is turned on for more than 10 minutes. Smells like burnt plastic.',
    priority: 'high',
    status: 'cypress_acknowledged',
    plan_covered: true, // Covered under Gold NRI Prime plan routine electrical maintenance!
    sla_hours: 24,
    sla_due_at: '2026-09-08T18:00:00Z',
    version: 2,
    created_at: '2026-09-07T08:30:00Z',
    history: [
      { id: 'th-1', ticket_id: 'tkt-1', to_status: 'open', note: 'Ticket raised by tenant Rahul Sharma. Owner Ramesh Kumar and Cypress Ops notified.', actor_id: 'user-tenant-1', actor_name: 'Rahul Sharma', created_at: '2026-09-07T08:30:00Z' },
      { id: 'th-2', ticket_id: 'tkt-1', from_status: 'open', to_status: 'cypress_acknowledged', note: 'Cypress acknowledged ticket. Checked property plan: Gold NRI Prime — Covered in plan at no extra charge to owner. Electrician team dispatched.', actor_id: 'user-admin', actor_name: 'Cypress Operations', created_at: '2026-09-07T09:45:00Z' },
    ],
  },
  {
    id: 'tkt-2',
    property_upid: 'CPM-BLR-KNG-PRST-A804',
    property_id: 'prop-1',
    created_by: 'user-tenant-1',
    created_by_name: 'Rahul Sharma',
    created_by_role: 'tenant',
    category: 'plumber',
    title: 'Kitchen Sink Tap aerator pipe leakage',
    description: 'Slow leak under the modular sink basket. Water seeping into lower wooden cabinet.',
    priority: 'medium',
    status: 'owner_approval_pending',
    plan_covered: false, // Heavy replacement requires owner sign-off
    estimated_cost: 1800,
    owner_approval_status: 'pending',
    sla_hours: 48,
    sla_due_at: '2026-09-09T14:00:00Z',
    version: 2,
    created_at: '2026-09-06T14:00:00Z',
    history: [
      { id: 'th-201', ticket_id: 'tkt-2', to_status: 'open', note: 'Ticket raised by tenant. Owner and Cypress notified.', actor_id: 'user-tenant-1', actor_name: 'Rahul Sharma', created_at: '2026-09-06T14:00:00Z' },
      { id: 'th-202', ticket_id: 'tkt-2', from_status: 'open', to_status: 'owner_approval_pending', note: 'Cypress technician inspected. Brass angle valve & flexi hose replacement required (₹1,800). Owner approval requested.', actor_id: 'user-admin', actor_name: 'Cypress Operations', created_at: '2026-09-06T17:00:00Z' },
    ],
  },
  {
    id: 'tkt-3',
    property_upid: 'CPM-BLR-KNG-PRST-A804',
    property_id: 'prop-1',
    created_by: 'user-tenant-1',
    created_by_name: 'Rahul Sharma',
    created_by_role: 'tenant',
    category: 'carpenter',
    title: 'Balcony sliding mesh door realignment',
    description: 'Sliding mosquito mesh track was jammed after heavy rains. Rollers replaced and lubricated.',
    priority: 'low',
    status: 'resolved',
    plan_covered: true,
    tenant_acknowledged: false,
    sla_hours: 48,
    sla_due_at: '2026-09-05T12:00:00Z',
    resolved_at: '2026-09-05T11:20:00Z',
    version: 4,
    created_at: '2026-09-04T09:00:00Z',
    history: [
      { id: 'th-301', ticket_id: 'tkt-3', to_status: 'open', actor_id: 'user-tenant-1', created_at: '2026-09-04T09:00:00Z' },
      { id: 'th-302', ticket_id: 'tkt-3', from_status: 'open', to_status: 'cypress_acknowledged', actor_id: 'user-admin', created_at: '2026-09-04T10:00:00Z' },
      { id: 'th-303', ticket_id: 'tkt-3', from_status: 'cypress_acknowledged', to_status: 'resolved', note: 'Carpenter Ramesh Babu completed the roller replacement. Awaiting tenant final acknowledgment.', actor_id: 'user-admin', created_at: '2026-09-05T11:20:00Z' },
    ],
  },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    type: 'enquiry',
    name: 'Suresh Nambiar',
    phone: '9845098765',
    email: 'suresh.nambiar@gmail.com',
    message: '[Property Owner Interest] Looking to onboard my 3BHK flat at Brigade Meadows, Kanakapura Road for complete NRI tenant search and maintenance management.',
    status: 'new',
    created_at: '2026-09-06T15:30:00Z',
  },
  {
    id: 'lead-2',
    type: 'callback',
    name: 'Pooja Hegde',
    phone: '9988776655',
    email: 'pooja.h@yahoo.com',
    message: 'Interested in renting a 2BHK flat near Whitefield or Sarjapur under 35k. Please call back with available options.',
    status: 'contacted',
    created_at: '2026-09-05T11:10:00Z',
  },
  {
    id: 'lead-3',
    type: 'enquiry',
    name: 'Karthik Rao',
    phone: '9740112233',
    email: 'karthik.rao@outlook.com',
    message: '[Property Owner Interest] Own 3BHK in Godrej Eternity, Doddakallasandra. Want to assign Silver plan.',
    status: 'new',
    created_at: '2026-09-07T07:45:00Z',
  },
];

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

  // Role switching
  switchRole: (role: 'cypress_admin' | 'owner' | 'tenant') => void;
  setCity: (cityId: string) => void;

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

      switchRole: (role) => {
        set({ currentRole: role });
      },

      setCity: (cityId) => set({ selectedCity: cityId }),

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
        set({ properties: props });
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
        set({ properties: props, renewalAlerts: calculateRenewalAlerts(props) });
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
        set({ properties: props, renewalAlerts: calculateRenewalAlerts(props) });
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
      name: 'cpm-data-store-v2',
    }
  )
);
