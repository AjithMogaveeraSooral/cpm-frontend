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
  loginWithPassword: (mobile: string, password: string, role?: Role) => Promise<void>;
  requestOtp: (mobile: string, purpose?: string) => Promise<OtpResult>;
  verifyOtp: (mobile: string, code: string, purpose?: string, role?: Role) => Promise<void>;
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

// ensureRoleAccess validates that the authenticated user may use the portal they
// selected on the login screen. The selected portal is ENFORCED: a user who
// picks "Tenant" must actually hold (or have a pending application for) the
// tenant role, otherwise login is rejected with a role-not-found error. This
// prevents an owner/admin from being silently routed into a different portal.
function ensureRoleAccess(user: UserSummary, role?: Role): void {
  // No portal preference supplied: allow any account that has (or is applying
  // for) a role.
  if (!role) {
    if (user.roles.length > 0 || (user.pending_roles?.length ?? 0) > 0) return;
    tokenStore.clear();
    throw new ApiError(
      403,
      'not_approved',
      'You are not registered yet. Please sign up to request access.',
    );
  }

  // The Cypress Admin portal is also satisfied by the higher-privileged
  // app_admin role.
  const acceptedRoles: Role[] = role === 'cypress_admin' ? ['cypress_admin', 'app_admin'] : [role];

  // Approved for the selected portal -> allow straight in.
  if (user.roles.some((r) => acceptedRoles.includes(r))) return;

  // Applied for the selected portal but not yet approved -> route to /pending.
  if (user.roles.length === 0 && (user.pending_roles ?? []).some((r) => acceptedRoles.includes(r))) {
    return;
  }

  // The account exists but does not hold the selected portal's role. Reject so
  // the user is not routed into a different dashboard.
  tokenStore.clear();
  const label = role === 'tenant' ? 'Tenant' : role === 'owner' ? 'Property Owner' : 'Cypress Admin';
  throw new ApiError(
    404,
    'role_not_found',
    `No ${label} account found for this mobile number. Select the correct portal or sign up as a ${label}.`,
  );
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  async loginWithPassword(mobile, password, role) {
    set({ status: 'loading' });
    try {
      const { data } = await api.post<AuthResult>('/auth/login', { mobile, password }, { auth: false });
      tokenStore.set(data.tokens);
      ensureRoleAccess(data.user, role);
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

  async verifyOtp(mobile, code, purpose = 'login', role) {
    set({ status: 'loading' });
    try {
      const { data } = await api.post<AuthResult>('/auth/otp/verify', { mobile, code, purpose }, { auth: false });
      tokenStore.set(data.tokens);
      ensureRoleAccess(data.user, role);
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
