export const navigation = [
  { label: 'Owners', links: [
    { label: 'Property Management', href: '/owner-services' },
    { label: 'Plans & Pricing', href: '/owners/plans-pricing' },
    { label: 'NRI Owners', href: '/owners/nri-property-management' },
    { label: 'Owner FAQs', href: '/owners/faqs' },
  ] },
  { label: 'Tenants', links: [
    { label: 'Find a Property', href: '/tenants/find-property' },
    { label: 'Tenant Services', href: '/tenants/services' },
    { label: 'Tenant FAQs', href: '/tenants/faqs' },
  ] },
  { label: 'About Us', links: [
    { label: 'Our Story', href: '/about' },
    { label: 'Why I Started Cypress', href: '/about/founder' },
    { label: 'Our Service Partners', href: '/about/service-partners' },
    { label: 'Our Application', href: '/about/application' },
  ] },
] as const;

export const services = [
  { title: 'Tenant Management', text: 'Property marketing, tenant screening, onboarding and renewals.' },
  { title: 'Rent Management', text: 'Rent tracking, payment records, reminders and statements.' },
  { title: 'Maintenance Coordination', text: 'Service requests, repair estimates, approvals and progress updates.' },
  { title: 'Property Inspections', text: 'Scheduled visits and documented property condition reports.' },
  { title: 'Digital Documentation', text: 'Agreements, inventories, inspection reports and receipts.' },
  { title: 'Connected Platform', text: 'Convenient owner and tenant access to property information, subject to available application features.' },
] as const;

// serviceOfferings are the distinct ways Cypress can help an owner or landlord.
// Each is a separate engagement — pick the one that matches the property's
// situation. "icon" maps to a lucide-react icon in the marketing Services UI.
export type ServiceOffering = { title: string; audience: string; text: string; icon: string; href: string; cta: string };

export const serviceOfferings: ServiceOffering[] = [
  {
    title: 'End-to-End Property Management',
    audience: 'For owners renting out their home',
    text: 'The complete rental lifecycle — onboarding, tenant placement, rent tracking, maintenance coordination, inspections, renewals and move-out — available on our Bronze, Silver and Gold plans.',
    icon: 'Building2',
    href: '/owners/plans-pricing',
    cta: 'Compare Bronze, Silver & Gold',
  },
  {
    title: 'Existing Tenant Management',
    audience: 'For owners who already have a tenant',
    text: 'Already have a tenant but want us to handle the day-to-day? Cypress takes over rent follow-ups, maintenance, inspections and renewals without disturbing your current tenancy.',
    icon: 'Users',
    href: '/owner-inquiry',
    cta: 'Hand Over Coordination',
  },
  {
    title: 'Vacant Home Care',
    audience: 'For homes that are not currently rented',
    text: 'Keep an unoccupied home secure and well-kept with scheduled inspections, cleaning and upkeep coordination, along with documented condition reports.',
    icon: 'House',
    href: '/owner-inquiry',
    cta: 'Protect My Home',
  },
  {
    title: 'Vacant Plot Care',
    audience: 'For landowners',
    text: 'Periodic site inspections, cleaning and encroachment-risk reporting so your plot stays monitored and protected, with photo-documented visit updates.',
    icon: 'Trees',
    href: '/owner-inquiry',
    cta: 'Safeguard My Plot',
  },
  {
    title: 'Property Sales Listing & Assistance',
    audience: 'For owners looking to sell',
    text: 'Want to sell your flat? We help market the property, coordinate enquiries and viewings, and assist you through the sale process.',
    icon: 'Tag',
    href: '/owner-inquiry',
    cta: 'List My Property for Sale',
  },
];

export const plans = [
  { name: 'Bronze', rate: '5%', subtitle: 'Essential Management', manager: 'Shared manager', visits: 'Up to 2', reports: 'Photos', response: '72 hours', coverage: 'Owner-funded', fee: '₹1,500', balance: '₹28,500', description: 'Cypress coordinates repairs and service professionals. Labour, spare parts and materials are paid by the owner.' },
  { name: 'Silver', rate: '10%', subtitle: 'Enhanced Property Care', manager: 'Dedicated manager', visits: 'Up to 4', reports: 'Photos', response: '48 hours', coverage: 'Selectable options', fee: '₹3,000', balance: '₹27,000', description: 'Choose between Labour Only, Materials Only or Labour + Materials Coordination, subject to the selected coverage terms.' },
  { name: 'Gold', rate: '15%', subtitle: 'Comprehensive Management', manager: 'Senior manager', visits: 'Up to 6', reports: 'Photos + video', response: '24 hours', coverage: 'Selectable options, including eligible All-Inclusive', fee: '₹4,500', balance: '₹25,500', description: 'Choose an available maintenance arrangement, including All-Inclusive coverage for eligible repairs, subject to the signed coverage schedule. This is not unlimited repair or equipment replacement coverage.' },
] as const;

export type FAQ = { question: string; answer: string };

export const ownerFaqs: FAQ[] = [
  { question: 'Can I approve a tenant before they move in?', answer: 'Yes. The tenant onboarding process includes owner approval before the tenancy is finalized. Cypress shares relevant tenant details and verification information to help you make an informed decision.' },
  { question: 'What services does Cypress provide?', answer: 'Tenant sourcing and screening, rental documentation, rent tracking, maintenance coordination, property inspections, renewals and move-out assistance. Available services depend on your selected management plan.' },
  { question: 'What are the available service plans?', answer: 'Bronze is 5%, Silver is 10% and Gold is 15% of monthly rent. All management fees include GST, with ₹0 onboarding fees. Inspection frequency, maintenance coverage and response targets vary by plan.' },
  { question: 'Is there an onboarding fee?', answer: 'No. All three plans have ₹0 onboarding fees. Additional charges for services outside your selected plan will be communicated according to the agreed service terms.' },
  { question: 'Do I pay management fees when my property is vacant?', answer: 'Vacancy-period fees, if applicable, depend on your property management agreement. Cypress will explain any applicable charges before you enroll.' },
  { question: 'Can I upgrade or downgrade my plan?', answer: 'You can request a plan change by contacting Cypress. Effective dates, billing adjustments and changes to coverage or benefits are subject to your service agreement.' },
  { question: 'How will maintenance expenses be approved?', answer: 'For non-covered repairs, Cypress shares relevant details and estimated costs for approval before proceeding. Emergency repairs may follow the authorization arrangements in your service agreement. Dashboard requests and approvals depend on available application features.' },
  { question: 'What happens in an emergency?', answer: 'Cypress prioritizes urgent maintenance issues and coordinates appropriate assistance. Emergency authorization procedures, expenditure limits and financial responsibilities are defined in your service agreement. Plan response targets are not repair-completion guarantees.' },
  { question: 'How are security deposits handled?', answer: 'The rental and property management agreements identify who receives and holds the deposit, any authorized Cypress hold, permitted deductions and settlement procedures. Deposit-related terms are communicated before collection.' },
  { question: 'Can I see what happens at my property?', answer: 'The owner dashboard is designed to provide access to rent activity, maintenance updates, inspections and important documents. Availability depends on the application release and your selected plan.' },
  { question: 'What happens when my tenant moves out?', answer: 'The agreed process may include notice and scheduling, inspections, comparison with the move-in inventory, documenting damage or deductions, deposit settlement coordination and preparing for the next tenancy.' },
  { question: 'Does Cypress guarantee monthly rent?', answer: 'No. Standard management plans do not guarantee rent payments or rental income. Cypress supports rent tracking, reminders and collection follow-ups.' },
  { question: 'Can I cancel Cypress services?', answer: 'You may request cancellation in accordance with your management agreement. Notice periods, outstanding charges, handover procedures and termination conditions will be explained before enrollment.' },
  { question: 'How do I raise a complaint or get support?', answer: 'Use the Contact page for official channels and inquiry forms. Existing customers can use property-related service requests in the application where that functionality is available.' },
];

// Answers are derived from the supplied tenant-services and agreement guidance;
// no new deposit, refund, availability or response-time promises are introduced.
export const tenantFaqs: FAQ[] = [
  { question: 'How do I find a rental home?', answer: 'Browse available properties, review the details and submit an inquiry. Property availability, rent and deposit details are subject to confirmation.' },
  { question: 'What if I cannot find a suitable property?', answer: 'Submit a tenant inquiry with your preferred locality, budget and move-in date. Cypress can contact you when a suitable property becomes available.' },
  { question: 'How do I report a maintenance issue?', answer: 'Use service requests in the tenant dashboard where available, or contact Cypress for assistance. Share the issue and relevant photographs so the team can coordinate next steps.' },
  { question: 'Who pays for repairs?', answer: 'Responsibility depends on the rental agreement, the nature of the issue and the property’s management coverage. Raising a request does not mean every repair is included.' },
  { question: 'Where can I find receipts and rental documents?', answer: 'The tenant dashboard provides access to available payment records, rent receipts and tenancy documents, subject to the application release and records available for your tenancy.' },
  { question: 'What happens when I move out?', answer: 'Cypress coordinates the agreed notice, inspection and settlement process. Deposit holdings, permitted deductions and settlement terms are documented in the applicable agreements.' },
];