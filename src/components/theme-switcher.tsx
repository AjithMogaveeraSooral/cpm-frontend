'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Palette } from 'lucide-react';

// Available brand themes. Each maps to a [data-theme] block in globals.css.
// `swatch` is the preview dot color (theme's 600 shade).
export const THEMES = [
  { id: 'green', label: 'Cypress Green', swatch: '#0f904c' },
  { id: 'ocean', label: 'Ocean Blue', swatch: '#2563eb' },
  { id: 'royal', label: 'Royal Purple', swatch: '#7c3aed' },
  { id: 'sunset', label: 'Sunset Amber', swatch: '#ea580c' },
  { id: 'teal', label: 'Deep Teal', swatch: '#0d9488' },
  { id: 'rose', label: 'Ruby Rose', swatch: '#e11d48' },
  { id: 'indigo', label: 'Sapphire Indigo', swatch: '#4f46e5' },
  { id: 'gold', label: 'Honey Gold', swatch: '#d97706' },
  { id: 'berry', label: 'Orchid Berry', swatch: '#c026d3' },
  { id: 'slate', label: 'Carbon Slate', swatch: '#475569' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

const STORAGE_KEY = 'cpm-theme';

function applyTheme(id: ThemeId) {
  // 'green' is the default declared in :root, so no attribute is needed.
  if (id === 'green') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', id);
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeId>('green');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeId) || 'green';
    setTheme(saved);
    applyTheme(saved);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function select(id: ThemeId) {
    setTheme(id);
    applyTheme(id);
    localStorage.setItem(STORAGE_KEY, id);
    setOpen(false);
  }

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Change theme"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-soft transition-colors hover:border-cypress-300 hover:text-cypress-700"
      >
        <Palette className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 max-h-96 w-56 overflow-y-auto animate-scale-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-elevated"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Color theme
          </div>
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="menuitemradio"
              aria-checked={theme === t.id}
              onClick={() => select(t.id)}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white shadow-soft"
                style={{ backgroundColor: t.swatch }}
              />
              <span className="flex-1 text-left">{t.label}</span>
              {theme === t.id && <Check className="h-4 w-4 text-cypress-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
