import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'btn-shine bg-cypress-gradient text-white shadow-glow-sm hover:shadow-glow hover:brightness-[1.06] focus-visible:ring-cypress-500/60',
  secondary:
    'bg-white text-cypress-700 border border-cypress-200 hover:border-cypress-300 hover:bg-cypress-50 shadow-soft focus-visible:ring-cypress-500/50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400/50',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_4px_14px_-4px_rgba(220,38,38,0.5)] hover:brightness-105 focus-visible:ring-red-500/50',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'group relative inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium',
        'transition-all duration-200 will-change-transform',
        'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:scale-100',
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
