// Owner plan catalogue. Copy is derived from the Cypress Service Developer &
// Legal Blueprint (v3). Prices for the specialised plans are recommended rates
// that are confirmed in the signed service agreement — the UI must label them
// as indicative and never present them as guarantees.

export type PlanSlug =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'rental-care'
  | 'home-guardian'
  | 'land-guardian'
  | 'property-sales';

export type PlanGroupId = 'end-to-end' | 'specialised';

export type PlanTier = { name: string; price: string; cadence: string; detail: string };

export type PlanStep = { title: string; text: string };

export type PlanDetail = {
  slug: PlanSlug;
  group: PlanGroupId;
  name: string;
  shortName: string;
  tagline: string;
  audience: string;
  price: string;
  priceNote: string;
  summary: string;
  image: 'living' | 'villa' | 'loft' | 'rental' | 'home' | 'land' | 'sales';
  highlights: readonly string[];
  included: readonly string[];
  excluded: readonly string[];
  steps: readonly PlanStep[];
  tiers?: readonly PlanTier[];
  notes: readonly string[];
  inquiryPlan?: 'Bronze' | 'Silver' | 'Gold' | 'Cypress Rental Care' | 'Cypress Home Guardian' | 'Cypress Land Guardian' | 'Cypress Property Sales';
};

export const planGroups: readonly { id: PlanGroupId; title: string; eyebrow: string; text: string }[] = [
  {
    id: 'end-to-end',
    eyebrow: 'For owners renting out a home',
    title: 'End-to-End Cypress Property Management Plans',
    text: 'Bronze, Silver and Gold cover the full rental lifecycle — marketing, tenant onboarding, rent tracking, maintenance coordination, inspections, renewals and move-out — priced as a percentage of monthly rent, inclusive of GST, with ₹0 onboarding fees.',
  },
  {
    id: 'specialised',
    eyebrow: 'For every other property situation',
    title: 'Specialised Owner Plans',
    text: 'Already have a tenant, own a vacant home or plot, or want to sell? These focused plans give you Cypress coordination and documentation without a full management mandate.',
  },
];

// What every End-to-End plan includes, regardless of tier.
export const endToEndCommonInclusions = [
  'Owner and tenant access through the Cypress web platform and app',
  'Online property marketing and enquiry handling',
  'Tenant verification, onboarding and replacement coordination',
  'Rent tracking, reminders, receipts and statements',
  'Move-in inventory and documented inspection reports',
  'Maintenance tickets with estimates and owner approvals',
  'Coordination of association, utility and society payments on request',
  'Renewal and move-out coordination',
] as const;

// Work that is outside every End-to-End plan — repairs are coordinated and
// quoted for owner approval, but the cost is never absorbed by Cypress.
export const endToEndExclusions = [
  'Seepage, dampness and waterproofing work',
  'Structural repairs and civil work',
  'Wall, plaster, painting and false-ceiling work',
  'Tiles, flooring and sanitaryware replacement',
  'Damage from misuse, negligence or normal wear and tear beyond the coverage schedule',
  'Appliances — geysers, air conditioners, fans, chimneys and similar equipment',
  'Smart, sensor or automation fittings',
  'Major rewiring, MCB and distribution-board work',
  'Premium or imported fixtures beyond like-for-like standard replacements',
  'Common-area, association and society infrastructure',
  'Pest infestation treatment and damage from acts of nature',
] as const;

// Examples of standard like-for-like replacements covered under the Gold
// All-Inclusive arrangement, subject to the signed coverage schedule.
export const goldIncludedReplacements = [
  'Standard taps, mixers and shower heads',
  'Bulbs, LED panels and tube lights',
  'Hinges, handles, screws and knobs',
  'Washers, seals, Teflon tape and flexible hoses',
  'Switches, sockets and lamp holders',
] as const;

export type ComparisonRow = {
  feature: string;
  bronze: string;
  silver: string;
  gold: string;
  /** Which tiers go beyond the previous one on this row. */
  upgrade?: 'silver' | 'gold' | 'both';
};

// Bronze → Silver → Gold comparison. `upgrade` drives the "what you gain"
// highlighting in the comparison table and the plan detail pages.
export const endToEndComparison: readonly ComparisonRow[] = [
  { feature: 'Management fee (inclusive of GST)', bronze: '5% of monthly rent', silver: '10% of monthly rent', gold: '15% of monthly rent' },
  { feature: 'Onboarding fee', bronze: '₹0', silver: '₹0', gold: '₹0' },
  { feature: 'Property manager', bronze: 'Shared manager', silver: 'Dedicated manager', gold: 'Senior manager', upgrade: 'both' },
  { feature: 'Scheduled inspections per year', bronze: 'Up to 2', silver: 'Up to 4', gold: 'Up to 6', upgrade: 'both' },
  { feature: 'Inspection reports', bronze: 'Photos', silver: 'Photos', gold: 'Photos + video', upgrade: 'gold' },
  { feature: 'Maintenance response target', bronze: 'Within 72 hours', silver: 'Within 48 hours', gold: 'Within 24 hours', upgrade: 'both' },
  { feature: 'Routine repair labour', bronze: 'Owner pays', silver: 'Cypress pays eligible routine labour', gold: 'Cypress pays eligible routine labour', upgrade: 'silver' },
  { feature: 'Standard consumables & like-for-like fittings', bronze: 'Owner pays', silver: 'Owner pays', gold: 'Cypress pays eligible items per coverage schedule', upgrade: 'gold' },
  { feature: 'Repeated issue (same fault, 3rd time onwards)', bronze: 'Owner pays', silver: 'Owner pays', gold: 'Owner pays' },
  { feature: 'Tenant sourcing, verification & onboarding', bronze: 'Included', silver: 'Included', gold: 'Included' },
  { feature: 'Rent tracking, reminders & statements', bronze: 'Included', silver: 'Included', gold: 'Included' },
  { feature: 'Owner & tenant app access', bronze: 'Included', silver: 'Included', gold: 'Included' },
  { feature: 'Priority support', bronze: '—', silver: '—', gold: 'Included', upgrade: 'gold' },
  { feature: 'Hidden coordination fees', bronze: 'None', silver: 'None', gold: 'None' },
];

export const planCatalog: readonly PlanDetail[] = [
  {
    slug: 'bronze',
    group: 'end-to-end',
    name: 'Bronze Plan',
    shortName: 'Bronze',
    tagline: 'Essential Management',
    audience: 'Owners who want the full rental lifecycle handled, with repair costs approved and paid case by case.',
    price: '5%',
    priceNote: 'of monthly rent · inclusive of GST · ₹0 onboarding',
    summary: 'Bronze is the complete, professionally coordinated rental experience. Cypress markets the property, verifies and onboards tenants, tracks rent and coordinates every repair through quotations you approve. Labour and materials are paid by you.',
    image: 'living',
    highlights: ['Shared property manager', 'Up to 2 inspections a year with photo reports', 'Maintenance response target within 72 hours', 'Owner approves and pays repair labour and materials'],
    included: [...endToEndCommonInclusions, 'Up to 2 scheduled inspections a year with photo reports', 'Repair quotations routed for owner approval before work begins'],
    excluded: ['Repair labour and materials — paid by the owner after approval', ...endToEndExclusions],
    steps: [
      { title: 'Register your property', text: 'Share property details and documents; Cypress completes the handover inspection and inventory.' },
      { title: 'Tenant placement', text: 'Online marketing, enquiry screening, verification and owner approval before the agreement is signed.' },
      { title: 'Ongoing coordination', text: 'Rent tracking, maintenance tickets, estimates and approvals — all visible in your owner dashboard.' },
      { title: 'Renewal or move-out', text: 'Inspection against the move-in inventory, deposit coordination and preparation for the next tenancy.' },
    ],
    notes: ['Response targets are service-level targets, not repair-completion guarantees.', 'Rent tracking and reminders are not a rent guarantee.'],
    inquiryPlan: 'Bronze',
  },
  {
    slug: 'silver',
    group: 'end-to-end',
    name: 'Silver Plan',
    shortName: 'Silver',
    tagline: 'Enhanced Property Care',
    audience: 'Owners who want a dedicated manager, more frequent inspections and routine repair labour taken care of.',
    price: '10%',
    priceNote: 'of monthly rent · inclusive of GST · ₹0 onboarding',
    summary: 'Silver adds a dedicated property manager, doubles the inspection schedule and absorbs eligible routine repair labour — so day-to-day fixes stop becoming individual bills. Materials remain owner-paid and are quoted for approval.',
    image: 'loft',
    highlights: ['Dedicated property manager', 'Up to 4 inspections a year with photo reports', 'Maintenance response target within 48 hours', 'Cypress pays eligible routine repair labour'],
    included: [...endToEndCommonInclusions, 'Up to 4 scheduled inspections a year with photo reports', 'Eligible routine repair labour paid by Cypress', 'Materials quoted for owner approval before work begins'],
    excluded: ['Materials, spare parts and fittings — paid by the owner after approval', 'Labour for the same fault beyond the second occurrence', ...endToEndExclusions],
    steps: [
      { title: 'Register your property', text: 'Share property details and documents; your dedicated manager completes the handover inspection and inventory.' },
      { title: 'Tenant placement', text: 'Online marketing, enquiry screening, verification and owner approval before the agreement is signed.' },
      { title: 'Managed maintenance', text: 'Tickets are triaged within the 48-hour target; eligible routine labour is covered, materials are quoted for approval.' },
      { title: 'Renewal or move-out', text: 'Inspection against the move-in inventory, deposit coordination and preparation for the next tenancy.' },
    ],
    notes: ['Labour coverage applies to eligible routine repairs defined in the coverage schedule.', 'A repeated issue for the same fault beyond two occurrences is billed to the owner.', 'Response targets are service-level targets, not repair-completion guarantees.'],
    inquiryPlan: 'Silver',
  },
  {
    slug: 'gold',
    group: 'end-to-end',
    name: 'Gold Plan',
    shortName: 'Gold',
    tagline: 'Comprehensive Management',
    audience: 'Owners — especially those abroad — who want the most hands-off experience with routine labour and standard materials covered.',
    price: '15%',
    priceNote: 'of monthly rent · inclusive of GST · ₹0 onboarding',
    summary: 'Gold is the all-inclusive arrangement for eligible repairs. A senior manager, six inspections a year with photo and video reports, a 24-hour response target, and Cypress pays both routine labour and standard like-for-like materials per the coverage schedule.',
    image: 'villa',
    highlights: ['Senior property manager and priority support', 'Up to 6 inspections a year with photo + video reports', 'Maintenance response target within 24 hours', 'Cypress pays eligible routine labour and standard materials'],
    included: [...endToEndCommonInclusions, 'Up to 6 scheduled inspections a year with photo and video reports', 'Eligible routine repair labour paid by Cypress', 'Standard consumables and like-for-like fittings paid by Cypress per the coverage schedule', 'Priority support'],
    excluded: ['Same fault beyond the second occurrence', ...endToEndExclusions],
    steps: [
      { title: 'Register your property', text: 'Share property details and documents; your senior manager completes the handover inspection and inventory.' },
      { title: 'Tenant placement', text: 'Online marketing, enquiry screening, verification and owner approval before the agreement is signed.' },
      { title: 'All-inclusive maintenance', text: 'Tickets are triaged within the 24-hour target; eligible labour and standard materials are covered without individual approvals.' },
      { title: 'Renewal or move-out', text: 'Inspection against the move-in inventory, deposit coordination and preparation for the next tenancy.' },
    ],
    notes: ['All-Inclusive coverage applies to eligible repairs and standard like-for-like replacements defined in the signed coverage schedule. It is not unlimited repair or equipment replacement coverage.', 'Per-incident and annual coverage limits are specified in the service agreement.', 'Response targets are service-level targets, not repair-completion guarantees.'],
    inquiryPlan: 'Gold',
  },
  {
    slug: 'rental-care',
    group: 'specialised',
    name: 'Cypress Rental Care',
    shortName: 'Rental Care',
    tagline: 'For owners who already have a tenant',
    audience: 'You found the tenant and signed the agreement — Cypress takes over the day-to-day so you stop chasing rent and repairs.',
    price: '₹999',
    priceNote: 'per month · one-time onboarding ₹1,999 · indicative, confirmed in your agreement',
    summary: 'Your existing rental agreement stays exactly as it is. Cypress steps in for rent reminders and tracking, maintenance tickets, quotations and approvals, monthly statements, and renewal or move-out coordination — all documented in your owner dashboard.',
    image: 'rental',
    highlights: ['Existing tenancy and agreement remain unchanged', 'Rent reminders, tracking and statements', 'Maintenance tickets, quotations and approvals', 'Fee pauses while the property is vacant'],
    included: ['Owner and tenant access to the Cypress platform', 'Rent reminders, tracking, receipts and monthly statements', 'Maintenance ticketing with quotations routed for approval', 'Coordination of scheduled inspections on request', 'Renewal and move-out coordination', 'Digital record of agreements, receipts and reports'],
    excluded: ['Tenant sourcing — replacement tenants are available through an End-to-End plan', 'Security deposit holding — the owner continues to hold and settle the deposit', 'Repair labour and materials — paid by the owner after approval', 'Verification of a replacement tenant sourced directly by the owner'],
    steps: [
      { title: 'Share the tenancy', text: 'Upload the existing agreement, rent schedule and tenant contact details.' },
      { title: 'Onboarding visit', text: 'Cypress documents the current condition of the property and introduces the tenant to the platform.' },
      { title: 'Day-to-day handled', text: 'Rent reminders, maintenance tickets and approvals run through the dashboard with a monthly statement.' },
      { title: 'Renewal or move-out', text: 'Cypress coordinates renewal paperwork or the move-out inspection and handover.' },
    ],
    notes: ['A replacement tenant sourced by the owner is not verified by Cypress unless an End-to-End plan is selected.', 'Pricing is indicative and confirmed in the signed service agreement, including applicable GST.'],
    inquiryPlan: 'Cypress Rental Care',
  },
  {
    slug: 'home-guardian',
    group: 'specialised',
    name: 'Cypress Home Guardian',
    shortName: 'Home Guardian',
    tagline: 'For homes that are not currently rented',
    audience: 'Owners who keep a home locked for personal use, future occupation or a later sale, and want it checked and cared for.',
    price: '₹999',
    priceNote: 'per property per month · one-time onboarding ₹1,999 · indicative, confirmed in your agreement',
    summary: 'A vacant home still needs attention. Home Guardian gives you scheduled visits with geotagged photos, checks on doors, windows, leakage, utilities and pests, cleaning coordination, society-notice handling and an emergency contact on the ground.',
    image: 'home',
    highlights: ['Scheduled visits with geotagged photo reports', 'Doors, windows, leakage, utilities and pest checks', 'Cleaning and society-notice coordination', 'Optional utility and property-tax payment support'],
    included: ['Scheduled inspection visits with geotagged photographs', 'Visual checks of doors, windows, locks, leakage and electrical points', 'Utility status checks and meter readings', 'Coordination of cleaning, pest control and minor upkeep with owner approval', 'Collection and forwarding of society and association notices', 'Emergency point of contact for the building management', 'Optional coordination of utility bills and property-tax payments'],
    excluded: ['Security guarding or surveillance — Cypress visits are periodic, not continuous', 'Repair labour and materials — quoted for owner approval', 'Structural, waterproofing and civil work', 'Insurance or liability for loss, theft or damage between visits'],
    steps: [
      { title: 'Register the home', text: 'Share access arrangements, utility accounts and any society contacts.' },
      { title: 'Baseline inspection', text: 'Cypress records the current condition with geotagged photographs and an inventory.' },
      { title: 'Scheduled visits', text: 'Visits run on the agreed frequency with a digital report after each one.' },
      { title: 'Act on findings', text: 'Any issue is raised as a ticket with a quotation; you approve before work begins.' },
    ],
    notes: ['Visit frequency is agreed at onboarding and stated in your service agreement.', 'Home Guardian does not provide a security guarantee.', 'Pricing is indicative and confirmed in the signed service agreement, including applicable GST.'],
    inquiryPlan: 'Cypress Home Guardian',
  },
  {
    slug: 'land-guardian',
    group: 'specialised',
    name: 'Cypress Land Guardian',
    shortName: 'Land Guardian',
    tagline: 'For vacant plots and sites',
    audience: 'Landowners — in Bengaluru or abroad — who want their plot visited, photographed and reported on so risks are flagged early.',
    price: 'From ₹1,499',
    priceNote: 'per year · one-time onboarding ₹1,999 · travel charged per visit · indicative',
    summary: 'Land Guardian gives you a documented presence on your plot. Each visit covers a visual check, geotagged photographs, boundary and fence condition, dumping or vegetation growth and risk flags, delivered as a digital report you can share.',
    image: 'land',
    highlights: ['Half-yearly, quarterly or monthly visit schedules', 'Geotagged photographs and digital reports', 'Boundary, fence, dumping and vegetation checks', 'Early risk flags for encroachment or misuse'],
    included: ['Visual inspection of the plot and its approaches', 'Geotagged photographs from fixed reference points', 'Boundary marker and fence condition check', 'Dumping, debris and vegetation growth assessment', 'Risk flags with recommended next steps', 'Digital visit report in your owner dashboard'],
    excluded: ['Clearing, fencing, levelling or construction work', 'Legal action, title verification or survey services', 'Continuous security or guarding', 'Any guarantee against encroachment or unauthorised use'],
    tiers: [
      { name: 'Half-Yearly', price: '₹1,499', cadence: 'per year', detail: '2 visits a year' },
      { name: 'Quarterly', price: '₹2,799', cadence: 'per year', detail: '4 visits a year' },
      { name: 'Monthly', price: '₹7,999', cadence: 'per year', detail: '12 visits a year' },
    ],
    steps: [
      { title: 'Register the plot', text: 'Share the location, survey details and access notes.' },
      { title: 'Baseline visit', text: 'Cypress records boundary markers and fixed photo reference points.' },
      { title: 'Scheduled visits', text: 'Visits follow your chosen schedule, with travel billed per visit.' },
      { title: 'Review and act', text: 'Each report flags risks; Cypress can coordinate approved follow-up work through partners.' },
    ],
    notes: ['Travel to the plot is charged per visit at the rate stated in your agreement.', 'Land Guardian does not provide an encroachment guarantee.', 'Pricing is indicative and confirmed in the signed service agreement, including applicable GST.'],
    inquiryPlan: 'Cypress Land Guardian',
  },
  {
    slug: 'property-sales',
    group: 'specialised',
    name: 'Cypress Property Sales',
    shortName: 'Property Sales',
    tagline: 'Listing & sale assistance',
    audience: 'Owners who want to sell a flat, house or plot with professional presentation, enquiry handling and coordinated viewings.',
    price: 'Listing from ₹1,999',
    priceNote: 'one-time listing fee · assisted-sale terms confirmed in your agreement · indicative',
    summary: 'Choose a professional Listing on the Cypress platform, or Assisted Sale where Cypress handles enquiries, viewings and coordination through to agreement. Fees are transparent and confirmed before anything is published.',
    image: 'sales',
    highlights: ['Professional listing with photographs and documentation', 'Enquiry screening and coordinated viewings', 'Assisted-sale coordination through to agreement', 'Transparent fees agreed up front'],
    included: ['Property listing on the Cypress platform with photographs and key documents', 'Enquiry capture and screening', 'Coordinated viewings with documented feedback', 'Assisted Sale: negotiation support and coordination with your legal and financial advisors', 'Status updates in your owner dashboard'],
    excluded: ['Legal title verification, registration or stamp-duty services', 'Valuation certificates or guaranteed sale price', 'Any commitment on time to sell'],
    tiers: [
      { name: 'Listing Only', price: '₹1,999 – ₹4,999', cadence: 'one-time', detail: 'Listing, photographs and enquiry forwarding' },
      { name: 'Assisted Sale', price: 'Agreed per mandate', cadence: 'on completion', detail: 'Enquiries, viewings and coordination to agreement' },
    ],
    steps: [
      { title: 'Property review', text: 'Share documents and expectations; Cypress advises on listing readiness.' },
      { title: 'Listing goes live', text: 'Photographs, description and documents are published on the platform.' },
      { title: 'Enquiries & viewings', text: 'Cypress screens enquiries and coordinates viewings with feedback after each one.' },
      { title: 'Agreement', text: 'For Assisted Sale, Cypress coordinates with buyer and advisors through to the agreement.' },
    ],
    notes: ['Assisted-sale fees and any regulatory requirements are confirmed in the signed mandate before Cypress acts on your behalf.', 'Pricing is indicative and confirmed in the signed service agreement, including applicable GST.'],
    inquiryPlan: 'Cypress Property Sales',
  },
];

export function planBySlug(slug: PlanSlug): PlanDetail {
  const plan = planCatalog.find((entry) => entry.slug === slug);
  if (!plan) throw new Error(`Unknown plan: ${slug}`);
  return plan;
}

export function plansInGroup(group: PlanGroupId): PlanDetail[] {
  return planCatalog.filter((plan) => plan.group === group);
}

export function planHref(slug: PlanSlug): string {
  return `/owners/plans/${slug}`;
}

// Extras gained when stepping up a tier — surfaced on the comparison table.
export function tierUpgrades(tier: 'silver' | 'gold'): ComparisonRow[] {
  return endToEndComparison.filter((row) => row.upgrade === tier || row.upgrade === 'both');
}
