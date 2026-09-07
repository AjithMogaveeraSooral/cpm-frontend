'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  FileText,
  Home,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Upload,
  Download,
  Plus,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  DollarSign,
  ClipboardList,
  Wrench,
  Check,
  X,
  Clock,
  LogOut,
  Link2,
} from 'lucide-react';
import { useDataStore, SERVICE_PLANS } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatINR, formatDate } from '@/lib/utils';
import { UserSelectorModal } from '@/components/user-selector-modal';
import type { Property, PropertyDocument, PropertyInventoryItem } from '@/lib/types';

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    currentRole,
    properties,
    registeredUsers,
    assignOwnerUser,
    assignTenantUser,
    endTenancy,
    assignTenant,
    upgradePropertyPlan,
    updateListingStatus,
    addDocument,
    addInventoryItem,
    updateInventoryCondition,
    updateAssociationMaintenance,
    submitVacateRequest,
    acknowledgeVacateRequest,
    renewalAlerts,
  } = useDataStore();

  const property = properties.find((p) => p.id === params.id) || properties[0];

  const [activeTab, setActiveTab] = useState<
    'overview' | 'tenant' | 'documents' | 'media' | 'inventory' | 'maintenance' | 'vacate'
  >('overview');

  // User Selector Modals
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);

  // Assign Tenant Form
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantRent, setTenantRent] = useState(String(property?.monthly_rent || ''));
  const [tenantDeposit, setTenantDeposit] = useState(String(property?.deposit || ''));
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Upgrade Plan Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Add Document Modal
  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'pdf' | 'docx' | 'xlsx'>('pdf');
  const [docCategory, setDocCategory] = useState<PropertyDocument['category']>('cypress_owner_agreement');

  // Add Inventory Item Modal
  const [showInvModal, setShowInvModal] = useState(false);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState<PropertyInventoryItem['category']>('appliance');
  const [invQty, setInvQty] = useState('1');
  const [invCondition, setInvCondition] = useState<PropertyInventoryItem['condition']>('good');
  const [invNotes, setInvNotes] = useState('');

  // Vacate Request Form
  const [vacateDate, setVacateDate] = useState('2026-10-31');
  const [vacateReason, setVacateReason] = useState('Job relocation to different city / end of tenancy period');
  const [vacateSubmitted, setVacateSubmitted] = useState(false);

  if (!property) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Property not found.</p>
        <Link href="/properties">
          <Button variant="secondary" className="mt-3">
            Back to Properties
          </Button>
        </Link>
      </div>
    );
  }

  const isAdmin = currentRole === 'cypress_admin';
  const isOwner = currentRole === 'owner';
  const isTenant = currentRole === 'tenant';

  const renewalAlert = renewalAlerts.find((a) => a.property_id === property.id);
  const isOccupied = property.occupancy_status === 'occupied';

  const handleAssignTenant = (e: React.FormEvent) => {
    e.preventDefault();
    assignTenant(
      property.id,
      tenantName,
      tenantPhone,
      Number(tenantRent),
      Number(tenantDeposit),
      startDate
    );
    setAssignSuccess(true);
    setTimeout(() => setAssignSuccess(false), 3000);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    addDocument(property.id, {
      name: docName.endsWith(`.${docType}`) ? docName : `${docName}.${docType}`,
      type: docType,
      category: docCategory,
      file_url: '#',
      size_kb: Math.floor(Math.random() * 800) + 200,
      uploaded_by: isAdmin ? 'Cypress Admin' : isOwner ? 'Property Owner' : 'Tenant',
    });
    setDocName('');
    setShowDocModal(false);
  };

  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim()) return;
    addInventoryItem(property.id, {
      name: invName,
      category: invCategory,
      quantity: Number(invQty) || 1,
      condition: invCondition,
      notes: invNotes,
    });
    setInvName('');
    setInvNotes('');
    setShowInvModal(false);
  };

  const handleVacateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVacateRequest(
      property.id,
      isOwner ? 'owner' : 'tenant',
      vacateDate,
      vacateReason
    );
    setVacateSubmitted(true);
  };

  return (
    <div className="max-w-6xl pb-16">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Properties
        </Link>
      </div>

      {/* Main Property Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-cypress-800 bg-cypress-50 border border-cypress-200 px-2.5 py-1 rounded-lg">
                {property.upid}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                  isOccupied
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                ● {property.occupancy_status}
              </span>
              <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-semibold">
                {property.plan_name || `${property.plan_tier?.toUpperCase()} Plan`}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              {property.bhk} BHK {property.apartment_name || property.property_type} · Flat {property.flat_no}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{property.address}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:text-right">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Rent</span>
              <p className="text-2xl font-extrabold text-cypress-800">{formatINR(property.monthly_rent)}</p>
              <p className="text-xs text-slate-500">Deposit: {formatINR(property.deposit)}</p>
            </div>

            {isAdmin && (
              <div className="pl-4 border-l border-slate-200">
                <Button variant="secondary" onClick={() => setShowUpgradeModal(true)}>
                  <Sparkles className="h-3.5 w-3.5" /> Change Plan
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Nearing Renewal Banner */}
        {renewalAlert && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Service Plan Expiring in {renewalAlert.days_left} Days!</span>
                <p className="text-amber-700 text-[11px]">
                  Expires on {new Date(renewalAlert.expires_at).toLocaleDateString('en-IN')}. Both Owner and Cypress have been notified.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                upgradePropertyPlan(property.id, (property.plan_tier || 'bronze') as any);
                alert('Plan renewal extended for 12 months!');
              }}
              className="rounded-lg bg-amber-600 px-3 py-1.5 font-bold text-white shadow-soft hover:bg-amber-700 shrink-0"
            >
              Renew Plan Now
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 flex overflow-x-auto border-b border-slate-200 gap-6 text-xs sm:text-sm font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-cypress-600 text-cypress-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Plan
        </button>
        <button
          onClick={() => setActiveTab('tenant')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'tenant'
              ? 'border-cypress-600 text-cypress-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Tenant Assignment & Details
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'documents'
              ? 'border-cypress-600 text-cypress-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Documents Folder ({property.documents?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'media'
              ? 'border-cypress-600 text-cypress-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Photos & Videos ({property.media_photos?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'inventory'
              ? 'border-cypress-600 text-cypress-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Inventory List ({property.inventory?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'maintenance'
              ? 'border-cypress-600 text-cypress-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Association Maint. & Charges
        </button>
        <button
          onClick={() => setActiveTab('vacate')}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'vacate'
              ? 'border-cypress-600 text-cypress-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Request to Vacate
        </button>
      </div>

      {/* Tab Content */}

      {/* TAB 1: OVERVIEW & PLAN */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Property Specifications
              </h3>
              <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs sm:text-sm">
                <div>
                  <dt className="text-slate-400 font-medium">UPID</dt>
                  <dd className="font-mono font-bold text-cypress-700">{property.upid}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Property Type</dt>
                  <dd className="font-semibold text-slate-900 capitalize">
                    {property.bhk} BHK · {property.property_type}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Super Built-up Area</dt>
                  <dd className="font-semibold text-slate-900">{property.area_sqft || 1600} sq.ft.</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Furnishing Status</dt>
                  <dd className="font-semibold text-slate-900 capitalize">{property.furnishing}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Occupancy Status</dt>
                  <dd className="font-bold capitalize text-slate-900">{property.occupancy_status}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Marketplace Listing</dt>
                  <dd className="font-semibold text-slate-900">
                    {property.is_listed ? (
                      <span className="text-emerald-700 font-bold">Publicly Listed (For Rent)</span>
                    ) : (
                      <span className="text-slate-500">Unlisted (Assigned to Tenant)</span>
                    )}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-400 font-medium">Full Address</dt>
                  <dd className="text-slate-700 mt-0.5">{property.address}</dd>
                </div>
              </dl>
            </Card>

            {/* Public Listing Toggle for Admins */}
            {isAdmin && (
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Marketplace Rental Listing</h4>
                    <p className="text-xs text-slate-500">
                      When enabled and property is vacant, home seekers can view and enquire from the Explore page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateListingStatus(property.id, !property.is_listed)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      property.is_listed
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        : 'bg-cypress-gradient text-white shadow-soft'
                    }`}
                  >
                    {property.is_listed ? 'Delist from Marketplace' : 'List on Marketplace'}
                  </button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Service Plan Details */}
          <div className="space-y-6">
            <Card className="border-cypress-200 bg-gradient-to-b from-cypress-50/50 to-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-cypress-700">
                  Active Service Plan
                </span>
                <span className="rounded-full bg-cypress-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  {property.plan_tier?.toUpperCase() || 'GOLD'}
                </span>
              </div>

              <h4 className="text-lg font-extrabold text-slate-900">{property.plan_name || 'Service Plan'}</h4>
              <p className="text-xs text-slate-600 mt-1">
                Institutional property management with dedicated property manager and SLA.
              </p>

              <div className="mt-4 space-y-2.5 text-xs border-t border-cypress-100 pt-3 text-slate-700">
                <div className="flex justify-between">
                  <span>Management Fee:</span>
                  <span className="font-bold text-cypress-800">{property.plan_commission_pct || 10}% commission</span>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance SLA:</span>
                  <span className="font-bold">{property.plan_sla_hours || 24} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Inspection Visits:</span>
                  <span className="font-bold">Quarterly (4/year)</span>
                </div>
                <div className="flex justify-between">
                  <span>Expires On:</span>
                  <span className="font-medium">{formatDate(property.plan_expires_at || '')}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-cypress-100 flex justify-between items-center">
                <Button
                  variant="secondary"
                  className="w-full text-xs font-bold"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Upgrade / Change Plan
                </Button>
              </div>
            </Card>

            {/* Owner Details Card */}
            <Card>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Property Owner
                </h4>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowOwnerModal(true)}
                    className="text-xs font-bold text-cypress-700 hover:text-cypress-900 hover:underline flex items-center gap-1"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Reassign Owner (User ID)
                  </button>
                )}
              </div>

              {/* Owner User ID Link Badge */}
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold bg-cypress-50 text-cypress-800 border border-cypress-200 px-2.5 py-1 rounded-md">
                  🔗 User ID: {property.owner_id || 'user-owner-1'}
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Verified Owner
                </span>
              </div>

              <p className="text-sm font-bold text-slate-900">{property.owner_name || 'Owner'}</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">{property.owner_phone || '—'}</p>
              {property.owner_email && (
                <p className="text-xs text-slate-500 mt-0.5">{property.owner_email}</p>
              )}
              <p className="text-xs text-slate-500 font-mono mt-0.5">PAN: {property.owner_pan || '—'}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Connected Owner account receives quarterly statements, digital lease authorizations, and direct rental credit.
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: TENANT ASSIGNMENT & DETAILS */}
      {activeTab === 'tenant' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Active Tenant Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Current Assigned Tenant</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  property.active_tenant_name
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {property.active_tenant_name ? 'Active Lease (Occupied)' : 'No Tenant (Vacant)'}
              </span>
            </div>

            {property.active_tenant_name ? (
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Connected Tenant User ID Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-lg">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Connected User ID: {property.active_tenant_id || 'user-tenant-1'}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Verified Tenant Account
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tenant Full Name:</span>
                    <span className="font-bold text-slate-900">{property.active_tenant_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Number:</span>
                    <span className="font-mono font-medium text-slate-800">{property.active_tenant_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="text-slate-800">
                      {property.active_tenant_email ||
                        registeredUsers.find((u) => u.id === property.active_tenant_id)?.email ||
                        'tenant@cypress.local'}
                    </span>
                  </div>
                  {registeredUsers.find((u) => u.id === property.active_tenant_id)?.employment_company && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Employment / Employer:</span>
                      <span className="font-medium text-slate-800">
                        {registeredUsers.find((u) => u.id === property.active_tenant_id)?.employment_company}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Rent:</span>
                    <span className="font-bold text-cypress-800">{formatINR(property.monthly_rent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Deposit:</span>
                    <span className="font-medium text-slate-800">{formatINR(property.deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lease Period:</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(property.lease_start_date || '')} – {formatDate(property.lease_end_date || '')}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    Tenant User ID is authenticated. Delisted from public explore and synchronized across Cypress billing.
                  </span>
                </div>

                {isAdmin && (
                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowTenantModal(true)}
                      className="text-xs font-bold"
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1 text-cypress-700" /> Reassign / Replace Tenant (User ID)
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to end this lease? The property will be marked Vacant and relisted on Marketplace.')) {
                          endTenancy(property.id);
                        }
                      }}
                      className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-1" /> End Tenancy / Vacate
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Property is Currently Vacant</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    No tenant user account is connected. Select a verified tenant user ID to assign occupancy and generate digital agreements.
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    type="button"
                    onClick={() => setShowTenantModal(true)}
                    className="bg-cypress-gradient text-white shadow-soft text-xs font-bold"
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" /> Connect Tenant User ID
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Connect Tenant Directory (Admin View) */}
          {isAdmin && (
            <Card>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-cypress-600" />
                  Connect Tenant User Account
                </h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowTenantModal(true)}
                  className="text-xs font-bold text-cypress-700 border-cypress-200 hover:bg-cypress-50"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Full Directory Modal
                </Button>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Assigning a tenant connects their formal User ID (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">user-tenant-1</code>), issues a digital lease agreement, and delists the property from the explore page.
              </p>

              {assignSuccess && (
                <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
                  ✓ Tenant User ID successfully linked & lease agreement generated!
                </div>
              )}

              {/* Registered Tenant Quick-Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Select from Registered Tenant Users ({registeredUsers.filter((u) => u.role === 'tenant').length})
                </label>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {registeredUsers
                    .filter((u) => u.role === 'tenant')
                    .map((tUser) => {
                      const isConnected = property.active_tenant_id === tUser.id;
                      return (
                        <div
                          key={tUser.id}
                          onClick={() => {
                            assignTenantUser(
                              property.id,
                              tUser.id,
                              property.monthly_rent,
                              property.deposit,
                              startDate
                            );
                            setAssignSuccess(true);
                            setTimeout(() => setAssignSuccess(false), 3000);
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                            isConnected
                              ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white hover:border-cypress-400 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                tUser.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(tUser.full_name)}&background=0284c7&color=fff`
                              }
                              alt={tUser.full_name}
                              className="h-9 w-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">{tUser.full_name}</span>
                                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
                                  🔗 {tUser.id}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono">
                                {tUser.mobile} • {tUser.employment_company || 'Tenant'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                              isConnected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-cypress-700 hover:text-white'
                            }`}
                          >
                            {isConnected ? 'Connected' : 'Connect ID'}
                          </span>
                        </div>
                      );
                    })}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Need custom rent terms or register a new tenant?</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowTenantModal(true)}
                    className="text-xs font-bold"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Custom Terms / New User
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: DOCUMENTS FOLDER */}
      {activeTab === 'documents' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Legal & Property Documents Folder</h3>
              <p className="text-xs text-slate-500">
                PDF, Word, and Excel agreements between Cypress & Owner, tenant lease, and society NOCs.
              </p>
            </div>
            <Button onClick={() => setShowDocModal(true)}>
              <Upload className="h-4 w-4" /> Upload Document
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(property.documents || []).map((doc) => (
              <Card key={doc.id} className="flex flex-col justify-between p-4 hover:border-cypress-300">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      {doc.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{doc.size_kb} KB</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{doc.name}</h4>
                  <p className="text-[10px] text-cypress-700 font-semibold mt-1 capitalize">
                    {doc.category.replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Uploaded {formatDate(doc.uploaded_at)}</span>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading file: ${doc.name}`);
                    }}
                    className="font-semibold text-cypress-700 hover:text-cypress-900 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> Download
                  </a>
                </div>
              </Card>
            ))}
          </div>

          {(property.documents || []).length === 0 && (
            <p className="py-12 text-center text-xs text-slate-400">No documents stored in this property folder yet.</p>
          )}
        </div>
      )}

      {/* TAB 4: PHOTOS & VIDEOS GALLERY */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Pre-Inspection & Walkthrough Media</h3>
            <p className="text-xs text-slate-500 mb-4">
              HD photos and walkthrough video captured during Cypress onboarding inspection.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {(property.media_photos || []).map((photo, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-video shadow-sm">
                  <img
                    src={photo}
                    alt={`Property inspection ${i + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-xs font-semibold">
                    Inspection Capture #{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Walkthrough Player */}
          {property.media_video && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4 text-cypress-700" />
                <h4 className="text-sm font-bold text-slate-900">HD Video Walkthrough (Gold Plan Vault)</h4>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-black aspect-video">
                <video controls className="h-full w-full" poster={property.media_photos?.[0]}>
                  <source src={property.media_video} type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 5: INVENTORY LIST */}
      {activeTab === 'inventory' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recorded Property Inventory List</h3>
              <p className="text-xs text-slate-500">
                Fixtures, electrical appliances, furniture, and master keys recorded at handover.
              </p>
            </div>
            <Button onClick={() => setShowInvModal(true)}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>

          <Card className="overflow-hidden p-0">
            <table className="w-full text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(property.inventory || []).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{item.category}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                          item.condition === 'good'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.condition === 'fair'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.condition.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.notes || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={item.condition}
                        onChange={(e) => updateInventoryCondition(property.id, item.id, e.target.value as any)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
                      >
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="needs_repair">Needs Repair</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 6: ASSOCIATION MAINTENANCE & CHARGES */}
      {activeTab === 'maintenance' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Association Maintenance Card */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Apartment Association Maintenance</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                  property.association_maintenance?.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {property.association_maintenance?.status || 'Pending'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Captured based on rental agreement whether association dues are borne by the owner or tenant.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Society / Association:</span>
                <span className="font-semibold text-slate-900">
                  {property.association_maintenance?.society_name || 'Apartment Owners Welfare Association'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Monthly Dues:</span>
                <span className="font-bold text-slate-900">
                  {formatINR(property.association_maintenance?.amount || 3800)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Assigned Payer (Per Agreement):</span>
                <span className="font-bold text-cypress-800 uppercase">
                  Paid by {property.association_maintenance?.payer || 'tenant'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Due Date:</span>
                <span className="font-medium text-slate-800">
                  {formatDate(property.association_maintenance?.due_date || '')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Society Receipt Reference:</span>
                <span className="font-mono text-slate-700">
                  {property.association_maintenance?.receipt_no || 'Receipt Pending'}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-5 pt-3 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    updateAssociationMaintenance(property.id, {
                      status: property.association_maintenance?.status === 'paid' ? 'pending' : 'paid',
                      paid_at: new Date().toISOString(),
                    });
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft"
                >
                  Toggle Maintenance Paid Status
                </button>
              </div>
            )}
          </Card>

          {/* Move-in & Move-out Charges Card */}
          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Move-in & Move-out Charges</h3>
            <p className="text-xs text-slate-500 mb-4">
              Society shifting fees and Cypress-assisted handover inspections.
            </p>

            <div className="space-y-3">
              {(property.move_charges || []).map((c) => (
                <div key={c.id} className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase text-slate-900 tracking-wider">
                      {c.type === 'move_in' ? 'Move-In Shifting Fee' : 'Move-Out Exit Charges'}
                    </span>
                    <span className="font-extrabold text-cypress-800">{formatINR(c.amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Payer: <strong>Paid by {c.payer}</strong></span>
                    <span>Status: <strong className="capitalize">{c.status}</strong></span>
                  </div>
                  {c.cypress_assisted && (
                    <div className="inline-flex items-center gap-1 rounded bg-cypress-50 px-2 py-0.5 text-[10px] font-bold text-cypress-800">
                      <ShieldCheck className="h-3 w-3" /> Cypress Handover Inspection Assisted
                    </div>
                  )}
                  {c.notes && <p className="text-[11px] text-slate-500 italic mt-1">{c.notes}</p>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 7: REQUEST TO VACATE PREMISES */}
      {activeTab === 'vacate' && (
        <div className="max-w-2xl">
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <LogOut className="h-5 w-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">Request to Vacate Premises Notice</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Prior information passed to Cypress Operations when owner or tenant wishes to terminate tenancy or vacate premises.
            </p>

            {property.vacate_request ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs space-y-2 text-amber-900">
                <div className="flex justify-between font-bold">
                  <span>Notice Status:</span>
                  <span className="uppercase text-amber-800">{property.vacate_request.status.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span>Initiated By:</span>{' '}
                  <strong className="capitalize">{property.vacate_request.initiator}</strong>
                </div>
                <div>
                  <span>Target Vacating Date:</span>{' '}
                  <strong>{formatDate(property.vacate_request.requested_date)}</strong>
                </div>
                <div>
                  <span>Notice Period:</span> {property.vacate_request.notice_period_days} days
                </div>
                <div>
                  <span>Reason:</span> {property.vacate_request.reason}
                </div>

                {isAdmin && property.vacate_request.status === 'submitted' && (
                  <div className="pt-2 border-t border-amber-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => acknowledgeVacateRequest(property.id)}
                      className="rounded-lg bg-cypress-gradient px-3 py-1.5 font-bold text-white shadow-soft"
                    >
                      Acknowledge & Schedule Move-out Inspection
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleVacateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requested Vacating / Handover Date
                  </label>
                  <input
                    type="date"
                    required
                    value={vacateDate}
                    onChange={(e) => setVacateDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Vacating
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={vacateReason}
                    onChange={(e) => setVacateReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900"
                    placeholder="Provide reason (lease termination, self-occupation, job transfer)..."
                  />
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                  <p className="font-semibold">Handover Assistance Policy:</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Submitting this notice informs Cypress Operations to initiate the 30-day notice timeline, arrange move-out inventory checklist inspection, and coordinate deposit settlement with the owner.
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  Submit Vacating Notice to Cypress
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-slate-900">Change / Upgrade Management Plan</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {SERVICE_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-4 flex justify-between items-center ${
                    property.plan_tier === plan.tier ? 'border-cypress-500 bg-cypress-50/50 ring-2 ring-cypress-500/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{plan.name}</h4>
                      {property.plan_tier === plan.tier && (
                        <span className="rounded-full bg-cypress-600 px-2 py-0.2 text-[10px] font-bold text-white">Current</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {plan.commission_pct}% commission · {plan.sla_hours}h SLA · {plan.media_format}
                    </p>
                  </div>
                  {property.plan_tier !== plan.tier && (
                    <button
                      type="button"
                      onClick={() => {
                        upgradePropertyPlan(property.id, plan.tier as any);
                        setShowUpgradeModal(false);
                      }}
                      className="rounded-lg bg-cypress-gradient px-3 py-1.5 text-xs font-bold text-white shadow-soft"
                    >
                      Select Plan
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-slate-900">Upload Agreement / Document</h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agreement_Cypress_Owner_2026"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Format</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
                >
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="docx">Word (.docx)</option>
                  <option value="xlsx">Excel (.xlsx)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
                >
                  <option value="cypress_owner_agreement">Agreement between Cypress & Owner</option>
                  <option value="tenant_lease">Tenancy Lease Agreement</option>
                  <option value="kyc">KYC & Verification</option>
                  <option value="association_noc">Society / Association NOC</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowDocModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Document</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Inventory Modal */}
      {showInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-slate-900">Record Inventory Item</h3>
              <button onClick={() => setShowInvModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInventory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Name / Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daikin Inverter AC 1.5 Ton"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={invCategory}
                    onChange={(e) => setInvCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
                  >
                    <option value="appliance">Appliance</option>
                    <option value="fixture">Fixture</option>
                    <option value="furniture">Furniture</option>
                    <option value="key">Key & Remote</option>
                    <option value="utility">Utility</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={invQty}
                    onChange={(e) => setInvQty(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                <select
                  value={invCondition}
                  onChange={(e) => setInvCondition(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
                >
                  <option value="good">Good (Fully Functional)</option>
                  <option value="fair">Fair (Normal Wear & Tear)</option>
                  <option value="needs_repair">Needs Repair / Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Serial (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Recently serviced, 3 physical keys handed over"
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowInvModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add to Inventory</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Selector Modals */}
      <UserSelectorModal
        isOpen={showOwnerModal}
        onClose={() => setShowOwnerModal(false)}
        role="owner"
        propertyId={property.id}
        propertyTitle={`${property.flat_no}, ${property.apartment_name || property.address}`}
        currentUserId={property.owner_id}
      />

      <UserSelectorModal
        isOpen={showTenantModal}
        onClose={() => setShowTenantModal(false)}
        role="tenant"
        propertyId={property.id}
        propertyTitle={`${property.flat_no}, ${property.apartment_name || property.address}`}
        currentUserId={property.active_tenant_id}
        initialRent={property.monthly_rent}
        initialDeposit={property.deposit}
      />
    </div>
  );
}
