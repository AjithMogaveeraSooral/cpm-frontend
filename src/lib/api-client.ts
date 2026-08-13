// Typed fetch client for the CPM API. Responsibilities:
//   - prefix the configured base URL,
//   - attach the bearer access token,
//   - unwrap the standard { success, data, error, meta } envelope,
//   - transparently refresh the access token once on a 401 and retry,
//   - surface API errors as a typed ApiError.

import { tokenStore } from './token-store';
import type { Envelope, Pagination, TokenPair } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string>;

  constructor(status: number, code: string, message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiResult<T> {
  data: T;
  pagination?: Pagination;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  auth?: boolean; // default true
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const absoluteBase = /^https?:\/\//i.test(BASE_URL);
  const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
  const url = new URL(`${BASE_URL}${path}`, origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
  }
  // When the base URL is absolute (e.g. static hosting calling the backend
  // cross-origin) keep the full URL; otherwise return a relative URL so the dev
  // proxy / same-origin rules apply.
  return absoluteBase ? url.toString() : url.pathname + url.search;
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = tokenStore.refresh;
  if (!refresh) return false;
  // Collapse concurrent refreshes into one network call.
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(buildUrl('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refresh }),
        });
        if (!res.ok) return false;
        const env = (await res.json()) as Envelope<TokenPair>;
        if (!env.success || !env.data) return false;
        tokenStore.set(env.data);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

async function raw<T>(path: string, opts: RequestOptions, retry: boolean): Promise<ApiResult<T>> {
  const { method = 'GET', body, query, auth = true, signal } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth && tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (res.status === 401 && auth && retry && (await refreshAccessToken())) {
    return raw<T>(path, opts, false);
  }

  if (res.status === 204) {
    return { data: undefined as T };
  }

  let env: Envelope<T>;
  try {
    env = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiError(res.status, 'invalid_response', 'Malformed server response');
  }

  if (!res.ok || !env.success) {
    const e = env.error;
    throw new ApiError(res.status, e?.code ?? 'error', e?.message ?? 'Request failed', e?.details);
  }

  return { data: env.data as T, pagination: env.meta?.pagination };
}

export const api = {
  get: <T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    raw<T>(path, { ...opts, method: 'GET' }, true),
  post: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method'> = {}) =>
    raw<T>(path, { ...opts, method: 'POST', body }, true),
  patch: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method'> = {}) =>
    raw<T>(path, { ...opts, method: 'PATCH', body }, true),
  del: <T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    raw<T>(path, { ...opts, method: 'DELETE' }, true),
};
