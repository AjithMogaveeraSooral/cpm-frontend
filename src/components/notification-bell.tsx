'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellRing, Check, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api-client';
import { cn, formatDateTime, notificationBody, notificationTitle } from '@/lib/utils';
import { enablePush } from '@/lib/push';
import type { NotificationItem } from '@/lib/types';

const POLL_MS = 20_000;

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

// Fires a native browser (OS-level) push notification if the user has granted
// permission. Used to alert admins about new events even when the tab is in the
// background.
function pushBrowserNotification(item: NotificationItem) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  const body = notificationBody(item.payload) ?? 'You have a new update in Cypress PM.';
  try {
    const n = new Notification(notificationTitle(item.template), {
      body,
      tag: item.id,
      icon: '/favicon.ico',
    });
    const route = routeForTemplate(item.template);
    n.onclick = () => {
      window.focus();
      if (route) window.location.assign(route);
      n.close();
    };
  } catch {
    // Some browsers throw if constructed without a service worker; ignore.
  }
}

export function NotificationBell() {
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Fixed-position coordinates for the portal-rendered dropdown so it escapes the
  // sidebar's backdrop-filter clipping context (which otherwise cuts it off).
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  // Tracks notification IDs already seen so we only push-notify genuinely new
  // ones. `null` until the first fetch resolves so we don't blast a burst of
  // notifications for pre-existing items on initial load.
  const seenIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Position the portal dropdown just below the bell, opening rightward into the
  // main content so it never runs off the left edge. Recomputes on open/resize.
  const MENU_WIDTH = 320;
  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const left = Math.min(Math.max(12, r.left), window.innerWidth - MENU_WIDTH - 12);
      setCoords({ top: r.bottom + 8, left });
    }
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  const { data } = useQuery({
    queryKey: ['notifications', 'feed'],
    queryFn: async () =>
      (await api.get<NotificationItem[]>('/notifications', { query: { page: 1, page_size: 20 } })).data,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
  });

  const items = useMemo(() => data ?? [], [data]);
  const unreadCount = items.filter((n) => n.status !== 'read').length;

  // Detect newly-arrived notifications and raise browser push notifications.
  useEffect(() => {
    if (!data) return;
    if (seenIds.current === null) {
      seenIds.current = new Set(data.map((n) => n.id));
      return;
    }
    for (const n of data) {
      if (!seenIds.current.has(n.id)) {
        seenIds.current.add(n.id);
        if (n.status !== 'read') pushBrowserNotification(n);
      }
    }
  }, [data]);

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

  async function requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPushBusy(true);
    setPushError(null);
    try {
      // Registers the service worker + a real Web Push subscription with the
      // backend so pushes arrive even when this tab/browser is closed.
      await enablePush();
      setPermission('granted');
    } catch (e) {
      setPermission(typeof Notification !== 'undefined' ? Notification.permission : 'default');
      setPushError(e instanceof Error ? e.message : 'Could not enable push notifications.');
    } finally {
      setPushBusy(false);
    }
  }

  function handleItemClick(item: NotificationItem) {
    if (item.status !== 'read') markRead.mutate(item.id);
    const route = routeForTemplate(item.template);
    setOpen(false);
    if (route) router.push(route);
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        {unreadCount > 0 ? <BellRing className="h-[18px] w-[18px]" /> : <Bell className="h-[18px] w-[18px]" />}
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'fixed', top: coords.top, left: coords.left, width: MENU_WIDTH }}
                className="z-[60] origin-top-left overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="text-sm font-semibold text-slate-900">
                    Notifications
                    {unreadCount > 0 && <span className="ml-1.5 text-xs font-medium text-cypress-600">({unreadCount} new)</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead.mutate()}
                      disabled={markAllRead.isPending}
                      className="flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-cypress-700 disabled:opacity-50"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                {permission !== 'granted' && (
                  <button
                    onClick={requestPermission}
                    disabled={pushBusy}
                    className="flex w-full items-center gap-2 border-b border-cypress-100 bg-cypress-50/70 px-4 py-2.5 text-left text-xs font-medium text-cypress-800 transition-colors hover:bg-cypress-50 disabled:opacity-60"
                  >
                    <BellRing className="h-4 w-4 text-cypress-600" />
                    {pushBusy ? 'Enabling push alerts…' : 'Enable desktop push alerts for new enquiries'}
                  </button>
                )}
                {pushError && (
                  <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{pushError}</p>
                )}

                <div className="max-h-96 overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-400">You&apos;re all caught up.</p>
                  ) : (
                    items.map((item) => {
                      const unread = item.status !== 'read';
                      const body = notificationBody(item.payload);
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            'flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                            unread && 'bg-cypress-50/40',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-1 h-2 w-2 shrink-0 rounded-full',
                              unread ? 'bg-cypress-600' : 'bg-transparent',
                            )}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-slate-800">
                              {notificationTitle(item.template)}
                            </span>
                            {body && <span className="mt-0.5 block truncate text-xs text-slate-500">{body}</span>}
                            <span className="mt-1 block text-[11px] text-slate-400">{formatDateTime(item.created_at)}</span>
                          </span>
                          {unread && (
                            <span className="mt-0.5 text-slate-300">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => {
                    setOpen(false);
                    router.push('/notifications');
                  }}
                  className="w-full border-t border-slate-100 px-4 py-2.5 text-center text-xs font-semibold text-cypress-700 transition-colors hover:bg-cypress-50"
                >
                  View all notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
