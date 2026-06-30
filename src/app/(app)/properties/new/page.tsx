'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LocationPicker, type LocationValue } from '@/components/ui/location-picker';
import type {
  Amenity,
  Apartment,
  City,
  CreatePropertyInput,
  Locality,
  Property,
  ServicePlan,
} from '@/lib/types';

const schema = z.object({
  city_id: z.string().min(1, 'Select a city'),
  locality_id: z.string().min(1, 'Select a locality'),
  apartment_id: z.string().optional(),
  plan_id: z.string().min(1, 'Select a service plan'),
  flat_no: z.string().min(1, 'Flat number is required'),
  property_type: z.enum(['apartment', 'villa', 'independent_house']),
  bhk: z.coerce.number().int().positive('BHK must be positive'),
  area_sqft: z.coerce.number().nonnegative().optional(),
  furnishing: z.enum(['unfurnished', 'semi', 'full']),
  monthly_rent: z.coerce.number().positive('Monthly rent must be positive'),
  deposit: z.coerce.number().nonnegative().optional(),
  maintenance_coverage: z.enum([
    'owner',
    'labour_only',
    'materials_only',
    'labour_materials',
    'all_inclusive',
  ]),
  landmark: z.string().optional(),
  pincode: z.string().optional(),
});

type FormValues = z.input<typeof schema>;

const labelCls = 'text-sm font-medium text-slate-700';
const selectCls =
  'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cypress-500 focus:outline-none focus:ring-1 focus:ring-cypress-500 disabled:bg-slate-50 disabled:text-slate-400';

export default function NewPropertyPage() {
  const router = useRouter();
  const { status, hasRole } = useAuth();
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [amenityIds, setAmenityIds] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const allowed = hasRole('owner', 'cypress_admin', 'app_admin');

  useEffect(() => {
    if (status === 'authenticated' && !allowed) router.replace('/properties');
  }, [status, allowed, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      property_type: 'apartment',
      furnishing: 'unfurnished',
      maintenance_coverage: 'owner',
    },
  });

  const cityId = watch('city_id');
  const localityId = watch('locality_id');

  const citiesQ = useQuery({
    queryKey: ['master', 'cities'],
    queryFn: () => api.get<City[]>('/master/cities'),
  });
  const localitiesQ = useQuery({
    queryKey: ['master', 'localities', cityId],
    queryFn: () => api.get<Locality[]>('/master/localities', { query: { city_id: cityId } }),
    enabled: !!cityId,
  });
  const apartmentsQ = useQuery({
    queryKey: ['master', 'apartments', localityId],
    queryFn: () =>
      api.get<Apartment[]>('/master/apartments', { query: { locality_id: localityId } }),
    enabled: !!localityId,
  });
  const plansQ = useQuery({
    queryKey: ['master', 'plans'],
    queryFn: () => api.get<ServicePlan[]>('/master/plans'),
  });
  const amenitiesQ = useQuery({
    queryKey: ['master', 'amenities'],
    queryFn: () => api.get<Amenity[]>('/master/amenities'),
  });

  const cities = citiesQ.data?.data ?? [];
  const localities = localitiesQ.data?.data ?? [];
  const apartments = apartmentsQ.data?.data ?? [];
  const plans = plansQ.data?.data ?? [];
  const amenities = amenitiesQ.data?.data ?? [];

  // Reset dependent selects when the parent geography changes.
  useEffect(() => {
    setValue('locality_id', '');
    setValue('apartment_id', '');
  }, [cityId, setValue]);
  useEffect(() => {
    setValue('apartment_id', '');
  }, [localityId, setValue]);

  const toggleAmenity = (id: string) =>
    setAmenityIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    const payload: CreatePropertyInput = {
      ...values,
      bhk: Number(values.bhk),
      area_sqft: values.area_sqft ? Number(values.area_sqft) : undefined,
      monthly_rent: Number(values.monthly_rent),
      deposit: values.deposit ? Number(values.deposit) : undefined,
      apartment_id: values.apartment_id || undefined,
      latitude: location?.lat,
      longitude: location?.lng,
      google_place_id: location?.placeId,
      address: location?.address,
      amenity_ids: amenityIds.length ? amenityIds : undefined,
    };
    try {
      const res = await api.post<Property>('/properties', payload);
      router.push(`/properties/${res.data?.id ?? ''}`);
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not create the property.');
    }
  };

  const isLoadingMasters = citiesQ.isLoading || plansQ.isLoading;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/properties"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-cypress-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to properties
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Add property</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Location classification */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Location & plan
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>City</label>
              <select className={selectCls} disabled={isLoadingMasters} {...register('city_id')}>
                <option value="">Select city…</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.city_id && <p className="text-xs text-red-600">{errors.city_id.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Locality</label>
              <select className={selectCls} disabled={!cityId} {...register('locality_id')}>
                <option value="">Select locality…</option>
                {localities.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.locality_id && (
                <p className="text-xs text-red-600">{errors.locality_id.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Apartment / Project (optional)</label>
              <select className={selectCls} disabled={!localityId} {...register('apartment_id')}>
                <option value="">None</option>
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Service plan</label>
              <select className={selectCls} {...register('plan_id')}>
                <option value="">Select plan…</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.tier})
                  </option>
                ))}
              </select>
              {errors.plan_id && <p className="text-xs text-red-600">{errors.plan_id.message}</p>}
            </div>
          </div>
        </Card>

        {/* Property details */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Property details
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Flat number" error={errors.flat_no?.message} {...register('flat_no')} />

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Property type</label>
              <select className={selectCls} {...register('property_type')}>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="independent_house">Independent house</option>
              </select>
            </div>

            <Input
              label="BHK"
              type="number"
              min={1}
              error={errors.bhk?.message}
              {...register('bhk')}
            />
            <Input
              label="Area (sq.ft)"
              type="number"
              step="any"
              error={errors.area_sqft?.message}
              {...register('area_sqft')}
            />

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Furnishing</label>
              <select className={selectCls} {...register('furnishing')}>
                <option value="unfurnished">Unfurnished</option>
                <option value="semi">Semi-furnished</option>
                <option value="full">Fully furnished</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Maintenance coverage</label>
              <select className={selectCls} {...register('maintenance_coverage')}>
                <option value="owner">Owner</option>
                <option value="labour_only">Labour only</option>
                <option value="materials_only">Materials only</option>
                <option value="labour_materials">Labour + materials</option>
                <option value="all_inclusive">All inclusive</option>
              </select>
            </div>

            <Input
              label="Monthly rent (₹)"
              type="number"
              step="any"
              error={errors.monthly_rent?.message}
              {...register('monthly_rent')}
            />
            <Input
              label="Deposit (₹)"
              type="number"
              step="any"
              error={errors.deposit?.message}
              {...register('deposit')}
            />
            <Input label="Landmark" error={errors.landmark?.message} {...register('landmark')} />
            <Input label="Pincode" error={errors.pincode?.message} {...register('pincode')} />
          </div>
        </Card>

        {/* Amenities */}
        {amenities.length > 0 && (
          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => {
                const active = amenityIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAmenity(a.id)}
                    className={
                      active
                        ? 'rounded-full border border-cypress-300 bg-cypress-50 px-3 py-1 text-xs font-medium text-cypress-700'
                        : 'rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50'
                    }
                  >
                    {a.name}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Exact location */}
        <Card>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Exact location
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Pin the precise location of this property on the map.
          </p>
          <LocationPicker value={location} onChange={setLocation} />
        </Card>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <div className="flex justify-end gap-3">
          <Link href="/properties">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isSubmitting}>
            Create property
          </Button>
        </div>
      </form>
    </div>
  );
}
