'use client';

import { useState } from 'react';
import Link from 'next/link';
import { InterestModal } from '@/app/(public)/explore/interest-modal';
import { visitURL } from '@/lib/public-properties';

export function PropertyActions({ upid, label }: { upid: string; label: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <div className="flex flex-wrap gap-3">
      <Link href={visitURL(upid)} className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800">Schedule a Visit</Link>
      <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-50">Express interest</button>
    </div>
    {open && <InterestModal open onClose={() => setOpen(false)} propertyUpid={upid} propertyLabel={label} />}
  </>;
}