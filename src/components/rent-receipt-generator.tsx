'use client';

import { useState } from 'react';
import { Printer, Check, Receipt, Building2, ShieldCheck, Download, X } from 'lucide-react';
import { useDataStore } from '@/lib/data-store';
import { Button } from './ui/button';
import { formatINR } from '@/lib/utils';
import type { Property, RentReceipt } from '@/lib/types';

interface RentReceiptGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPropertyId?: string;
}

export function RentReceiptGenerator({ isOpen, onClose, preselectedPropertyId }: RentReceiptGeneratorProps) {
  const { properties, generateRentReceipt } = useDataStore();

  const [selectedPropId, setSelectedPropId] = useState(preselectedPropertyId || properties[0]?.id || '');
  const [monthYear, setMonthYear] = useState('September 2026');
  const [rentAmount, setRentAmount] = useState('');
  const [maintenanceAmount, setMaintenanceAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('0');
  const [paymentMode, setPaymentMode] = useState<RentReceipt['payment_mode']>('UPI');
  const [txnId, setTxnId] = useState(`UPI-${Date.now().toString().slice(-8)}`);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Official rent receipt for HRA tax benefit proof.');
  const [createdReceipt, setCreatedReceipt] = useState<RentReceipt | null>(null);

  if (!isOpen) return null;

  const prop = properties.find((p) => p.id === selectedPropId) || properties[0];

  const handlePropertyChange = (propId: string) => {
    setSelectedPropId(propId);
    const p = properties.find((item) => item.id === propId);
    if (p) {
      setRentAmount(String(p.monthly_rent));
      setMaintenanceAmount(String(p.association_maintenance?.amount || 0));
    }
  };

  const actualRent = Number(rentAmount || prop?.monthly_rent || 0);
  const actualMaint = Number(maintenanceAmount || prop?.association_maintenance?.amount || 0);
  const actualAdvance = Number(advanceAmount || 0);
  const totalAmount = actualRent + actualMaint;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prop) return;

    const receiptNo = `CPM-REC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const receipt = generateRentReceipt({
      receipt_no: receiptNo,
      property_id: prop.id,
      property_upid: prop.upid,
      property_address: prop.address || `${prop.flat_no}, ${prop.apartment_name}, Bengaluru`,
      owner_id: prop.owner_id,
      owner_name: prop.owner_name || 'Ramesh Kumar',
      owner_pan: prop.owner_pan || 'ABCDE1234F',
      tenant_id: prop.active_tenant_id || 'user-tenant-1',
      tenant_name: prop.active_tenant_name || 'Rahul Sharma',
      month_year: monthYear,
      rent_amount: actualRent,
      maintenance_amount: actualMaint,
      advance_amount: actualAdvance,
      total_amount: totalAmount,
      payment_mode: paymentMode,
      transaction_id: txnId,
      payment_date: paymentDate,
      generated_by: 'Cypress Administrator',
      notes,
    });

    setCreatedReceipt(receipt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cypress-gradient text-white">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {createdReceipt ? 'Official Rent Receipt Generated' : 'Rent Receipt Generator'}
              </h2>
              <p className="text-xs text-slate-500">
                {createdReceipt ? 'HRA Tax-Compliant Printable Receipt' : 'Post-Onboarding & Tie-up Rent Receipt Desk'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!createdReceipt ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Property & UPID</label>
                <select
                  value={selectedPropId}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-soft focus:border-cypress-500 focus:outline-none"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.upid} — {p.flat_no} {p.apartment_name || p.property_type} (Tenant: {p.active_tenant_name || 'Unassigned'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Property Owner</label>
                  <input
                    type="text"
                    disabled
                    value={`${prop?.owner_name || 'Owner'} (PAN: ${prop?.owner_pan || 'ABCDE1234F'})`}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs text-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Active Tenant</label>
                  <input
                    type="text"
                    disabled
                    value={prop?.active_tenant_name || 'Rahul Sharma'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rent Period</label>
                  <input
                    type="text"
                    value={monthYear}
                    onChange={(e) => setMonthYear(e.target.value)}
                    placeholder="e.g. September 2026"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={rentAmount || prop?.monthly_rent || 0}
                    onChange={(e) => setRentAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Society Maintenance (₹)</label>
                  <input
                    type="number"
                    value={maintenanceAmount || prop?.association_maintenance?.amount || 0}
                    onChange={(e) => setMaintenanceAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900"
                  >
                    <option value="UPI">UPI</option>
                    <option value="NEFT">NEFT</option>
                    <option value="IMPS">IMPS</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / UTR</label>
                  <input
                    type="text"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="rounded-xl bg-cypress-50/70 border border-cypress-200 p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cypress-900">Total Receipt Amount</span>
                  <p className="text-[11px] text-cypress-700">Includes monthly rent + association maintenance charge</p>
                </div>
                <span className="text-xl font-extrabold text-cypress-800">{formatINR(totalAmount)}</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Receipt className="h-4 w-4" /> Generate Official Receipt
                </Button>
              </div>
            </form>
          ) : (
            <div>
              {/* Printable HRA Receipt Card */}
              <div
                id="printable-receipt"
                className="rounded-2xl border-2 border-slate-800 bg-white p-6 shadow-sm print:p-0 print:border-none print:shadow-none"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cypress-gradient text-white">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                        Cypress Property Management
                      </h3>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                        Institutional Asset Management · Bengaluru, India
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded border border-cypress-300 bg-cypress-50 px-2 py-0.5 text-[11px] font-bold text-cypress-800 uppercase">
                      HRA Tax Exemption Receipt
                    </span>
                    <p className="mt-1 font-mono text-xs font-bold text-slate-900">{createdReceipt.receipt_no}</p>
                    <p className="text-[10px] text-slate-400">Date: {createdReceipt.payment_date}</p>
                  </div>
                </div>

                {/* Receipt Details Body */}
                <div className="my-5 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Tenant (Payee)</span>
                      <p className="font-bold text-slate-900 text-sm">{createdReceipt.tenant_name}</p>
                      <p className="text-slate-600">Rent Period: <strong>{createdReceipt.month_year}</strong></p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Property Owner (Landlord)</span>
                      <p className="font-bold text-slate-900 text-sm">{createdReceipt.owner_name}</p>
                      <p className="font-mono text-slate-600">PAN: <strong>{createdReceipt.owner_pan || 'ABCDE1234F'}</strong></p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Rented Property & UPID</span>
                    <p className="font-mono text-xs font-bold text-cypress-800">{createdReceipt.property_upid}</p>
                    <p className="text-slate-700">{createdReceipt.property_address}</p>
                  </div>

                  {/* Payment Breakdown Table */}
                  <table className="w-full border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-left font-bold text-slate-700">
                        <th className="border border-slate-200 p-2">Item Description</th>
                        <th className="border border-slate-200 p-2 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-200 p-2">Monthly House Rent ({createdReceipt.month_year})</td>
                        <td className="border border-slate-200 p-2 text-right font-medium">{formatINR(createdReceipt.rent_amount)}</td>
                      </tr>
                      {(createdReceipt.maintenance_amount || 0) > 0 && (
                        <tr>
                          <td className="border border-slate-200 p-2">Apartment Society Association Maintenance Charges</td>
                          <td className="border border-slate-200 p-2 text-right font-medium">{formatINR(createdReceipt.maintenance_amount || 0)}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-50 font-bold">
                        <td className="border border-slate-200 p-2 text-slate-900">Total Paid Amount</td>
                        <td className="border border-slate-200 p-2 text-right text-cypress-800 text-sm">
                          {formatINR(createdReceipt.total_amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-600">
                    <div>
                      <p><strong>Payment Mode:</strong> {createdReceipt.payment_mode}</p>
                      <p className="font-mono"><strong>Txn / UTR:</strong> {createdReceipt.transaction_id}</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Verified by Cypress Admin
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Digitally Signed & Archived</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <Button variant="secondary" onClick={() => setCreatedReceipt(null)}>
                  Generate Another Receipt
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      window.print();
                    }}
                  >
                    <Printer className="h-4 w-4" /> Print / Save as PDF
                  </Button>
                  <Button variant="secondary" onClick={onClose}>
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
