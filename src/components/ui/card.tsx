'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/motion';

export function Card({
  className,
  children,
  interactive,
}: {
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-300',
        interactive && 'card-hover cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'cypress',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: 'cypress' | 'gold' | 'amber' | 'sky' | 'rose';
}) {
  const accents: Record<string, string> = {
    cypress: 'from-cypress-500/15 to-cypress-600/5 text-cypress-700',
    gold: 'from-gold-400/20 to-gold-500/5 text-gold-700',
    amber: 'from-amber-400/20 to-amber-500/5 text-amber-700',
    sky: 'from-sky-400/20 to-sky-500/5 text-sky-700',
    rose: 'from-rose-400/20 to-rose-500/5 text-rose-700',
  };
  const isNumber = typeof value === 'number';

  return (
    <div className="card-premium card-hover group relative overflow-hidden p-5">
      {/* Decorative corner glow */}
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100',
          accents[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-500">{label}</span>
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            {isNumber ? <AnimatedNumber value={value as number} /> : value}
          </span>
          {hint && <span className="text-xs text-slate-400">{hint}</span>}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner-top',
              accents[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
