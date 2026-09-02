'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import type { AdminUser } from '@/lib/types';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-cypress-100 text-cypress-700',
  suspended: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
};

const mobileField = z
  .string()
  .min(10, 'Enter a valid mobile number')
  .regex(/^[0-9+\-\s]+$/, 'Enter a valid mobile number');

const emailField = z.string().email('Enter a valid email').optional().or(z.literal(''));

const createSchema = z
  .object({
    full_name: z.string().min(1, 'Full name is required'),
    mobile: mobileField,
    email: emailField,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm the password'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

const editSchema = z
  .object({
    full_name: z.string().min(1, 'Full name is required'),
    email: emailField,
    status: z.enum(['active', 'suspended']),
    password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
  })
  .refine((d) => !d.password || d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

interface UsersPanelProps {
  role: 'tenant' | 'owner';
  title: string;
  singular: string; // e.g. "tenant" | "owner"
}

// Shell modal used by both the create and edit forms.
function ModalShell({
  heading,
  onClose,
  children,
}: {
  heading: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}

// CreateUserForm provisions a new tenant/owner. Password is required and must
// be confirmed.
function CreateUserForm({
  role,
  singular,
  onClose,
}: {
  role: 'tenant' | 'owner';
  singular: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({ resolver: zodResolver(createSchema) });

  const create = useMutation({
    mutationFn: async (values: CreateValues) =>
      api.post<AdminUser>('/auth/users', {
        role,
        full_name: values.full_name.trim(),
        mobile: values.mobile.trim(),
        email: values.email?.trim() || undefined,
        password: values.password,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users', role] });
      onClose();
    },
    onError: (e) => setFormError(e instanceof ApiError ? e.message : 'Failed to create user'),
  });

  return (
    <ModalShell heading={`Add ${singular}`} onClose={onClose}>
      <form onSubmit={handleSubmit((v) => create.mutate(v))} className="flex flex-col gap-4">
        <Input label="Full name" placeholder="Jane Doe" error={errors.full_name?.message} {...register('full_name')} />
        <Input label="Mobile number" placeholder="9876543210" error={errors.mobile?.message} {...register('mobile')} />
        <Input
          label="Email (optional)"
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter password"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />

        {formError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting || create.isPending}>
            Create {singular}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

// EditUserForm edits an existing user's profile, status, and (optionally)
// password. Mobile is the account identity and is shown read-only.
function EditUserForm({
  role,
  singular,
  user,
  onClose,
}: {
  role: 'tenant' | 'owner';
  singular: string;
  user: AdminUser;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      full_name: user.full_name ?? '',
      email: user.email ?? '',
      status: user.status === 'suspended' ? 'suspended' : 'active',
      password: '',
      confirm_password: '',
    },
  });

  const update = useMutation({
    mutationFn: async (values: EditValues) =>
      api.patch<AdminUser>(`/auth/users/${user.id}`, {
        full_name: values.full_name.trim(),
        email: values.email?.trim() ?? '',
        status: values.status,
        password: values.password?.trim() ? values.password : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users', role] });
      onClose();
    },
    onError: (e) => setFormError(e instanceof ApiError ? e.message : 'Failed to update user'),
  });

  return (
    <ModalShell heading={`Edit ${singular}`} onClose={onClose}>
      <form onSubmit={handleSubmit((v) => update.mutate(v))} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Mobile number</label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm text-slate-500">
            {user.mobile}
          </div>
        </div>
        <Input label="Full name" error={errors.full_name?.message} {...register('full_name')} />
        <Input label="Email (optional)" type="email" error={errors.email?.message} {...register('email')} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-soft focus:border-cypress-500 focus:outline-none focus:ring-2 focus:ring-cypress-500/30"
            {...register('status')}
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <Input
          label="New password (optional)"
          type="password"
          placeholder="Leave blank to keep current"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm new password"
          type="password"
          placeholder="Re-enter new password"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />

        {formError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting || update.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

// UsersPanel renders the admin directory for a single role (tenants or owners)
// with modals to provision new accounts and edit existing ones. Admin-only.
export function UsersPanel({ role, title, singular }: UsersPanelProps) {
  const router = useRouter();
  const { status, hasRole } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const allowed = hasRole('cypress_admin', 'app_admin');

  useEffect(() => {
    if (status === 'authenticated' && !allowed) router.replace('/dashboard');
  }, [status, allowed, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', role],
    queryFn: async () => api.get<AdminUser[]>('/auth/users', { query: { role } }),
    enabled: allowed,
  });

  const rows = data?.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{rows.length} total</span>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Add {singular}
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-slate-500">Loading {singular}s…</p>}
      {error && <p className="text-red-600">Could not load {singular}s.</p>}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.full_name || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{u.mobile}</td>
                <td className="px-4 py-3 text-slate-600">{u.email || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      STATUS_STYLES[u.status] ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                      onClick={() => setEditing(u)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && rows.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-400">No {singular}s yet.</p>
        )}
      </Card>

      {showCreate && <CreateUserForm role={role} singular={singular} onClose={() => setShowCreate(false)} />}
      {editing && (
        <EditUserForm role={role} singular={singular} user={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
