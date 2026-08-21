'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { cn, formatDateTime, notificationBody, notificationTitle } from '@/lib/utils';
import type { NotificationItem } from '@/lib/types';

type StatusFilter = 'all' | 'unread' | 'read';

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

// Maps a notification template to the in-app route it should deep-link to.
function routeForTemplate(template: string): string | null {
  if (template.startsWith('lead')) return '/leads';
  if (template.startsWith('ticket')) return '/tickets';
  if (template.startsWith('tenancy') || template.startsWith('rent')) return '/tenancies';
  if (template.startsWith('invoice')) return '/invoices';
  if (template.startsWith('role') || template.startsWith('registration') || template.startsWith('approval'))
    return '/approvals';
  return null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', 'feed'],
    queryFn: async () =>
      (await api.get<NotificationItem[]>('/notifications', { query: { page: 1, page_size: 50 } })).data,
    refetchInterval: 20_000,
  });

  const items = useMemo(() => data ?? [], [data]);
  const unreadCount = items.filter((n) => n.status !== 'read').length;

  const rows = items.filter((n) => {
    if (filter === 'unread') return n.status !== 'read';
    if (filter === 'read') return n.status === 'read';
    return true;
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await Promise.all(items.filter((n) => n.status !== 'read').map((n) => api.post(`/notifications/${n.id}/read`)));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  function handleClick(item: NotificationItem) {
    if (item.status !== 'read') markRead.mutate(item.id);
    const route = routeForTemplate(item.template);
    if (route) router.push(route);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Bell className="h-6 w-6 text-cypress-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-cypress-100 px-2.5 py-0.5 text-xs font-semibold text-cypress-700">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Alerts for new enquiries, tickets, tenancies and approvals.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-soft transition hover:border-cypress-300 hover:bg-cypress-50 hover:text-cypress-700 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              filter === f.value
                ? 'bg-cypress-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-slate-500">Loading notifications…</p>}
      {error && <p className="text-red-600">Could not load notifications.</p>}

      {!isLoading && !error && (
        <Card className="overflow-hidden p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
              <Inbox className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-400">
                {filter === 'unread' ? 'No unread notifications.' : "You're all caught up."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((item) => {
                const unread = item.status !== 'read';
                const body = notificationBody(item.payload);
                const route = routeForTemplate(item.template);
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleClick(item)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50',
                        unread && 'bg-cypress-50/40',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                          unread ? 'bg-cypress-600' : 'bg-slate-200',
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {notificationTitle(item.template)}
                          </span>
                          {route && (
                            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                              {route.replace('/', '')}
                            </span>
                          )}
                        </span>
                        {body && <span className="mt-0.5 block text-sm text-slate-600">{body}</span>}
                        <span className="mt-1 block text-xs text-slate-400">{formatDateTime(item.created_at)}</span>
                      </span>
                      {unread && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead.mutate(item.id);
                          }}
                          className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-soft transition hover:border-cypress-300 hover:text-cypress-700"
                        >
                          Mark read
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
