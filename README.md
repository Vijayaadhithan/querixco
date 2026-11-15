# Querix AI website

Customer-facing product website and developer documentation for Querix AI.

Querix brings together intelligent search and interactive commerce. Search helps stores,
marketplaces, catalogs, and listing platforms match customer intent to relevant inventory.
Interactive commerce maintains shopping requirements across turns and supports refinements
and comparisons of supplied catalog details. The two services have separate access contracts.

## Product surfaces

- `/` — commerce introduction, brief sample walkthrough, product links, integration summary and FAQs
- `/products/search` — intelligent search product page
- `/use-cases/conversational-commerce` — conversational shopping product page and demo boundaries
- `/request-demo` — prepare an email to `hello@querix.co` for Search, Commerce, or Both
- `/developers/commerce` — conversation lifecycle, streaming, access, and current catalog boundaries
- `/developers` — developer onboarding and documentation hub
- `/developers/integration` — tenant-scoped API integration contract
- `/developers/platform` — search behavior and routing
- `/developers/architecture` — serving architecture and trust boundaries
- `/developers/data-pipeline` — catalog preparation and publishing lifecycle
- `/developers/operations` — production health and reliability
- `/api/ready` — same-origin server proxy for the public Querix Search API liveness endpoint

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

## Analytics workflow

Client dashboards separate Overview, Search insights, and Catalog & reports. Internal dashboards
separate Overview, Activity breakdowns, and Performance & usage; request diagnostics open from the
compact history table. Snapshot report selectors retain every existing report group.

Common date/activity controls apply immediately. Advanced filters apply together; active filter
chips can be removed individually. Dashboard sections and filters persist in the URL, so reload
and browser back restore the selection. Query text replaces the current history entry while typing
and is debounced before requesting data. URLs may contain search text and selected dimensions;
they never contain credentials and still require the correct company or internal session.

Metric links use the report's applied timestamps exactly, and retain a workspace-checked return
path. Links are unavailable for combined Browse, provider, or operation selections because the
existing query API cannot represent those filters exactly. Calendar dates selected manually use
local day boundaries, while drill-through timestamps retain their precise instant.

Prior successful results stay visible during refresh/failure with the displayed selection clearly
identified; drill-through and pagination are disabled until that selection is current. Retained
results are scoped to the audience and company. Report generation time and source watermark are
shown separately; snapshot reports explicitly disclose that activity filters do not apply.

## Health-check implementation

The website health endpoint is implemented in `src/routes/api/ready.ts`. It calls
`https://api.querix.co/api/v1/live` from the server with a four-second timeout, maps the upstream
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

## Interactive commerce

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

## Public design system

Public pages use the scoped `qx-*` styles in `src/components/marketing/marketing.css`.
The shared brand component uses the original commerce/login artwork on public, developer and
analytics pages, with light and dark treatments that preserve the logo's geometry. Marketing pages
use the supplied navy/blue palette. Analytics and interactive commerce share the navy/blue palette, including sign-in, dashboard,
query history, category selection, chat, account and admin surfaces. Workspace colour utilities
resolve CSS variables so table, chart, form and status colours follow their scoped theme.
Developer documentation shares that palette across the overview and every guide, including
code examples, tables, sidebar navigation, status badges and mobile controls.
The public homepage leads with Interactive Commerce and a short, two-turn sample shopping preview.
Its blue hero background fades into the page, with no enclosing panel border. Only Intelligent Search
and Interactive Commerce appear as products; the public synthetic analytics dashboard and broad
industry showcase have been removed. Existing authenticated company and internal analytics are unchanged.
The commerce product page starts with skincare and offers the complete discover/refine/compare
walkthrough, with a clothing example available separately. The search page focuses on catalog results
and budget refinement. Previews use sample products and prices without requesting live catalog data.
Playback controls, product details and reduced-motion support remain available. Autoplay advances
only while the preview is visible, the browser tab is active and the opening animation has finished;
opening product details or using journey controls pauses it. The live commerce demo still requires
an approved account and uses historical product metadata.
The demo form supports demo, integration and proof-of-concept intents and prepares a reviewable
email draft; it does not transmit form data or report delivery. Public privacy and website
information are at `/privacy` and `/legal`. The opening icon animation plays once per tab session on public product pages, using the
original artwork and blue signal dots. It fades into the page after 2.4 seconds, supports Escape
and reduced motion, skips private workflows, and fails open if hydration is unavailable. Scroll reveals leave server-rendered content visible until JavaScript enables them. A short catalog/access FAQ supports public enquiries. Evaluation and request steps are consolidated on the demo-request page. Product navigation links directly to search and commerce; mobile navigation and the product dropdown support Escape with focus restoration.
`public/og-discovery.svg` is the editable source for the existing social preview PNG.
