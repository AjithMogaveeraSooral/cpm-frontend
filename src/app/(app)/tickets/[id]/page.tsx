'use client';

import { useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Paperclip, Upload } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { PresignedUpload, Ticket, Vendor } from '@/lib/types';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-cypress-100 text-cypress-700',
  closed: 'bg-slate-100 text-slate-600',
  rejected: 'bg-slate-200 text-slate-600',
  escalated: 'bg-red-100 text-red-700',
};

// Non-"assigned" status targets the maintenance state machine allows. Assignment
// is performed through the dedicated assign action (which also sets a vendor).
const NEXT_STATUSES: Record<string, string[]> = {
  open: ['rejected', 'escalated'],
  assigned: ['in_progress', 'escalated', 'rejected'],
  in_progress: ['resolved', 'escalated'],
  resolved: ['closed', 'in_progress'],
  escalated: ['in_progress', 'rejected'],
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('cypress_admin', 'app_admin');

  const [vendorId, setVendorId] = useState('');
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ticketQ = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => (await api.get<Ticket>(`/tickets/${id}`)).data,
    enabled: !!id,
  });
  const ticket = ticketQ.data;

  const vendorsQ = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get<Vendor[]>('/vendors', { query: { active: true, page_size: 100 } }),
    enabled: isAdmin,
  });
  const vendors = vendorsQ.data?.data ?? [];

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['ticket', id] });

  const assignMut = useMutation({
    mutationFn: () =>
      api.post(`/tickets/${id}/assign`, { vendor_id: vendorId, note: note || undefined }),
    onSuccess: () => {
      setActionError(null);
      setNote('');
      setVendorId('');
      refresh();
    },
    onError: (e) => setActionError(e instanceof ApiError ? e.message : 'Assignment failed.'),
  });

  const statusMut = useMutation({
    mutationFn: (status: string) =>
      api.patch(`/tickets/${id}/status`, { status, note: note || undefined }),
    onSuccess: () => {
      setActionError(null);
      setNote('');
      refresh();
    },
    onError: (e) => setActionError(e instanceof ApiError ? e.message : 'Status update failed.'),
  });

  const nextStatuses = useMemo(
    () => (ticket ? NEXT_STATUSES[ticket.status] ?? [] : []),
    [ticket],
  );

  const canAttach = isAdmin || (ticket && !['closed', 'rejected'].includes(ticket.status));

  const onPickFile = async (file: File) => {
    if (!ticket) return;
    setUploadMsg(null);
    try {
      const stage = ['resolved', 'closed'].includes(ticket.status) ? 'resolution' : 'created';
      const res = await api.post<PresignedUpload>(`/tickets/${id}/attachments`, {
        filename: file.name,
        content_type: file.type || 'application/octet-stream',
        stage,
      });
      const slot = res.data;
      if (slot?.url) {
        const put = await fetch(slot.url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!put.ok) throw new Error('upload failed');
      }
      setUploadMsg('Attachment uploaded.');
      refresh();
    } catch (e) {
      setUploadMsg(
        e instanceof ApiError
          ? e.message
          : 'Attachment recorded, but the file upload could not be completed (storage may be unconfigured).',
      );
      refresh();
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (ticketQ.isLoading) return <p className="text-slate-500">Loading…</p>;
  if (ticketQ.error || !ticket) return <p className="text-red-600">Could not load this ticket.</p>;

  const fields: Array<[string, string]> = [
    ['Property', ticket.property_upid],
    ['Category', ticket.category],
    ['Priority', ticket.priority],
    ['SLA window', `${ticket.sla_hours}h`],
    ['SLA due', formatDate(ticket.sla_due_at)],
    ['Raised', formatDate(ticket.created_at)],
  ];
  if (ticket.resolved_at) fields.push(['Resolved', formatDate(ticket.resolved_at)]);
  if (ticket.vendor) fields.push(['Vendor', `${ticket.vendor.name} (${ticket.vendor.trade})`]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/tickets"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-cypress-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tickets
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{ticket.title}</h1>
          {ticket.description && <p className="mt-1 text-sm text-slate-600">{ticket.description}</p>}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${
            STATUS_STYLES[ticket.status] ?? 'bg-slate-100 text-slate-600'
          }`}
        >
          {ticket.status.replace('_', ' ')}
        </span>
      </div>

      <Card>
        <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-3">
          {fields.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wide text-slate-400">{k}</dt>
              <dd className="text-sm font-medium capitalize text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Admin actions */}
      {isAdmin && (
        <Card className="mt-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Manage ticket
          </h2>

          <div className="mb-4 flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Note (optional)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note to accompany the next action…"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cypress-500 focus:outline-none focus:ring-1 focus:ring-cypress-500"
            />
          </div>

          {/* Assign vendor */}
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Assign vendor</label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cypress-500 focus:outline-none focus:ring-1 focus:ring-cypress-500"
              >
                <option value="">Select a vendor…</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.trade}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              onClick={() => assignMut.mutate()}
              loading={assignMut.isPending}
              disabled={!vendorId}
            >
              Assign
            </Button>
          </div>

          {/* Status transitions */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Transition status</label>
            {nextStatuses.length === 0 ? (
              <p className="text-sm text-slate-400">No further transitions available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant="secondary"
                    onClick={() => statusMut.mutate(s)}
                    loading={statusMut.isPending}
                  >
                    {s.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
        </Card>
      )}

      {/* Attachments */}
      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Photo evidence
          </h2>
          {canAttach && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickFile(f);
                }}
              />
              <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" /> Add photo
              </Button>
            </>
          )}
        </div>
        {ticket.attachments && ticket.attachments.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {ticket.attachments.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2 text-sm">
                <Paperclip className="h-4 w-4 text-slate-400" />
                <span className="flex-1 truncate text-slate-700">{a.s3_key.split('/').pop()}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-500">
                  {a.stage}
                </span>
                <span className="text-xs text-slate-400">{formatDate(a.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No photos attached yet.</p>
        )}
        {uploadMsg && <p className="mt-3 text-xs text-slate-500">{uploadMsg}</p>}
      </Card>

      {/* History timeline */}
      <Card className="mt-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          History
        </h2>
        {ticket.history && ticket.history.length > 0 ? (
          <ol className="relative space-y-4 border-l border-slate-200 pl-5">
            {[...ticket.history]
              .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
              .map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[1.42rem] top-1 h-2.5 w-2.5 rounded-full bg-cypress-500" />
                  <p className="text-sm font-medium capitalize text-slate-900">
                    {h.from_status ? `${h.from_status.replace('_', ' ')} → ` : ''}
                    {h.to_status.replace('_', ' ')}
                  </p>
                  {h.note && <p className="text-sm text-slate-600">{h.note}</p>}
                  <p className="text-xs text-slate-400">{formatDate(h.created_at)}</p>
                </li>
              ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-400">No history yet.</p>
        )}
      </Card>
    </div>
  );
}
