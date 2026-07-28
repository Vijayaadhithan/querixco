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

## Related systems

- [Querix semantic search](https://github.com/Vijayaadhithan/querix-semantic-search) — multi-tenant
  hybrid product search API
- [Querix ETL pipeline](https://github.com/Vijayaadhithan/ETL_Pipeline) — validated,
  company-isolated catalog preparation

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
