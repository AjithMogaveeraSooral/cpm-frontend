// Auth store (Zustand): holds the current user and exposes login/logout flows
// against the CPM auth endpoints. Tokens are persisted via tokenStore; the user
// summary is hydrated from /auth/me on app start.

'use client';

import { create } from 'zustand';
import { api, ApiError } from './api-client';
import { tokenStore } from './token-store';
import type { AuthResult, Role, UpdateProfileInput, UserSummary } from './types';

interface OtpResult {
  mock: boolean;
  devCode?: string;
}

interface AuthState {
  user: UserSummary | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  loginWithPassword: (mobile: string, password: string) => Promise<void>;
  requestOtp: (mobile: string, purpose?: string) => Promise<OtpResult>;
  verifyOtp: (mobile: string, code: string, purpose?: string) => Promise<void>;
  signupRequestOtp: (mobile: string, role: Role) => Promise<OtpResult>;
  signupVerifyOtp: (mobile: string, code: string) => Promise<void>;
  signupComplete: (input: {
    mobile: string;
    code: string;
    role: Role;
    full_name: string;
    email?: string;
    password: string;
  }) => Promise<UserSummary>;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
  updateProfile: (input: UpdateProfileInput) => Promise<UserSummary>;
}

// ensureRoleAccess validates that the authenticated user can use the console.
// A user with any approved role is allowed in (routing decides their landing
// view). A user with no approved roles but a pending application is allowed to
// proceed to the pending screen. Only a user with no roles at all is rejected.
function ensureRoleAccess(user: UserSummary): void {
  if (user.roles.length > 0) return;
  if ((user.pending_roles?.length ?? 0) > 0) return; // routed to /pending
  tokenStore.clear();
  throw new ApiError(
    403,
    'not_approved',
    'You are not registered yet. Please sign up to request access.',
  );
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  async loginWithPassword(mobile, password) {
    set({ status: 'loading' });
    try {
      const { data } = await api.post<AuthResult>('/auth/login', { mobile, password }, { auth: false });
      tokenStore.set(data.tokens);
      ensureRoleAccess(data.user);
      set({ user: data.user, status: 'authenticated' });
    } catch (e) {
      set({ status: 'unauthenticated' });
      throw e;
    }
  },

  async requestOtp(mobile, purpose = 'login') {
    const { data } = await api.post<{ mock: boolean; dev_code?: string }>(
      '/auth/otp/request',
      { mobile, purpose },
      { auth: false },
    );
    return { mock: data.mock, devCode: data.dev_code };
  },

  async verifyOtp(mobile, code, purpose = 'login') {
    set({ status: 'loading' });
    try {
      const { data } = await api.post<AuthResult>('/auth/otp/verify', { mobile, code, purpose }, { auth: false });
      tokenStore.set(data.tokens);
      ensureRoleAccess(data.user);
      set({ user: data.user, status: 'authenticated' });
    } catch (e) {
      set({ status: 'unauthenticated' });
      throw e;
    }
  },

  async signupRequestOtp(mobile, role) {
    const { data } = await api.post<{ mock: boolean; dev_code?: string }>(
      '/auth/signup/request-otp',
      { mobile, role },
      { auth: false },
    );
    return { mock: data.mock, devCode: data.dev_code };
  },

  async signupVerifyOtp(mobile, code) {
    await api.post('/auth/signup/verify-otp', { mobile, code }, { auth: false });
  },

  async signupComplete(input) {
    const { data } = await api.post<UserSummary>('/auth/signup', input, { auth: false });
    return data;
  },

  async hydrate() {
    if (!tokenStore.access) {
      set({ status: 'unauthenticated' });
      return;
    }
    set({ status: 'loading' });
    try {
      const { data } = await api.get<UserSummary>('/auth/me');
      set({ user: data, status: 'authenticated' });
    } catch {
      tokenStore.clear();
      set({ user: null, status: 'unauthenticated' });
    }
  },

  async logout() {
    const refresh = tokenStore.refresh;
    try {
      if (refresh) await api.post('/auth/logout', { refresh_token: refresh }, { auth: false });
    } catch {
      // best-effort; clear locally regardless
    }
    tokenStore.clear();
    set({ user: null, status: 'unauthenticated' });
  },

  hasRole(...roles) {
    const u = get().user;
    return !!u && roles.some((r) => u.roles.includes(r));
  },

  async updateProfile(input) {
    const { data } = await api.patch<UserSummary>('/auth/me', input);
    set({ user: data });
    return data;
  },
}));
