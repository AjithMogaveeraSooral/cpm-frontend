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
