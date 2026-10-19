# Public marketing — first implementation batch

## Delivered

- Root marketing home and legacy welcome alias use the same server content and root canonical. Neither checks authentication or redirects.
- Navy/teal/white scoped CSS, responsive navigation, native keyboard-accessible disclosures, Escape/outside-click handling, skip link, visible focus, accessible overflow tables, and grouped footer links.
- Public owner overview at `/owner-services`; public pricing, NRI and FAQ subroutes under `/owners/`. Existing application `/owners` and `/tenants` are unchanged.
- Tenant services/FAQs, story, founder, partner process, application description, and configuration-gated contact page.
- Reviewed 5/10/15% GST-inclusive plan schedule, ₹0 onboarding, 2/4/6 visits, shared/dedicated/senior managers, 72/48/24-hour response targets (not completion guarantees), defined maintenance options and exclusions.
- No fabricated testimonials, operating statistics, partner names, office address, hours, contact information, founder portrait or UI screenshots. No new dependencies or analytics collection.
- Per-page titles/descriptions, optional canonical/Open Graph URLs, public sitemap and robots exclusions. Sitemap excludes the duplicate welcome URL, portal entry pages and application directories. Robots are not access control.

## Deployment configuration — business verification required

- `NEXT_PUBLIC_SITE_URL`: actual public origin, optionally including a deployment base path. Unset/invalid/local URLs omit canonicals and yield an empty sitemap; there is no localhost fallback. Set before deployment and rebuild.
- `NEXT_PUBLIC_CONTACT_PHONE`: verified international phone number.
- `NEXT_PUBLIC_CONTACT_EMAIL`: verified support email.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: registered WhatsApp number with country code.
- Missing/invalid contact values are hidden. Inquiry links remain available. WhatsApp uses fixed page-category messages, never personal query parameters or record IDs. Environment configuration validates syntax, not business ownership; an authorized person must verify values.

## Parent integration and intentionally incomplete scope

- `/owner-inquiry`, `/tenant-inquiry` and `/tenants/find-property` are integrated and exercised by isolated browser smoke tests. Public lead persistence, rather than browser-local success, drives inquiry confirmation.
- No edits to explore, public property detail, shared data stores/types, packages or application portal files.
- Login now accepts allowlisted role preselection; `/owner-login` and `/tenant-login` entry pages link to the corresponding portal selection. Authentication still checks actual approved roles.
- Approved founder portrait and supplied final logo/hero artwork remain pending. Text-based Cypress branding retains the existing building motif; no stock portrait or unrelated property photo has been substituted.
- Cross-site property/FAQ search is integrated at `/search`. Production analytics, approved legal policies and comprehensive accessibility auditing remain pending. No invented binding legal policies are published. Approved privacy/terms/cancellation content is a launch gate before accepting payments, deposits or sensitive verification documents.
- Application/service descriptions explicitly qualify release-dependent workflows and selected-plan coverage. They are not certifications that every described digital action is live.

## Validation

- All **10 marketing regression tests passed** using the Node test runner (`node --test src/components/marketing/marketing.test.mjs`). The tests use existing TypeScript only to load TS modules: configuration, canonical/contact gates, contextual WhatsApp, pricing calculations, sitemap/robots, actual route collisions and marketing root behavior. No new dependencies were added.
- Full `npm run typecheck` passes after the portal role-type integration fix.
- Five Chromium browser tests pass against an isolated API fixture, including 390px navigation, listing detail/SEO, inquiry acceptance/failure and unavailable property behavior. These do not constitute a live database/S3 end-to-end test or a full visual/accessibility audit.