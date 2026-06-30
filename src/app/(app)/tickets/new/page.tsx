'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import type { Property, RaiseTicketInput, Ticket } from '@/lib/types';

const schema = z.object({
  property_id: z.string().min(1, 'Select a property'),
  category: z.enum(['plumbing', 'electrical', 'painting', 'cleaning', 'security', 'civil', 'other']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
});

type FormValues = z.infer<typeof schema>;

const labelCls = 'text-sm font-medium text-slate-700';
const selectCls =
  'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cypress-500 focus:outline-none focus:ring-1 focus:ring-cypress-500';

export default function NewTicketPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const propertiesQ = useQuery({
    queryKey: ['properties', 'for-tickets'],
    queryFn: () => api.get<Property[]>('/properties', { query: { page: 1, page_size: 100 } }),
  });
  const properties = propertiesQ.data?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'plumbing', priority: 'medium' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    const payload: RaiseTicketInput = {
      property_id: values.property_id,
      category: values.category,
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
    };
    try {
      const res = await api.post<Ticket>('/tickets', payload);
      router.push(`/tickets/${res.data?.id ?? ''}`);
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not raise the ticket.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/tickets"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-cypress-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tickets
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Raise a maintenance ticket</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Property</label>
              <select className={selectCls} disabled={propertiesQ.isLoading} {...register('property_id')}>
                <option value="">Select a property…</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.upid} · {p.bhk} BHK {p.flat_no}
                  </option>
                ))}
              </select>
              {errors.property_id && (
                <p className="text-xs text-red-600">{errors.property_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Category</label>
                <select className={selectCls} {...register('category')}>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="painting">Painting</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="security">Security</option>
                  <option value="civil">Civil</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Priority</label>
                <select className={selectCls} {...register('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <Input label="Title" error={errors.title?.message} {...register('title')} />

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Description (optional)</label>
              <textarea
                rows={4}
                className={selectCls}
                placeholder="Describe the issue…"
                {...register('description')}
              />
            </div>
          </div>
        </Card>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <div className="flex justify-end gap-3">
          <Link href="/tickets">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isSubmitting}>
            Raise ticket
          </Button>
        </div>
      </form>
    </div>
  );
}
