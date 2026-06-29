'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { userTypeLabel } from '@/lib/user-types';
import type { Registration, RegistrationStatus } from '@/lib/types';

const STATUS_STYLES: Record<RegistrationStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-cypress-100 text-cypress-700',
  rejected: 'bg-red-100 text-red-700',
};

const FILTERS: { value: RegistrationStatus | ''; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: '', label: 'All' },
];

export default function ApprovalsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<RegistrationStatus | ''>('pending');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['registrations', filter],
    queryFn: async () =>
      api.get<Registration[]>('/auth/registrations', { query: filter ? { status: filter } : {} }),
  });

  const decide = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      api.post(`/auth/registrations/${id}/${action}`, {}),
    onSuccess: () => {
      setActionError(null);
      qc.invalidateQueries({ queryKey: ['registrations'] });
    },
    onError: (e) => setActionError(e instanceof ApiError ? e.message : 'Action failed'),
  });

  const rows = data?.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Registration Approvals</h1>
        {data?.pagination && <span className="text-sm text-slate-500">{data.pagination.total_items} total</span>}
      </div>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === f.value ? 'bg-cypress-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {actionError && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p>}
      {isLoading && <p className="text-slate-500">Loading registrations…</p>}
      {error && <p className="text-red-600">Could not load registrations.</p>}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">User type</th>
              <th className="px-4 py-3">Requested</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{r.full_name || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.mobile}</td>
                <td className="px-4 py-3 text-slate-700">{userTypeLabel(r.role)}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        className="px-3 py-1 text-xs"
                        loading={decide.isPending && decide.variables?.id === r.id && decide.variables?.action === 'approve'}
                        onClick={() => decide.mutate({ id: r.id, action: 'approve' })}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        className="px-3 py-1 text-xs"
                        loading={decide.isPending && decide.variables?.id === r.id && decide.variables?.action === 'reject'}
                        onClick={() => decide.mutate({ id: r.id, action: 'reject' })}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="block text-right text-xs text-slate-400">
                      {r.reviewed_at ? formatDate(r.reviewed_at) : '—'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && rows.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-400">No registrations to show.</p>
        )}
      </Card>
    </div>
  );
}
