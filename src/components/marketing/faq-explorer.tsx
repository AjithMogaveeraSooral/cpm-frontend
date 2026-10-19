'use client';

import { useId, useState } from 'react';
import { Search } from 'lucide-react';
import type { FAQ } from '@/lib/site-content';
import p from './pages.module.css';

export function FaqExplorer({ items, audience }: { items: FAQ[]; audience: 'owner' | 'tenant' }) {
  const [query, setQuery] = useState('');
  const id = useId();
  const term = query.trim().toLowerCase();
  const results = items.map((item, index) => ({ item, number: index + 1 })).filter(({ item }) => !term || `${item.question} ${item.answer}`.toLowerCase().includes(term));

  return (
    <div>
      <form role="search" className={p.faqSearch} onSubmit={(event) => event.preventDefault()}>
        <Search size={18} aria-hidden="true" />
        <label htmlFor={`${id}-q`} className="sr-only">Search {audience} questions</label>
        <input id={`${id}-q`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} maxLength={150} placeholder={`Search ${audience} questions...`} autoComplete="off" />
        <button type="submit">Search</button>
      </form>
      <p className="sr-only" role="status">{results.length} {results.length === 1 ? 'question' : 'questions'} shown</p>
      {results.length === 0 ? <p className={p.faqEmpty}>No questions match “{query.trim()}”. Try a different word or contact Cypress.</p> : (
        <div className={p.faqList}>
          {results.map(({ item, number }) => (
            <details key={item.question} name="faq-explorer" open={number === 1 && !term ? true : undefined}>
              <summary><span className={p.faqNumber}>{number}</span>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
