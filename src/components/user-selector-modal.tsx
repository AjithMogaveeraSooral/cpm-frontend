'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  CheckCircle2,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  FileText,
  Calendar,
  IndianRupee,
  BadgePercent,
  Sparkles,
} from 'lucide-react';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import type { DirectoryUser } from '@/lib/types';

interface UserSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'owner' | 'tenant';
  propertyId: string;
  propertyTitle?: string;
  currentUserId?: string;
  initialRent?: number;
  initialDeposit?: number;
  onSuccess?: (message: string) => void;
}

export function UserSelectorModal({
  isOpen,
  onClose,
  role,
  propertyId,
  propertyTitle,
  currentUserId,
  initialRent = 45000,
  initialDeposit = 200000,
  onSuccess,
}: UserSelectorModalProps) {
  const { registeredUsers, assignOwnerUser, assignTenantUser, registerDirectoryUser } = useDataStore();

  const [mode, setMode] = useState<'select' | 'register'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId || '');

  // Tenancy Lease Terms (only applicable for role === 'tenant')
  const [agreedRent, setAgreedRent] = useState<number>(initialRent);
  const [securityDeposit, setSecurityDeposit] = useState<number>(initialDeposit);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPan, setRegPan] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter users by role
  const roleUsers = registeredUsers.filter((u) => u.role === role);

  const filteredUsers = roleUsers.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.id.toLowerCase().includes(term) ||
      u.full_name.toLowerCase().includes(term) ||
      u.mobile.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.pan && u.pan.toLowerCase().includes(term)) ||
      (u.employment_company && u.employment_company.toLowerCase().includes(term))
    );
  });

  const selectedUser = registeredUsers.find((u) => u.id === selectedUserId);

  const handleRegisterNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim() || !regMobile.trim()) {
      setRegError('Name and mobile number are required.');
      return;
    }

    const newUser = registerDirectoryUser({
      full_name: regName.trim(),
      mobile: regMobile.trim().startsWith('+91') ? regMobile.trim() : `+91 ${regMobile.trim()}`,
      email: regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '')}@cypress.local`,
      role,
      pan: regPan.trim().toUpperCase() || undefined,
      employment_company: role === 'tenant' ? regCompany.trim() || 'Private Sector' : undefined,
      status: 'active',
    });

    setSelectedUserId(newUser.id);
    setMode('select');
    // Clear registration fields
    setRegName('');
    setRegMobile('');
    setRegEmail('');
    setRegPan('');
    setRegCompany('');
  };

  const handleConfirmAssignment = () => {
    if (!selectedUserId) return;
    setIsSubmitting(true);

    setTimeout(() => {
      if (role === 'owner') {
        assignOwnerUser(propertyId, selectedUserId);
        const msg = `Owner User ID [${selectedUserId}] linked to property successfully!`;
        setCompletedMessage(msg);
        if (onSuccess) onSuccess(msg);
      } else {
        assignTenantUser(
          propertyId,
          selectedUserId,
          agreedRent,
          securityDeposit,
          startDate,
          endDate
        );
        const msg = `Tenant User ID [${selectedUserId}] connected & lease agreement issued!`;
        setCompletedMessage(msg);
        if (onSuccess) onSuccess(msg);
      }

      setIsSubmitting(false);
      setTimeout(() => {
        setCompletedMessage(null);
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-cypress-900 via-cypress-800 to-cypress-950 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-cypress-700/80 px-2.5 py-0.5 text-xs font-semibold text-cypress-100 uppercase tracking-wider">
                {role === 'owner' ? 'Owner Assignment' : 'Tenant Assignment'}
              </span>
              <span className="text-xs text-cypress-200">
                • Connect User ID
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight">
              {role === 'owner'
                ? 'Assign Property Owner Account'
                : 'Connect Registered Tenant User ID'}
            </h2>
            <p className="mt-1 text-xs text-cypress-200 max-w-lg">
              {role === 'owner'
                ? 'Link a verified owner user account by User ID. All rental disbursements, statements, and digital approvals route to this user.'
                : 'Connect an active tenant account by User ID to issue digital lease agreements, configure monthly rent, and update property occupancy.'}
            </p>
            {propertyTitle && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cypress-200 bg-white/10 px-3 py-1 rounded-lg">
                <Building className="h-3.5 w-3.5 text-cypress-300" />
                Target Property: <span className="font-semibold text-white">{propertyTitle}</span>
              </div>
            )}
          </div>

          {/* Success Overlay */}
          {completedMessage && (
            <div className="p-8 text-center bg-emerald-50 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-emerald-900">Assignment Complete</h3>
              <p className="text-xs text-emerald-700 font-mono">{completedMessage}</p>
            </div>
          )}

          {!completedMessage && (
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Tab Switcher: Select Existing vs Register New */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    mode === 'select'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Select Registered {role === 'owner' ? 'Owner' : 'Tenant'} ({roleUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  + Register New {role === 'owner' ? 'Owner' : 'Tenant'} User
                </button>
              </div>

              {/* MODE 1: SELECT EXISTING DIRECTORY USER */}
              {mode === 'select' && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={`Search by User ID (e.g. user-${role}-1), Name, Mobile, Email, PAN...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-cypress-500 focus:outline-none focus:ring-1 focus:ring-cypress-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Users List */}
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-xs text-slate-500">No registered {role} users match your search.</p>
                        <button
                          type="button"
                          onClick={() => setMode('register')}
                          className="mt-2 text-xs font-bold text-cypress-700 hover:underline"
                        >
                          + Register a new {role} user instead
                        </button>
                      </div>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSelected = selectedUserId === user.id;
                        const isCurrent = currentUserId === user.id;

                        return (
                          <div
                            key={user.id}
                            onClick={() => setSelectedUserId(user.id)}
                            className={`group relative flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition ${
                              isSelected
                                ? 'border-cypress-600 bg-cypress-50/60 ring-2 ring-cypress-600/20'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                            }`}
                          >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <img
                                src={
                                  user.avatar_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=0284c7&color=fff`
                                }
                                alt={user.full_name}
                                className="h-10 w-10 rounded-full object-cover border border-slate-200"
                              />
                              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {user.full_name}
                                </span>

                                {/* Formal User ID Badge */}
                                <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300 group-hover:border-cypress-400 transition">
                                  🔗 ID: {user.id}
                                </span>

                                {isCurrent && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                    Currently Assigned
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  {user.mobile}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  {user.email}
                                </span>
                                {user.pan && (
                                  <span className="font-mono text-slate-500">
                                    PAN: {user.pan}
                                  </span>
                                )}
                                {user.employment_company && (
                                  <span className="text-slate-600 font-medium">
                                    🏢 {user.employment_company}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Radio indicator */}
                            <div className="shrink-0 pt-1">
                              <div
                                className={`h-4 w-4 rounded-full border flex items-center justify-center transition ${
                                  isSelected
                                    ? 'border-cypress-600 bg-cypress-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* MODE 2: REGISTER NEW DIRECTORY USER */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterNewUser} className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      New {role === 'owner' ? 'Owner' : 'Tenant'} User Details
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      System generates User ID automatically
                    </span>
                  </div>

                  {regError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      {regError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9876543210"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. user@cypress.local"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        PAN Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ABCDE1234F"
                        value={regPan}
                        onChange={(e) => setRegPan(e.target.value.toUpperCase())}
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 uppercase font-mono"
                      />
                    </div>

                    {role === 'tenant' && (
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Employer / Company (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Infosys / Cisco Systems"
                          value={regCompany}
                          onChange={(e) => setRegCompany(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="sm" className="w-full mt-2">
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Create User & Select ID
                  </Button>
                </form>
              )}

              {/* TENANT LEASE TERMS (Only when assigning tenant) */}
              {role === 'tenant' && (
                <div className="rounded-xl border border-cypress-200 bg-gradient-to-br from-cypress-50/50 to-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cypress-900 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-cypress-700" />
                      Tenancy Lease Agreement Terms
                    </h4>
                    <span className="text-[10px] font-bold bg-cypress-100 text-cypress-800 px-2 py-0.5 rounded">
                      Standard 11-Month Lease
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Agreed Monthly Rent (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={agreedRent}
                          onChange={(e) => setAgreedRent(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-1.5 text-xs text-slate-900 font-semibold"
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-500 font-mono">
                        {formatINR(agreedRent)}/month
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Security Deposit (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={securityDeposit}
                          onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-1.5 text-xs text-slate-900 font-semibold"
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-500 font-mono">
                        {formatINR(securityDeposit)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Lease Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Lease End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] text-emerald-800 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>
                      Assigning generates official <strong>Tenancy_Agreement.pdf</strong> in Property Documents and changes occupancy status to <strong>Occupied</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* Selected User Summary Badge */}
              {selectedUser && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-cypress-700 text-white flex items-center justify-center font-bold text-xs">
                      {selectedUser.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        Selected: {selectedUser.full_name}
                      </p>
                      <p className="font-mono text-[11px] text-cypress-700 font-semibold">
                        🔗 Connecting User ID: {selectedUser.id}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                    Ready to Connect
                  </span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAssignment}
                  disabled={!selectedUserId || isSubmitting}
                  className="bg-cypress-gradient text-white shadow-soft"
                >
                  {isSubmitting ? (
                    'Connecting...'
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      {role === 'owner'
                        ? `Confirm & Link Owner User ID (${selectedUserId || 'None'})`
                        : `Connect Tenant User ID & Issue Lease`}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
