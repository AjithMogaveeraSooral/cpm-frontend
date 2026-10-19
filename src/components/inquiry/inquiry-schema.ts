import { z } from 'zod';

export type InquiryKind = 'owner' | 'tenant';
export const planOptions = ['Not sure yet', 'Bronze', 'Silver', 'Gold'] as const;
export const bhkOptions = ['Studio', '1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Other / discuss with Cypress'] as const;
export const furnishingOptions = ['Unfurnished', 'Semi-furnished', 'Fully furnished', 'No preference / discuss'] as const;
const singleLine = (label: string, max = 150) => z.string().trim().min(1, `${label} is required.`).max(max).regex(/^[^\x00-\x1f\x7f-\x9f]*$/, `${label} must be a single line.`);

export const upidSchema = z.string().trim().toUpperCase().max(40).refine(
  (value) => !value || /^CPM-[A-Z0-9]{2,4}-[A-Z0-9]{2,8}-[A-Z0-9]{2,12}-[A-Z0-9]{1,12}$/.test(value),
  'Enter a valid Cypress property ID, or clear it for a general enquiry.',
);

export function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const phoneSchema = z.string().trim().max(40).regex(/^\+?[0-9][0-9 ()-]*$/, 'Enter a valid mobile number with its country code if applicable.')
  .transform((value) => value.replace(/[ ()-]/g, ''))
  .refine((value) => {
    const digits = value.replace(/^\+/, '').replace(/^00/, '');
    return digits.length >= 8 && digits.length <= 15;
  }, 'Use 8–15 digits, excluding an international dialling prefix.');

const common = z.object({
  name: singleLine('Full name'),
  phone: phoneSchema,
  locality: singleLine('Locality'),
  bhk: z.enum(bhkOptions),
  furnishing: z.enum(furnishingOptions),
  requirements: z.string().trim().max(2000).regex(/^[^\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]*$/, 'Remove unsupported control characters.'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm Cypress may contact you about this enquiry.' }) }),
});

export const ownerSchema = common.extend({
  email: z.string().trim().email('Enter a valid email address.').max(255),
  propertyName: singleLine('Apartment / property name'),
  propertyType: z.enum(['Apartment', 'Independent house', 'Villa', 'Other']),
  occupancy: z.enum(['Vacant', 'Occupied', 'Available soon', 'Discuss with Cypress']),
  plan: z.enum(planOptions),
});

const budget = z.string().trim().regex(/^\d{1,8}$/, 'Enter a whole rupee amount.').transform(Number).refine((value) => value > 0, 'Budget must be greater than zero.');
export const tenantSchema = common.extend({
  budgetMin: budget,
  budgetMax: budget,
  moveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a move-in date.').refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= localDate();
  }, 'Choose a valid date today or later.'),
  upid: upidSchema,
}).refine((value) => value.budgetMax >= value.budgetMin, { path: ['budgetMax'], message: 'Maximum budget must be at least the minimum budget.' });

export function approvedPlan(value: string | null) {
  return planOptions.find((plan) => plan.toLowerCase() === value?.trim().toLowerCase()) ?? 'Not sure yet';
}

export function inquiryPayload(kind: InquiryKind, values: Record<string, unknown>, visit: boolean) {
  const data = kind === 'owner' ? ownerSchema.parse(values) : tenantSchema.parse(values);
  const lines = [kind === 'owner' ? '[Property Owner Interest]' : '[Tenant Rental Requirement]', `Locality: ${data.locality}`, `BHK: ${data.bhk}`, `Furnishing: ${data.furnishing}`];
  if ('propertyName' in data) {
    lines.push(`Property name: ${data.propertyName}`, `Property type: ${data.propertyType}`, `Occupancy: ${data.occupancy}`, `Preferred plan: ${data.plan}`);
  } else {
    lines.push(`Monthly budget (INR): ${data.budgetMin}–${data.budgetMax}`, `Expected move-in: ${data.moveDate}`);
  }
  lines.push(`Additional requirements: ${data.requirements || 'None specified'}`, 'Contact consent: confirmed for this enquiry');
  return {
    type: kind === 'tenant' && visit ? 'visit' as const : 'enquiry' as const,
    name: data.name,
    phone: data.phone,
    ...('email' in data ? { email: data.email } : {}),
    ...('upid' in data && data.upid ? { property_upid: data.upid } : {}),
    message: lines.join('\n'),
  };
}