'use client';

import { useState } from 'react';
import { ChevronDown, MapPin, Sparkles, Check, BellRing } from 'lucide-react';
import { CITIES_MASTER, useDataStore } from '@/lib/data-store';
import { Button } from './ui/button';

interface CitySelectorProps {
  variant?: 'compact' | 'expanded';
  showNotifyModal?: boolean;
}

export function CitySelector({ variant = 'compact' }: CitySelectorProps) {
  const { selectedCity, setCity } = useDataStore();
  const [open, setOpen] = useState(false);
  const [notifyCity, setNotifyCity] = useState<string | null>(null);
  const [notifyContact, setNotifyContact] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  const current = CITIES_MASTER.find((c) => c.id === selectedCity) || CITIES_MASTER[0];

  const handleSelect = (cityId: string) => {
    const target = CITIES_MASTER.find((c) => c.id === cityId);
    if (target?.status === 'coming_soon') {
      setNotifyCity(target.name);
      setOpen(false);
      return;
    }
    setCity(cityId);
    setOpen(false);
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyContact.trim()) return;
    setNotifySuccess(true);
    setTimeout(() => {
      setNotifyCity(null);
      setNotifySuccess(false);
      setNotifyContact('');
    }, 2000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-xl border transition-all duration-200 ${
          variant === 'compact'
            ? 'border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-cypress-400 hover:bg-cypress-50/40 shadow-soft'
            : 'border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-cypress-500 shadow-sm'
        }`}
      >
        <MapPin className="h-3.5 w-3.5 text-cypress-600" />
        <span>{current.name}</span>
        {current.status === 'active' && (
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
            Live
          </span>
        )}
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-fade-in">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select City</p>
              <p className="text-xs text-slate-500">Currently serving Bengaluru · Expanding across South India</p>
            </div>

            <div className="mt-1 space-y-1">
              {CITIES_MASTER.map((city) => {
                const isActive = city.id === selectedCity;
                const isLive = city.status === 'active';

                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelect(city.id)}
                    className={`group flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-all ${
                      isActive
                        ? 'bg-cypress-50/80 text-cypress-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-cypress-100 group-hover:text-cypress-700">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{city.name}</span>
                        {isLive ? (
                          <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-tight text-slate-500 line-clamp-2">
                        {city.description}
                      </p>
                    </div>
                    {isActive && <Check className="h-4 w-4 shrink-0 text-cypress-600 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Notify Me Modal for Coming Soon cities */}
      {notifyCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Expanding to {notifyCity} Soon!</h3>
                <p className="text-xs text-slate-500">Cypress PM is actively launching operations in {notifyCity}.</p>
              </div>
            </div>

            {notifySuccess ? (
              <div className="my-6 rounded-xl bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-800">
                ✓ Thank you! We have recorded your interest. We will notify you with launch offers!
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="mt-5 space-y-4">
                <p className="text-xs text-slate-600">
                  Are you a property owner or tenant in <strong>{notifyCity}</strong>? Enter your mobile or email to get early-access onboarding and zero-brokerage alerts.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile or Email</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210 or your.email@domain.com"
                    value={notifyContact}
                    onChange={(e) => setNotifyContact(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setNotifyCity(null)}>
                    Close
                  </Button>
                  <Button type="submit">
                    <BellRing className="h-4 w-4" /> Notify Me
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
