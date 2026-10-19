'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FileText, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Pagination } from '@/lib/types';

// API metadata only. Never use the legacy property document/IDB store here.
type VaultProperty = { id: string; upid: string; apartment_name?: string; flat_no?: string };
type DocumentVersion = {
  id: string;
  version_no: number;
  created_at: string;
  mime_type?: string | null;
  size_bytes?: number | null;
};
type VaultDocument = {
  id: string;
  upid: string;
  title: string;
  category: string;
  created_at: string;
  current_version_id?: string;
  versions?: DocumentVersion[] | null;
};
type DownloadResponse = { download_url: string; expires_in_seconds: number };
type FreshLink = { url: string; expiresAt: number };

const categories = [
  ['agreement', 'Agreements'], ['inventory', 'Inventory'], ['inspection', 'Inspections'],
  ['rent_receipt', 'Rent receipts'], ['invoice', 'Invoices'], ['service_invoice', 'Service invoices'],
  ['image', 'Images'], ['video', 'Videos'], ['report', 'Reports'], ['identity', 'Identity / KYC (admin only)'],
] as const;
const pageSize = 20;
const privateQueryOptions = {
  gcTime: 0,
  staleTime: 0,
  retry: false,
  refetchOnWindowFocus: true,
} as const;

function timestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Timestamp unavailable' : date.toLocaleString();
}

function fileSize(bytes?: number | null): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return 'Size unavailable';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function secureLink(data: DownloadResponse, requestedAt: number): FreshLink {
  const url = new URL(data.download_url);
  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname) {
    throw new Error('The server did not return a secure HTTPS download link.');
  }
  if (!Number.isFinite(data.expires_in_seconds) || data.expires_in_seconds <= 0) {
    throw new Error('The server did not return a valid download expiry.');
  }
  // Keep links in component memory only, for at most one minute; allow clock/network margin.
  const lifetime = Math.min(data.expires_in_seconds * 1000 - 5000, 60_000);
  const expiresAt = requestedAt + lifetime;
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw new Error('The download link has expired. Request a new link.');
  }
  return { url: url.href, expiresAt };
}

function RequestError({ error, retry }: { error: unknown; retry: () => void }) {
  const message = error instanceof ApiError && (error.status === 401 || error.status === 403)
    ? 'Access denied or session expired. Sign in with an authorized account and retry.'
    : error instanceof Error ? error.message : 'The request failed.';
  return <div role="alert" className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
    <p>{message}</p><Button variant="secondary" size="sm" onClick={retry}>Retry</Button>
  </div>;
}

function PaginationControls({ label, page, pagination, busy, onChange }: {
  label: string; page: number; pagination?: Pagination; busy: boolean; onChange: (page: number) => void;
}) {
  return <nav aria-label={`${label} pagination`} className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
    <Button variant="secondary" size="sm" disabled={busy || page <= 1} onClick={() => onChange(page - 1)}>Previous {label}</Button>
    <span>Page {page}{pagination ? ` of ${Math.max(1, pagination.total_pages)} · ${pagination.total_items} total` : ''}</span>
    <Button variant="secondary" size="sm" disabled={busy || !pagination || page >= pagination.total_pages} onClick={() => onChange(page + 1)}>Next {label}</Button>
  </nav>;
}

export default function DocumentsPage() {
  const { user, status } = useAuth();
  if (status === 'idle' || status === 'loading') return <p role="status">Checking document access…</p>;
  if (status !== 'authenticated' || !user) return <Card><p>Sign in to view authorized documents.</p><Link href="/login" className="text-cypress-700 underline">Sign in</Link></Card>;
  if (!user.roles.length) return <Card><p>Document access requires an approved role.</p><Link href="/pending" className="text-cypress-700 underline">View approval status</Link></Card>;
  // Remount all local selections/links on identity or authorization changes.
  const identity = JSON.stringify([user.id, [...user.roles].sort()]);
  return <DocumentVault key={identity} identity={identity} isAdmin={user.roles.some((role) => role === 'app_admin' || role === 'cypress_admin')} />;
}

function DocumentVault({ identity, isAdmin }: { identity: string; isAdmin: boolean }) {
  const [propertyPage, setPropertyPage] = useState(1);
  const [upid, setUpid] = useState('');
  const properties = useQuery({
    ...privateQueryOptions,
    queryKey: ['document-vault', identity, 'properties', propertyPage],
    queryFn: ({ signal }) => api.get<VaultProperty[] | null>('/properties', { signal, query: { page: propertyPage, page_size: pageSize } }),
  });
  const items = properties.data?.data ?? [];
  const selected = !properties.isError && items.some((property) => property.upid === upid) ? upid : '';

  return <div className="space-y-6">
    <header>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><ShieldCheck className="h-6 w-6 text-cypress-700" />Document vault</h1>
      <p className="mt-2 text-sm text-slate-600">Read-only access to documents authorized by the server for your properties.</p>
      <p className="mt-2 text-xs text-slate-500">Tenant access is property-scoped, not specific to an individual tenancy. KYC and restricted documents are admin-only. Uploads remain available through the existing admin API; this vault does not support uploads while upload finalization is unavailable.</p>
    </header>
    <Card>
      <h2 className="mb-3 text-lg font-semibold">Choose an authorized property</h2>
      {properties.isPending ? <p role="status">Loading properties…</p>
        : properties.isError ? <RequestError error={properties.error} retry={() => { void properties.refetch(); }} />
        : <>
          {items.length === 0 ? <p>No authorized properties on this page.</p> : <>
            <label htmlFor="vault-property" className="mb-2 block text-sm font-medium">Property (current property page)</label>
            <select id="vault-property" value={selected} onChange={(event) => setUpid(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm">
              <option value="">Select a property</option>
              {items.map((property) => <option key={property.id} value={property.upid}>{property.upid}{property.apartment_name ? ` · ${property.apartment_name}` : ''}{property.flat_no ? ` · ${property.flat_no}` : ''}</option>)}
            </select>
          </>}
          {properties.isFetching && <p role="status" className="mt-2 text-sm">Refreshing properties…</p>}
        </>}
      <PaginationControls label="properties" page={propertyPage} pagination={properties.data?.pagination} busy={properties.isFetching} onChange={(page) => { setUpid(''); setPropertyPage(page); }} />
    </Card>
    {selected ? <PropertyDocuments key={selected} identity={identity} upid={selected} isAdmin={isAdmin} />
      : <Card><p className="text-sm text-slate-600">Select a property to list its available documents.</p></Card>}
  </div>;
}

function PropertyDocuments({ identity, upid, isAdmin }: { identity: string; upid: string; isAdmin: boolean }) {
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const documents = useQuery({
    ...privateQueryOptions,
    queryKey: ['document-vault', identity, 'documents', upid, category, page],
    queryFn: ({ signal }) => api.get<VaultDocument[] | null>('/documents', { signal, query: { upid, category, page, page_size: pageSize } }),
  });
  const items = documents.data?.data ?? [];
  const visible = items.filter((doc) => doc.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const selected = !documents.isError && visible.some((doc) => doc.id === selectedId) ? selectedId : '';

  return <>
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Documents · {upid}</h2>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="vault-category" className="mb-1 block text-sm font-medium">Category</label>
          <select id="vault-category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); setSelectedId(''); }} className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm">
            <option value="">All authorized categories</option>
            {categories.filter(([value]) => isAdmin || value !== 'identity').map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <Input label="Search titles on this page only" value={search} onChange={(event) => { setSearch(event.target.value); setSelectedId(''); }} placeholder="Filter the currently loaded page" />
      </div>
      <p className="mb-4 text-xs text-slate-500">Category filters apply on the server. Title search only filters this page, not the entire vault; pagination totals are before title search.</p>
      {documents.isPending ? <p role="status">Loading documents…</p>
        : documents.isError ? <RequestError error={documents.error} retry={() => { void documents.refetch(); }} />
        : <>
          {documents.isFetching && <p role="status" className="mb-2 text-sm">Refreshing documents…</p>}
          {items.length === 0 ? <p className="py-4 text-sm text-slate-600">No authorized documents in this category on this page.</p>
            : visible.length === 0 ? <p className="py-4 text-sm text-slate-600">No titles match on this page. Clear the search or try another page.</p>
            : <ul className="divide-y divide-slate-100">
              {visible.map((doc) => <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 break-words font-medium"><FileText aria-hidden="true" className="h-4 w-4 shrink-0 text-cypress-700" />{doc.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{categories.find(([value]) => value === doc.category)?.[1] ?? doc.category} · Created {timestamp(doc.created_at)}</p>
                </div>
                <Button variant={selected === doc.id ? 'primary' : 'secondary'} size="sm" aria-pressed={selected === doc.id} aria-label={`View versions of ${doc.title}`} onClick={() => setSelectedId(doc.id)}>View versions</Button>
              </li>)}
            </ul>}
        </>}
      <PaginationControls label="documents" page={page} pagination={documents.data?.pagination} busy={documents.isFetching} onChange={(next) => { setPage(next); setSelectedId(''); }} />
    </Card>
    {selected && <DocumentDetails key={selected} identity={identity} id={selected} upid={upid} />}
  </>;
}

function DocumentDetails({ identity, id, upid }: { identity: string; id: string; upid: string }) {
  const details = useQuery({
    ...privateQueryOptions,
    queryKey: ['document-vault', identity, 'detail', upid, id],
    queryFn: ({ signal }) => api.get<VaultDocument>(`/documents/${encodeURIComponent(id)}`, { signal }),
  });
  if (details.isPending) return <Card><p role="status">Loading document versions…</p></Card>;
  if (details.isError) return <RequestError error={details.error} retry={() => { void details.refetch(); }} />;
  const doc = details.data.data;
  if (doc.id !== id || doc.upid !== upid) return <Card><p role="alert">The document does not match the selected property.</p></Card>;
  const versions = [...(doc.versions ?? [])].sort((a, b) => b.version_no - a.version_no);
  return <Card>
    <h2 className="break-words text-lg font-semibold">{doc.title} · Version history</h2>
    <p className="mt-2 text-xs text-slate-500">Every download click requests a fresh authorized HTTPS link. Links are temporary and are not saved in this app. If storage reports an expired link, return here and request a new one.</p>
    {details.isFetching && <p role="status" className="mt-2 text-sm">Refreshing versions…</p>}
    {!versions.length ? <p className="mt-4 text-sm">No versions are available.</p> : <ul className="mt-4 divide-y divide-slate-100">
      {versions.map((version) => <li key={version.id} className="space-y-3 py-4">
        <div>
          <h3 className="font-medium">Version {version.version_no}{doc.current_version_id === version.id ? ' · Current' : ''}</h3>
          <p className="mt-1 text-sm text-slate-600">Uploaded {timestamp(version.created_at)}</p>
          <p className="text-xs text-slate-500">{version.mime_type || 'MIME type unavailable'} · {fileSize(version.size_bytes)}</p>
        </div>
        <VersionDownload documentId={id} versionId={version.id} />
      </li>)}
    </ul>}
  </Card>;
}

function VersionDownload({ documentId, versionId }: { documentId: string; versionId: string }) {
  const [link, setLink] = useState<FreshLink | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => { request.current?.abort(); }, []);
  useEffect(() => {
    if (!link) return;
    const timer = window.setTimeout(() => setLink(null), Math.max(0, link.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [link]);

  async function download(open = false) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLink(null);
    setError(null);
    setBusy(true);
    const requestedAt = Date.now();
    try {
      // Deliberately not React Query/useMutation: signed URLs must never enter its cache.
      const { data } = await api.get<DownloadResponse>(`/documents/${encodeURIComponent(documentId)}/download`, {
        signal: controller.signal,
        // The shared client has no cache option; avoid reusing a browser-cached signing response.
        query: { version_id: versionId, _fresh: `${requestedAt}-${Math.random().toString(36).slice(2)}` },
      });
      if (controller.signal.aborted) return;
      const fresh = secureLink(data, requestedAt);
      if (open) window.location.assign(fresh.url);
      else setLink(fresh);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return <div className="space-y-2">
    <Button variant="secondary" size="sm" loading={busy} onClick={() => { void download(); }}>Get fresh download link</Button>
    {link && <p><a href={link.url} rel="noreferrer noopener" referrerPolicy="no-referrer" className="text-sm font-medium text-cypress-700 underline" onClick={(event) => {
      event.preventDefault();
      // Never navigate to the rendered URL on a normal click: reauthorize/re-sign first.
      void download(true);
    }} onAuxClick={(event) => {
      if (event.button === 1) {
        event.preventDefault();
        void download(true);
      }
    }}>Download version (rechecks access)</a><span className="ml-2 text-xs text-slate-500">Temporary link; clears within a minute.</span></p>}
    {error != null && <RequestError error={error} retry={() => { void download(); }} />}
  </div>;
}