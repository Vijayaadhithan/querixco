# Querix AI website

Customer-facing product website and developer documentation for Querix AI.

Querix helps e-commerce stores, marketplaces, product catalogs, and listing platforms understand
customer intent and return relevant inventory for vague, incomplete, misspelled, multilingual, or
natural-language searches.

## Product surfaces

- `/` — product story, search experience, platform overview, trust, and demo contact
- `/developers` — developer onboarding and documentation hub
- `/developers/integration` — tenant-scoped API integration contract
- `/developers/platform` — search behavior and routing
- `/developers/architecture` — serving architecture and trust boundaries
- `/developers/data-pipeline` — catalog preparation and publishing lifecycle
- `/developers/operations` — production health and reliability
- `/api/ready` — same-origin server proxy for the public Querix Search API readiness endpoint

Private analytics routes are intentionally excluded from the public navigation and sitemap:

- `/analytics/:company/*` — company-bound analytics portal
- `/internal/analytics/*` — Querix internal analytics portal

## Analytics architecture

Analytics code is grouped by responsibility:

- `src/features/analytics/api` — credentialed API transport and endpoint functions
- `src/features/analytics/auth` — session lifecycle, safe return paths, and cache invalidation
- `src/features/analytics/model` — API and domain types
- `src/features/analytics/lib` — formatting and private-page metadata helpers
- `src/components/analytics/company` — company-only layouts and views
- `src/components/analytics/internal` — internal-only layouts and views
- `src/components/analytics/shared` — deliberately shared presentation components and route guards

The browser never receives an analytics API key. Authentication uses the API's HttpOnly cookie,
and private data is not rendered during server-side rendering.

## Health-check implementation

The website health endpoint is implemented in `src/routes/api/ready.ts`. It calls
`https://api.querix.co/api/v1/ready` from the server with a four-second timeout, maps the upstream
payload to safe frontend fields, disables caching, and returns a controlled `502` or `503` response
when the upstream API is unavailable.

## Service boundary

Querix is delivered as a tenant-scoped hosted API. The search engine, ranking services, and catalog
pipeline are private implementation details; customer integrations use authenticated HTTPS request
and response contracts documented under `/developers/integration`.

## Local development

```bash
npm install
npm run dev
```

The analytics client automatically uses `http://localhost:8010` on localhost and
`https://api.querix.co` elsewhere. Copy `.env.example` to `.env.local` only when a different local
API origin is required. Never place API keys in a `VITE_*` variable because those values are
included in browser bundles.

## Quality checks

```bash
npm run check
```

The check includes TypeScript, ESLint/Prettier, unused file/export/dependency detection, and the
production build. Individual checks are also available through `npm run typecheck`,
`npm run lint`, and `npm run check:dead-code`.

## Production build

```bash
npm run build
```

The site is built with TanStack Start, React, TypeScript, Tailwind CSS, and the Cloudflare Vite
plugin.

## Conversational commerce

`/commerce/login` is the private tester sign-in. `/demo/commerce` shows the signed-in
user's assigned categories. `/commerce/admin` manages users, category grants,
account disabling, password resets and deletion. `/commerce/account` changes a
password and invalidates all existing sessions. Marketing pages stay public.

The Worker keeps its `COMMERCE_API_TOKEN` private and uses it only for login exchange.
Provision this service token with the backend's `portal` scope only. Shopping,
history and admin requests use the user's revocable session token in a secure,
HttpOnly, SameSite cookie. The backend checks ownership and category grants on every
request; signed conversation cookies also bind to a user and storefront. A password
reset/disable revokes sessions. Category changes apply to subsequent requests and
refresh the UI on focus or within 30 seconds. New Chat preserves existing history;
Delete Chat explicitly removes the selected conversation and its replay payloads.

Local development uses private `.dev.vars` bindings: `COMMERCE_API_URL`,
`COMMERCE_API_TOKEN`, and a random `COMMERCE_SESSION_SECRET` of at least 32 characters.
Production uses the existing private Cloudflare bindings. No user password or API
key belongs in a `VITE_*` variable. Bootstrap the initial administrator using the
backend's `scripts/bootstrap_portal.py`; change the temporary password at first login.

Existing sample components remain regression fixtures; the hosted demo entry point
requires login and no longer offers anonymous live access. The historical
`docs/commerce-demo.md` sample walkthrough is not the current access contract.
