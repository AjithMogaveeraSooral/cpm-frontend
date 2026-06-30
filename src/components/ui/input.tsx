import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-soft',
          'transition-all duration-200 placeholder:text-slate-400',
          'hover:border-slate-400',
          'focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/30',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/30',
          className,
        )}
        {...props}
      />
      {error && <p className="animate-fade-in text-xs font-medium text-red-600">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
