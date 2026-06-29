// Token storage abstraction. Tokens live in localStorage on the client so the
// SPA can attach the access token and silently refresh. (For stricter security,
// swap this for httpOnly cookies set by a Next.js route handler.)

import type { TokenPair } from './types';

const ACCESS_KEY = 'cpm.access';
const REFRESH_KEY = 'cpm.refresh';

export const tokenStore = {
  get access(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  get refresh(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: TokenPair) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_KEY, tokens.access_token);
    window.localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  },
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
