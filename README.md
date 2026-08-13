# CPM Web (Next.js)

The Cypress Property Management web console — an admin/owner dashboard built with the
Next.js App Router. It talks to the Go backend through the standard `/api/v1` envelope.

## Stack

- **Next.js 15** (App Router, React 19, standalone / static-export capable)
- **TypeScript** (strict)
- **Tailwind CSS** with the Cypress green palette
- **TanStack Query** for server state + caching
- **Zustand** for auth/session state
- **React Hook Form + Zod** for typed, validated forms
- **Recharts** for dashboard charts, **Framer Motion** for transitions
- **lucide-react** icons

## Getting started

```bash
cp .env.example .env.local        # set API target + Google Maps key
npm install
npm run dev                       # http://localhost:3000
```

The dev server proxies `/api/*` to `API_PROXY_TARGET` (default `http://localhost:8080`)
so the browser, backend, and cookies share an origin.

For GitHub Pages, run `npm run build:pages`. That build targets a static export,
uses the repository subpath as the default `basePath`, and expects
`NEXT_PUBLIC_API_BASE_URL` to point at the deployed backend directly because
GitHub Pages cannot run Next.js rewrites.

## Environment

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Client-side API base path | `/api/v1` |
| `API_PROXY_TARGET` | Backend origin the dev/standalone proxy forwards to | `http://localhost:8080` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Marketplace map rendering | — |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (standalone) |
| `npm run build:pages` | Static export for GitHub Pages (`out/`) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Structure

```
src/
  app/
    layout.tsx            # root layout + providers
    page.tsx             # entry redirect (auth-aware)
    login/               # password + OTP sign-in
    (app)/               # authenticated shell (sidebar + guard)
      dashboard/         # metrics overview
      properties/        # list + detail
      tickets/           # maintenance SLA board
      tenancies/         # tenancy cards
      invoices/          # billing table
  components/
    providers.tsx        # React Query provider
    ui/                  # Button, Input, Card, StatCard
  lib/
    api-client.ts        # envelope-aware fetch + token refresh
    auth-store.ts        # Zustand session store
    token-store.ts       # localStorage token persistence
    types.ts             # shared API types
    utils.ts             # cn, formatINR, formatDate
```

## Auth flow

1. `login/` calls `/auth/login` (password) or `/auth/otp/request` → `/auth/otp/verify`.
2. Tokens are persisted via `token-store` and attached as a bearer header by `api-client`.
3. On a `401`, the client transparently calls `/auth/refresh` once and retries.
4. The `(app)` layout guards routes by hydrating `/auth/me` and redirecting unauthenticated users.
