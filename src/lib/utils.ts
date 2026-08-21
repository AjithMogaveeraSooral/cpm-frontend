import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// cn merges Tailwind class names, resolving conflicts predictably.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// formatINR renders a number as Indian Rupees.
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

// formatDate renders an ISO date as a short, locale-aware string.
export function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// formatDateTime renders an ISO timestamp as a short date + time string.
export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// notificationTitle humanizes a notification template key into a readable title.
export function notificationTitle(template: string): string {
  return template.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// notificationBody derives a short, human-readable summary line from a
// notification's payload for display in the bell dropdown and browser push.
export function notificationBody(payload?: Record<string, unknown>): string | null {
  if (!payload) return null;
  const parts = Object.entries(payload)
    .filter(([k, v]) => k !== 'lead_id' && (typeof v === 'string' || typeof v === 'number') && String(v).trim() !== '')
    .slice(0, 3)
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
  return parts.length ? parts.join(' · ') : null;
}
