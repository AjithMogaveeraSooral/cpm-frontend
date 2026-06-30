'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Star, Video, X } from 'lucide-react';
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
  PropertyMediaPresign,
  ServicePlan,
} from '@/lib/types';

// A media item selected by the user before upload. The previewUrl is an
// in-memory object URL used for the gallery thumbnail.
interface MediaItem {
  id: string;
  file: File;
  previewUrl: string;
  kind: 'image' | 'video';
}

const MAX_MEDIA = 12;
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 100;

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
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
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

  // Revoke object URLs when the component unmounts to avoid memory leaks.
  useEffect(() => {
    return () => {
      media.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setUploadMsg(null);
    const next: MediaItem[] = [];
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        setUploadMsg(`"${file.name}" is not a photo or video and was skipped.`);
        continue;
      }
      const maxMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (file.size > maxMb * 1024 * 1024) {
        setUploadMsg(`"${file.name}" exceeds the ${maxMb}MB limit and was skipped.`);
        continue;
      }
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        kind: isVideo ? 'video' : 'image',
      });
    }
    setMedia((prev) => {
      const merged = [...prev, ...next].slice(0, MAX_MEDIA);
      if (merged.length < prev.length + next.length) {
        setUploadMsg(`You can attach up to ${MAX_MEDIA} files. Extra files were skipped.`);
      }
      // Default the cover to the first image if none chosen yet.
      if (!coverId) {
        const firstImage = merged.find((m) => m.kind === 'image');
        if (firstImage) setCoverId(firstImage.id);
      }
      return merged;
    });
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const remaining = prev.filter((m) => m.id !== id);
      if (coverId === id) {
        const firstImage = remaining.find((m) => m.kind === 'image');
        setCoverId(firstImage ? firstImage.id : null);
      }
      return remaining;
    });
  };

  // uploadMedia reserves a presigned slot per file, then PUTs the bytes
  // directly to S3. Failures for individual files are collected but do not
  // block the rest of the flow.
  const uploadMedia = async (propertyId: string) => {
    const failures: string[] = [];
    for (let i = 0; i < media.length; i++) {
      const m = media[i];
      setUploadMsg(`Uploading media ${i + 1} of ${media.length}…`);
      try {
        const reserve = await api.post<PropertyMediaPresign>(`/properties/${propertyId}/media`, {
          media_type: m.kind,
          filename: m.file.name,
          content_type: m.file.type,
          is_cover: m.id === coverId,
        });
        const uploadUrl = reserve.data?.upload_url;
        if (!uploadUrl) throw new Error('no upload url');
        const put = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': m.file.type },
          body: m.file,
        });
        if (!put.ok) throw new Error(`status ${put.status}`);
      } catch {
        failures.push(m.file.name);
      }
    }
    return failures;
  };

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
      const propertyId = res.data?.id ?? '';
      if (propertyId && media.length) {
        const failures = await uploadMedia(propertyId);
        if (failures.length) {
          setUploadMsg(
            `Property created, but ${failures.length} file(s) failed to upload: ${failures.join(', ')}.`,
          );
        }
      }
      router.push(`/properties/${propertyId}`);
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

        {/* Photos & videos */}
        <Card>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Photos & videos
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Upload up to {MAX_MEDIA} photos and videos. The photo marked with a star is used as the
            cover image.
          </p>

          <label
            htmlFor="property-media"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-cypress-400 hover:bg-cypress-50/40"
          >
            <div className="flex items-center gap-2 text-slate-400">
              <ImagePlus className="h-6 w-6" />
              <Video className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-slate-700">
              Click to add photos or videos
            </span>
            <span className="text-xs text-slate-400">
              JPG, PNG up to {MAX_IMAGE_MB}MB · MP4 up to {MAX_VIDEO_MB}MB
            </span>
            <input
              id="property-media"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>

          {uploadMsg && <p className="mt-3 text-xs text-amber-600">{uploadMsg}</p>}

          {media.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {media.map((m) => (
                <div
                  key={m.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                >
                  {m.kind === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.previewUrl}
                      alt={m.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={m.previewUrl}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  )}

                  {m.kind === 'video' && (
                    <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      <Video className="h-3 w-3" /> Video
                    </span>
                  )}

                  {coverId === m.id && (
                    <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded bg-cypress-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      <Star className="h-3 w-3 fill-current" /> Cover
                    </span>
                  )}

                  <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/50 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
                    {m.kind === 'image' ? (
                      <button
                        type="button"
                        onClick={() => setCoverId(m.id)}
                        className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-white"
                      >
                        Set cover
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(m.id)}
                      aria-label="Remove media"
                      className="rounded-full bg-white/90 p-1 text-slate-700 hover:bg-red-500 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

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
