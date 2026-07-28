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

## Quality checks

```bash
npm run check
```

## Production build

```bash
npm run build
```

The site is built with TanStack Start, React, TypeScript, Tailwind CSS, and the Cloudflare Vite
plugin.
