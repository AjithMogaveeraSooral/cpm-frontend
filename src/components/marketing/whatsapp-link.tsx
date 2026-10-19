'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/lib/site-config';
import s from './marketing.module.css';

export function WhatsAppLink() {
  const pathname = usePathname();
  const href = whatsappUrl(pathname ?? '/');
  if (!href) return null;
  return <a className={s.whatsapp} href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with Cypress on WhatsApp (opens a new tab)"><MessageCircle size={20} aria-hidden="true" />WhatsApp</a>;
}