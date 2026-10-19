'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import type { Lead, LeadStatus } from '@/lib/types';

const statusStyles: Record<LeadStatus, string> = {
  new: 'bg-sky-100 text-sky-800',
  contacted: 'bg-amber-100 text-amber-800',
  converted: 'bg-teal-100 text-teal-800',
  closed: 'bg-slate-100 text-slate-700',
};
const control = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900';

export default function LeadsPage() {
  const user = useAuth((state) => state.user);
  const authStatus = useAuth((state) => state.status);
  const roles = [...(user?.roles ?? [])].sort().join(',');
  const admin = authStatus === 'authenticated' && !!user?.roles.some((role) => role === 'app_admin' || role === 'cypress_admin');
  // Remount all page state if the authenticated identity or roles change.
  if (authStatus === 'idle' || authStatus === 'loading') return <p role="status">Checking access…</p>;
  if (!admin || !user) return <div role="alert"><h1 className="text-2xl font-bold">Admin access required</h1><p className="mt-3">Only approved Cypress administrators can view lead contact details.</p><Link href="/dashboard" className="mt-4 inline-block text-teal-700 underline">Return to dashboard</Link></div>;
  return <LeadDesk key={`${user.id}:${roles}`} userID={user.id} roles={roles} />;
}

function LeadDesk({ userID, roles }: { userID: string; roles: string }) {
  const [status, setStatus] = useState('new');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [notice, setNotice] = useState('');
  const inFlight = useRef(false);
  const client = useQueryClient();
  const scope = ['admin-leads', userID, roles] as const;
  const leads = useQuery({
    queryKey: [...scope, { status, search, sort, page, pageSize }],
    queryFn: ({ signal }) => api.get<Lead[]>('/leads', { query: { status, q: search, sort, page, page_size: pageSize }, signal }),
    retry: false,
    gcTime: 0,
  });
  const update = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: 'contacted' | 'closed' }) => {
      const result = await api.patch<Lead>(`/leads/${encodeURIComponent(id)}/status`, { status: next });
      if (result.data?.id !== id || result.data.status !== next) throw new Error('Unconfirmed status update');
      return result.data;
    },
    onSuccess: async () => {
      setNotice('Status saved by the server.');
      await client.invalidateQueries({ queryKey: scope });
    },
    onError: () => setNotice('Status update could not be confirmed. Refresh the list before retrying; no local status was changed.'),
    onSettled: () => { inFlight.current = false; },
  });
  function changeStatus(id: string, next: 'contacted' | 'closed') {
    if (inFlight.current) return;
    inFlight.current = true;
    setNotice('');
    update.mutate({ id, next });
  }
  function applySearch(event: FormEvent) {
    event.preventDefault();
    setSearch(searchDraft.trim());
    setPage(1);
  }
  const pagination = leads.data?.pagination;
  const rows = leads.data?.data ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enquiries & Lead Desk</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review saved owner and tenant requirements, and record follow-up status.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white"
        >
          Start property onboarding
        </Link>
      </header>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        <strong>Lead-to-property conversion is not implemented.</strong> Complete property creation separately using the onboarding link. It does not link this lead to a property or mark it converted. An existing “converted” status alone is not proof of a saved property, approved listing or active service plan.
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <form onSubmit={applySearch} className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1 text-sm text-slate-700">
            Search leads
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              maxLength={150}
              placeholder="Name, phone, email, requirements, UPID"
              className={`${control} w-full sm:w-80`}
            />
          </label>
          <button className={`${control} font-semibold`} type="submit">
            Search
          </button>
          {search && (
            <button
              className={control}
              type="button"
              onClick={() => { setSearch(''); setSearchDraft(''); setPage(1); }}
            >
              Clear
            </button>
          )}
        </form>
        <label className="grid gap-1 text-sm text-slate-700">
          Status
          <select
            className={control}
            value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            {['new', 'contacted', 'closed', 'converted'].map((value) => (
              <option key={value} value={value}>
                {value === 'converted' ? 'Converted (existing records)' : value}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-slate-700">
          Sort
          <select
            className={control}
            value={sort}
            onChange={(event) => { setSort(event.target.value); setPage(1); }}
          >
            <option value="-created_at">Newest first</option>
            <option value="created_at">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="-name">Name Z–A</option>
            <option value="status">Status</option>
            <option value="type">Enquiry type</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm text-slate-700">
          Per page
          <select
            className={control}
            value={pageSize}
            onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}
          >
            {[10, 20, 50].map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={control}
          disabled={leads.isFetching}
          onClick={() => void leads.refetch()}
        >
          Refresh
        </button>
      </div>

      {notice && (
        <p
          role={update.isError ? 'alert' : 'status'}
          className={`rounded-xl p-3 text-sm ${update.isError ? 'bg-red-50 text-red-800' : 'bg-teal-50 text-teal-800'}`}
        >
          {notice}
        </p>
      )}

      {leads.isPending ? (
        <p role="status">Loading saved enquiries…</p>
      ) : leads.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <p>Unable to load enquiries. Check your access and connection, then retry.</p>
          <button
            className={`${control} mt-3`}
            type="button"
            onClick={() => void leads.refetch()}
          >
            Retry loading
          </button>
        </div>
      ) : (
        <>
          <div
            className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"
            aria-busy={leads.isFetching}
          >
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Saved enquiries and follow-up actions</caption>
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {['Prospect / reference', 'Contact', 'Requirements', 'Received', 'Status', 'Actions'].map((label) => (
                    <th scope="col" className="px-4 py-3" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((lead) => (
                  <tr key={lead.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{lead.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lead.type} ·{' '}
                        {lead.message?.startsWith('[Property Owner Interest]')
                          ? 'Owner'
                          : lead.message?.startsWith('[Tenant Rental Requirement]')
                          ? 'Tenant'
                          : 'General'}
                      </p>
                      <p className="mt-2 max-w-48 break-all text-xs text-slate-500">{lead.id}</p>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={`tel:${lead.phone.replace(/[^+0-9]/g, '')}`}
                        className="text-teal-700 underline"
                      >
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a
                          className="mt-2 block break-all text-teal-700 underline"
                          href={`mailto:${encodeURIComponent(lead.email)}`}
                        >
                          {lead.email}
                        </a>
                      )}
                    </td>
                    <td className="min-w-64 max-w-md px-4 py-4">
                      <p className="whitespace-pre-wrap break-words text-slate-700">
                        {lead.message || 'No requirements supplied.'}
                      </p>
                      {lead.property_upid && (
                        <p className="mt-3 break-all text-xs font-semibold">
                          Property ID: {lead.property_upid}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                      {new Date(lead.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[lead.status] ?? 'bg-slate-100'}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-2">
                        {lead.status === 'new' && (
                          <button
                            type="button"
                            disabled={update.isPending}
                            className={`${control} disabled:opacity-50`}
                            onClick={() => changeStatus(lead.id, 'contacted')}
                          >
                            Mark contacted
                          </button>
                        )}
                        {(lead.status === 'new' || lead.status === 'contacted') && (
                          <button
                            type="button"
                            disabled={update.isPending}
                            className={`${control} disabled:opacity-50`}
                            onClick={() => changeStatus(lead.id, 'closed')}
                          >
                            Close lead
                          </button>
                        )}
                        {lead.message?.startsWith('[Property Owner Interest]') && (
                          <Link href="/properties/new" className="text-teal-700 underline">
                            Create property separately
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="p-8 text-center text-slate-500">No enquiries match these filters.</p>
            )}
          </div>
          <nav
            aria-label="Lead pagination"
            className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"
          >
            <p>
              {pagination
                ? `${pagination.total_items} enquiries · Page ${pagination.page} of ${Math.max(1, pagination.total_pages)}`
                : 'Pagination unavailable'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className={`${control} disabled:opacity-40`}
                disabled={page <= 1 || leads.isFetching}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className={`${control} disabled:opacity-40`}
                disabled={!pagination || page >= pagination.total_pages || leads.isFetching}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
