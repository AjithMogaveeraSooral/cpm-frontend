'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LocationPicker, type LocationValue } from '@/components/ui/location-picker';

const schema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email').or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Seed the form + map from the current user once it hydrates.
  useEffect(() => {
    if (!user) return;
    reset({ full_name: user.full_name ?? '', email: user.email ?? '' });
    if (user.latitude != null && user.longitude != null) {
      setLocation({
        lat: user.latitude,
        lng: user.longitude,
        address: user.location_address,
        placeId: user.location_place_id,
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: FormValues) => {
    setMessage(null);
    try {
      await updateProfile({
        full_name: values.full_name,
        email: values.email || undefined,
        latitude: location?.lat,
        longitude: location?.lng,
        location_address: location?.address,
        location_place_id: location?.placeId,
      });
      setMessage({ kind: 'ok', text: 'Profile updated.' });
    } catch (e) {
      setMessage({
        kind: 'err',
        text: e instanceof ApiError ? e.message : 'Could not update your profile.',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">My profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Account
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Input label="Mobile" value={user.mobile} disabled />
            <Input label="Full name" error={errors.full_name?.message} {...register('full_name')} />
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="text-xs text-slate-500">
              Roles: <span className="font-medium text-cypress-700">{user.roles.join(', ') || '—'}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            My location
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Set your location so Cypress can match nearby properties and services.
          </p>
          <LocationPicker value={location} onChange={setLocation} />
        </Card>

        {message && (
          <p className={message.kind === 'ok' ? 'text-sm text-cypress-700' : 'text-sm text-red-600'}>
            {message.text}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
