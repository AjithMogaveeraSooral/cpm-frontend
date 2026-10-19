'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

export function PropertyImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState<string>();
  if (!src || failed === src) return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 bg-slate-100 text-slate-500" role="img" aria-label="Property photograph unavailable">
      <Building2 className="h-10 w-10" aria-hidden="true" />
      <span className="text-sm">Photographs not available</span>
    </div>
  );
  // Signed URLs expire and must not be cached by an image optimization proxy.
  return <Image unoptimized src={src} alt={alt} width={1200} height={800} loading="lazy" onError={() => setFailed(src)} className="h-full w-full object-cover" />;
}