// Marketplace contracts are intentionally independent of private portal types
// and stores. Never hydrate them from an authenticated property response.
export interface PublicProperty {
  upid: string;
  property_type: string;
  bhk: number;
  area_sqft?: number;
  furnishing: string;
  monthly_rent: number;
  deposit: number;
  occupancy_status: 'vacant';
  city?: string;
  locality?: string;
  apartment_name?: string;
  amenities?: string[];
  cover_image_url?: string;
  media?: { type: 'image' | 'video'; url: string }[];
}

export interface PublicPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface PropertyFilters {
  q: string;
  city: string;
  locality: string;
  bhk: string;
  min_rent: string;
  max_rent: string;
  furnishing: string;
  property_type: string;
  sort: string;
  amenity: string;
}

export class PublicPropertyError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function publicURL(path: string): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  if (typeof window !== 'undefined' || /^https?:\/\//i.test(configured)) {
    return `${configured.replace(/\/$/, '')}/public/properties${path}`;
  }
  // Mirror the deployed Next.js API rewrite, rather than trusting Host headers.
  const origin = process.env.API_PROXY_TARGET || 'https://cpm-backend-1035324904785.asia-south1.run.app';
  return `${origin.replace(/\/$/, '')}${configured}/public/properties${path}`;
}

async function publicRequest<T>(path: string, signal?: AbortSignal) {
  const response = await fetch(publicURL(path), {
    cache: 'no-store', credentials: 'omit', signal,
    headers: { Accept: 'application/json' },
  });
  if (response.status === 404) throw new PublicPropertyError(404, 'This property is no longer available.');
  if (!response.ok) throw new PublicPropertyError(response.status, 'Unable to load properties. Please try again.');
  const envelope = await response.json() as {
    success: boolean; data: T; meta?: { pagination?: PublicPagination };
  };
  if (!envelope.success || !envelope.data) throw new PublicPropertyError(502, 'Invalid property response. Please try again.');
  return { data: envelope.data, pagination: envelope.meta?.pagination };
}

export async function listPublicProperties(filters: PropertyFilters, page: number, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: String(page), page_size: '12' });
  for (const [key, value] of Object.entries(filters)) if (value.trim()) query.set(key, value.trim());
  const result = await publicRequest<PublicProperty[]>(`?${query}`, signal);
  if (!Array.isArray(result.data) || !result.pagination) throw new PublicPropertyError(502, 'Invalid property response. Please try again.');
  return result;
}

export async function getPublicProperty(upid: string) {
  return (await publicRequest<PublicProperty>(`/${encodeURIComponent(upid)}`)).data;
}

export const furnishingLabel = (value: string) => ({ unfurnished: 'Unfurnished', semi: 'Semi-furnished', full: 'Fully furnished' }[value] || value);
export const propertyTypeLabel = (value: string) => ({ apartment: 'Apartment', villa: 'Villa', independent_house: 'Independent house' }[value] || value);
export const propertyTitle = (p: PublicProperty) => p.apartment_name || `${p.bhk} BHK ${propertyTypeLabel(p.property_type)}`;
export const visitURL = (upid: string) => `/tenant-inquiry?upid=${encodeURIComponent(upid)}&intent=visit`;