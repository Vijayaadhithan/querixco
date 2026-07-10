import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  DatabaseZap,
  Gauge,
  GitBranch,
  KeyRound,
  LockKeyhole,
  Network,
  RefreshCw,
  Search,
  ServerCog,
  ShieldCheck,
  TimerReset,
  Workflow,
} from "lucide-react";

import { QuerixLogo } from "@/components/QuerixLogo";

type Guide = "platform" | "integration" | "operations" | "architecture" | "data-pipeline";

const titles: Record<Guide | "overview", string> = {
  overview: "Documentation",
  platform: "Search Platform",
  integration: "Integration Guide",
  operations: "Operations Runbook",
  architecture: "Architecture Reference",
  "data-pipeline": "Data Pipeline",
};

export function DeveloperShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: Guide | "overview";
}) {
  const nav = [
    ["Overview", "/developers", "overview"],
    ["Search platform", "/developers/platform", "platform"],
    ["Integration guide", "/developers/integration", "integration"],
    ["Operations runbook", "/developers/operations", "operations"],
    ["Architecture reference", "/developers/architecture", "architecture"],
    ["Data pipeline", "/developers/data-pipeline", "data-pipeline"],
  ] as const;

  return (
    <div className="min-h-screen bg-[#07111f] text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 lg:px-8">
          <a href="/" className="flex items-center gap-2.5" aria-label="Querix AI home">
            <QuerixLogo size={28} />
            <span className="font-display text-lg font-semibold">
              Querix<span className="gradient-text">AI</span>
            </span>
            <span className="hidden border-l border-white/15 pl-3 text-sm text-muted-foreground sm:inline">
              {titles[active]}
            </span>
          </a>
          <a
            href="mailto:hello@querix.co?subject=Querix%20AI%20Integration"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-brand-blue px-3.5 text-sm font-medium text-white transition hover:bg-brand-blue/85"
          >
            Request API access <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 px-6 py-10 lg:block">
          <nav className="sticky top-24 space-y-1 text-sm">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Querix developers
            </p>
            {nav.map(([label, to, key]) => (
              <a
                key={to}
                href={to}
                className={`block rounded-md px-3 py-2 transition ${key === active ? "bg-brand-blue/10 text-[#9ed1ff]" : "text-muted-foreground hover:bg-white/[0.05] hover:text-white"}`}
              >
                {label}
              </a>
            ))}
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="px-3 text-xs leading-5 text-muted-foreground">
                Private product documentation for approved integration and platform teams.
              </p>
            </div>
          </nav>
        </aside>
        <main className="min-w-0 px-5 py-12 sm:px-8 lg:px-14 lg:py-16">{children}</main>
      </div>
    </div>
  );
}

export function DeveloperDocument({ guide }: { guide: Guide }) {
  return (
    <DeveloperShell active={guide}>
      {guide === "platform" ? (
        <PlatformGuide />
      ) : guide === "integration" ? (
        <IntegrationGuide />
      ) : guide === "operations" ? (
        <OperationsGuide />
      ) : guide === "architecture" ? (
        <ArchitectureGuide />
      ) : (
        <DataPipelineGuide />
      )}
    </DeveloperShell>
  );
}

function PlatformGuide() {
  return (
    <article className="max-w-5xl">
      <Title
        icon={Cpu}
        eyebrow="System overview"
        title="The Querix search platform"
        body="A production-oriented hybrid discovery system for catalogs where both exact constraints and natural-language need matter."
      />
      <Section number="01" title="What Querix does">
        <p>
          Querix handles both explicit catalogue search, such as a product with a location, price,
          and duration constraint, and need-based search where the customer cannot name the right
          product. It combines structured filtering, semantic retrieval, keyword retrieval,
          reranking, canonical database hydration, tenant isolation, and usage accounting.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric
            icon={Search}
            title="Structured browse"
            text="Fast filters and stable pagination for broad catalogue queries."
          />
          <Metric
            icon={Network}
            title="Semantic discovery"
            text="Hybrid retrieval for functional language, vocabulary gaps, and ambiguity."
          />
          <Metric
            icon={ShieldCheck}
            title="Tenant safe"
            text="Per-tenant credentials, limits, response fields, state, and storage."
          />
        </div>
      </Section>
      <Section number="02" title="Core service components">
        <FieldTable
          rows={[
            [
              "API gateway",
              "FastAPI + Uvicorn",
              "Authenticates tenant keys, maps requests, applies limits, and manages pagination.",
            ],
            [
              "Canonical data",
              "MySQL or PostgreSQL",
              "The authoritative source for current public rows in every response.",
            ],
            [
              "Vector retrieval",
              "Chroma or pgvector",
              "Finds semantically related candidate records from retrieval text and metadata.",
            ],
            [
              "Lexical retrieval",
              "SQLite FTS5/BM25",
              "Handles exact terms and structured catalogue filtering.",
            ],
            [
              "Embeddings",
              "Ollama",
              "Generates local normalized query vectors with the configured embedding model.",
            ],
            [
              "Planning and rerank",
              "Hosted providers",
              "Produces schema-constrained plans and orders bounded candidates with fallbacks.",
            ],
            [
              "Shared state",
              "Redis",
              "Stores plan/cache state, rate coordination, and tenant-scoped short-lived sessions.",
            ],
          ]}
        />
      </Section>
      <Section number="03" title="When each route is selected">
        <FieldTable
          rows={[
            [
              "bike",
              "Deterministic browse",
              "No model calls. Uses indexed category/filter values and catalog-safe pagination.",
            ],
            [
              "bike in Chennai under 1000",
              "Deterministic filter",
              "No model calls. Enforces explicit category, location, and price.",
            ],
            [
              "red bike with ABS",
              "Semantic hybrid",
              "Plans, embeds, retrieves in parallel, fuses, reranks, and hydrates current rows.",
            ],
            [
              "equipment for a distant event",
              "Semantic hybrid",
              "Treats inferred category as a soft hint, preserving alternative useful items.",
            ],
            [
              "Repeated normalized request",
              "Result cache",
              "Reuses ordered IDs and plan metadata, then fetches current rows again.",
            ],
          ]}
        />
      </Section>
      <Section number="04" title="Dependencies and first environment check">
        <p>
          A production deployment needs Python, a tenant database, Redis, Ollama with the configured
          embedding model, and credentials for the enabled planning/reranking providers. OpenSearch
          is not a prerequisite; pgvector is needed only when a tenant selects that vector backend.
        </p>
        <CodeBlock
          label="Read-only dependency and source check"
          code={`redis-cli ping
ollama list
.venv/bin/python scripts/doctor.py --company <tenant> --strict
.venv/bin/python src/ingest.py --company <tenant> --mysql --check --limit 10`}
        />
        <Callout icon={LockKeyhole} title="Secret management">
          Keep database, tenant API, provider, and admin keys in a secret manager or a local ignored
          environment file. The frontend and documentation use placeholders only.
        </Callout>
      </Section>
      <Section number="05" title="Search-index ingestion modes">
        <p>
          Search ingestion reads a tenant's validated search-ready data and writes only the isolated
          vector and lexical retrieval indexes. It does not update or delete canonical tenant
          database rows. Content-hash tracking prevents unnecessary embedding work.
        </p>
        <FieldTable
          rows={[
            [
              "--check",
              "Read-only",
              "Validates source tables and columns without changing indexes.",
            ],
            ["Default ingestion", "Incremental", "Upserts new or changed vector and BM25 records."],
            [
              "Reconcile deletions",
              "Full scan",
              "Safely removes index IDs absent from a successful source scan.",
            ],
            [
              "BM25-only",
              "Lexical rebuild",
              "Updates structured/keyword retrieval without embedding calls.",
            ],
            [
              "Force re-embed",
              "Vector refresh",
              "Regenerates vectors even where retrieval content is unchanged.",
            ],
            [
              "Replace source",
              "Index rebuild",
              "Clears and rebuilds tenant retrieval indexes without changing source rows.",
            ],
          ]}
        />
      </Section>
      <Section number="06" title="Caching, diagnostics, and evaluation">
        <p>
          The query-plan cache avoids repeated hosted planning. The result cache stores ordered IDs,
          result tiers, and interpretation metadata rather than whole rows. Because every cache hit
          hydrates current canonical rows, visible titles, photos, and current availability remain
          fresh. Ingestion revision metadata makes stale ranking keys unreachable after a refresh.
        </p>
        <Checklist
          items={[
            "Trace each request through plan, retrieval, rerank, hydration, and completion without raw query text in standard logs.",
            "Run unit/integration tests, labelled query-plan cases, labelled retrieval cases, strict doctor checks, and representative load tests.",
            "Measure deterministic, uncached semantic, cached semantic, and provider-fallback workloads separately.",
            "Keep admin diagnostics protected by a separate admin credential and return only privacy-safe summaries.",
          ]}
        />
      </Section>
      <Section number="07" title="Production boundaries and known limits">
        <p>
          The default deployment is a single API worker with an embedded, tenant-isolated vector
          store. Deep semantic pagination is intentionally bounded; broad catalogue discovery
          belongs on the deterministic browse/filter route. Full index replacement is a controlled
          maintenance operation rather than an atomic generation swap today.
        </p>
        <Checklist
          items={[
            "Keep the embedded vector store single-host until durable shared retrieval is introduced.",
            "Move to shared vector retrieval, durable telemetry, and durable ingestion jobs before adding replicas.",
            "Validate database TLS, backups, restore procedures, provider quotas, and load behavior before raising concurrency.",
            "Confirm tenant-specific visibility and business rules during onboarding rather than assuming one catalogue contract fits every domain.",
          ]}
        />
      </Section>
    </article>
  );
}

function IntegrationGuide() {
  return (
    <article className="max-w-5xl">
      <Title
        icon={BookOpen}
        eyebrow="API reference"
        title="Company API integration"
        body="Use this guide to connect a website, mobile app, or backend to a company-scoped Querix search endpoint."
      />
      <Section number="01" title="Base URL and authentication">
        <p>
          Production APIs are served over HTTPS at <Code>https://api.querix.co/api/v1</Code>. Each
          tenant receives an endpoint slug and issued API key. The generic search endpoint is{" "}
          <Code>POST /api/v1/{"{tenant}"}/search</Code>.
        </p>
        <CodeBlock
          label="Verify endpoint access"
          code={`curl -sS https://api.querix.co/api/v1/<tenant>/auth/verify \\
  -H "X-API-Key: <tenant-api-key>"`}
        />
        <Callout icon={LockKeyhole} title="Credential boundary">
          Do not place a tenant key in browser source, query parameters, or public configuration.
          Route browser calls through your server or another controlled credential boundary.
        </Callout>
        <StatusTable
          rows={[
            ["401", "Missing or invalid API key"],
            ["403", "Key belongs to a different tenant endpoint"],
            ["404", "Unknown or disabled tenant endpoint"],
          ]}
        />
      </Section>
      <Section number="02" title="Readiness and tenant health">
        <p>
          Use readiness to confirm that the API process accepts traffic. Use authenticated tenant
          health to confirm the index, cache, and runtime dependencies behind a company search
          experience.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Endpoint
            icon={Activity}
            method="GET"
            path="/ready"
            title="Public readiness"
            detail="Suitable for a public status indicator and deployment checks."
          />
          <Endpoint
            icon={ServerCog}
            method="GET"
            path="/{tenant}/health"
            title="Tenant health"
            detail="Authenticated operational view, including indexed count and runtime status."
          />
        </div>
      </Section>
      <Section number="03" title="Recommended browser integration architecture">
        <p>
          A browser should call your application backend, not Querix directly. Your backend is the
          credential boundary: it validates the incoming request, adds the tenant API key from
          server secrets, calls Querix, and returns only the intended response to the browser. This
          keeps a permanent tenant credential out of JavaScript bundles, browser storage, logs, and
          network tools available to end users.
        </p>
        <Flow
          steps={[
            "Browser search UI",
            "Your authenticated backend route",
            "Tenant-bound Querix endpoint",
            "Public mapped search response",
          ]}
        />
        <LanguageIntegrationExamples />
        <Callout icon={LockKeyhole} title="Do not use a browser-visible tenant key">
          Do not put <Code>X-API-Key</Code> in React/Vite environment variables, local storage,
          cookies readable by JavaScript, public configuration, query strings, or a mobile bundle.
          The browser receives search results, never the tenant credential.
        </Callout>
      </Section>
      <Section number="04" title="Browser request and response contract">
        <p>
          Keep browser state small and explicit: the original query, current items, next cursor,
          loading state, and a user-safe error message. The cursor belongs to the current query
          only; changing a query, sort, or explicit filter must clear it and start a new session.
        </p>
        <CodeBlock
          label="Typed browser client"
          code={`type SearchItem = { id: string | number; title: string; [field: string]: unknown };
type SearchPage = {
  items: SearchItem[];
  pagination: { has_more: boolean; next_cursor: string | null };
  interpreted_query?: { execution_path?: string };
  timings_ms?: { total?: number };
};

async function searchCatalog(
  input: { query?: string; cursor?: string; pageSize?: number },
  signal?: AbortSignal,
): Promise<SearchPage> {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...(input.query ? { query: input.query } : { cursor: input.cursor }),
      page_size: input.pageSize ?? 20,
    }),
    signal,
  });

  const payload = await response.json();
  if (!response.ok) throw Object.assign(new Error("Search request failed"), { status: response.status, payload });
  return payload as SearchPage;
}`}
        />
      </Section>
      <Section number="05" title="Interaction lifecycle: typing, submit, and next page">
        <p>
          Treat a search result as a session. Start a new session on form submit or after a modest
          debounce if you offer search-as-you-type. Cancel an older request when a newer query
          starts so stale results cannot overwrite the latest screen. Do not fetch the next page
          until the first response has supplied a non-null <Code>next_cursor</Code>.
        </p>
        <CodeBlock
          label="Session-safe UI flow"
          code={`let activeController: AbortController | undefined;
let nextCursor: string | null = null;

async function startSearch(query: string) {
  activeController?.abort();
  activeController = new AbortController();
  nextCursor = null;
  setSearchState({ phase: "loading", query, items: [], error: null });

  try {
    const page = await searchCatalog({ query }, activeController.signal);
    nextCursor = page.pagination.next_cursor;
    setSearchState({ phase: "ready", query, items: page.items, error: null });
  } catch (error) {
    if ((error as Error).name !== "AbortError") handleSearchError(error);
  }
}

async function loadNextPage() {
  if (!nextCursor || searchState.phase === "loading-more") return;
  setSearchState({ ...searchState, phase: "loading-more" });
  const page = await searchCatalog({ cursor: nextCursor });
  nextCursor = page.pagination.next_cursor;
  setSearchState({ ...searchState, phase: "ready", items: [...searchState.items, ...page.items] });
}`}
        />
        <Checklist
          items={[
            "Trim and reject blank input before making a request.",
            "Use a 250-300 ms debounce only for deliberate search-as-you-type behavior; always keep a submit action.",
            "Abort previous in-flight search requests when query text changes.",
            "Disable duplicate next-page requests while a page is loading.",
            "Reset scroll/list state when a new query starts; append only pages that belong to the same cursor session.",
          ]}
        />
      </Section>
      <Section number="06" title="Generic search contract">
        <p>
          Send exactly one of <Code>query</Code> or <Code>cursor</Code>. A query creates a bounded
          result session; a cursor advances the same session without repeating semantic work.
        </p>
        <CodeBlock
          label="First page"
          code={`curl -sS -X POST https://api.querix.co/api/v1/<tenant>/search \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: <tenant-api-key>" \\
  -d '{ "query": "bike in Chennai under 1000", "page_size": 20 }'`}
        />
        <FieldTable
          rows={[
            [
              "query",
              "string",
              "Required on first page; natural-language query, maximum 1000 characters.",
            ],
            ["cursor", "string", "Required for the next page; opaque, tenant-bound, short-lived."],
            ["page_size", "integer", "Optional; defaults to 20 and is limited by server policy."],
          ]}
        />
        <CodeBlock
          label="Next page"
          code={`curl -sS -X POST https://api.querix.co/api/v1/<tenant>/search \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: <tenant-api-key>" \\
  -d '{ "cursor": "<next_cursor>", "page_size": 20 }'`}
        />
      </Section>
      <Section number="07" title="Response, pagination, and diagnostics">
        <p>
          Search responses include public result fields, interpreted intent, safely-applied filters,
          timings, usage accounting, and pagination. Internal embedding content, credentials, raw
          provider payloads, and private database columns are never part of the public response.
        </p>
        <CodeBlock
          label="Response shape"
          code={`{
  "company_id": "<tenant>",
  "items": [{ "id": 235255, "title": "Mountain bike" }],
  "interpreted_query": { "execution_path": "semantic" },
  "applied_filters": { "max_rental_fee": 1000 },
  "timings_ms": { "total": 118.9 },
  "pagination": { "returned": 20, "has_more": true, "next_cursor": "..." }
}`}
        />
        <Callout icon={TimerReset} title="Cursor discipline">
          Never decode, alter, or store a cursor long-term. On an expired cursor, clear pagination
          state and repeat the original query.
        </Callout>
      </Section>
      <Section number="08" title="Client error behavior and launch checks">
        <p>
          A tenant can map its existing request field names to the standard search contract.
          Unexpected fields are rejected, so frontend payloads should match the provisioned contract
          exactly.
        </p>
        <StatusTable
          rows={[
            ["400", "Invalid cursor. Restart with the original query."],
            ["410", "Expired cursor. Clear pagination state and search again."],
            ["422", "Invalid shape, blank query, unsupported field, or invalid page size."],
            ["429", "Rate policy reached. Honor Retry-After and retry with backoff."],
            [
              "503",
              "A runtime dependency is unavailable. Show temporary failure and retry with jitter.",
            ],
          ]}
        />
        <Checklist
          items={[
            "Endpoint slug and API key are provisioned.",
            "Auth verification and tenant health return success.",
            "First page and subsequent-page behavior are tested.",
            "Public fields match the UI, and no key is exposed client-side.",
            "The client handles 401, 403, 410, 422, 429, and 5xx responses.",
            "The browser only calls your backend proxy and never receives a permanent tenant key.",
            "Cancelled or stale requests cannot replace the most recent query results.",
          ]}
        />
      </Section>
      <Section number="09" title="Usage and protected diagnostics">
        <p>
          When usage tracking is enabled, tenants can retrieve month-scoped usage. Operator
          diagnostics use a separate admin credential and deliberately return privacy-safe summaries
          rather than raw query text, result payloads, or secrets.
        </p>
        <CodeBlock
          label="Monthly usage"
          code={`curl -sS 'https://api.querix.co/api/v1/<tenant>/usage?month=YYYY-MM' \\
  -H "X-API-Key: <tenant-api-key>"`}
        />
        <p className="mt-4">
          Interactive OpenAPI documentation can be made available by deployment policy at{" "}
          <Code>/docs</Code>, with the machine-readable schema at <Code>/openapi.json</Code>.
        </p>
      </Section>
    </article>
  );
}

function OperationsGuide() {
  return (
    <article className="max-w-5xl">
      <Title
        icon={ServerCog}
        eyebrow="Platform runbook"
        title="Production search operations"
        body="A practical operating model for configuring, refreshing, monitoring, and troubleshooting tenant-isolated search."
      />
      <Section number="01" title="The serving data boundary">
        <p>
          Indexes discover and rank candidate IDs. The tenant database remains the canonical source
          of the public rows returned to users. This means display-only changes are visible
          immediately while changes that affect retrieval text or filter metadata require an index
          refresh.
        </p>
        <Flow
          steps={[
            "Authenticated tenant request",
            "Query routing and ID cache",
            "Deterministic or hybrid candidate retrieval",
            "Current-row hydration from tenant database",
            "Mapped public response",
          ]}
        />
      </Section>
      <Section number="02" title="Tenant configuration and isolation">
        <p>
          Each tenant owns an endpoint slug, API keys, database connection, vector namespace,
          lexical index, cache namespace, cursor sessions, rate policy, request mapping, response
          allowlist, and usage accounting. Startup validation must reject any unsafe shared identity
          or storage path.
        </p>
        <Checklist
          items={[
            "Use a read-only database user for serving and ingestion.",
            "Keep vector, lexical, cache, and cursor namespaces tenant-scoped.",
            "Use TLS verification for remote databases and secret-manager injection for credentials.",
            "Provision conservative connection pools and per-tenant concurrency limits.",
          ]}
        />
      </Section>
      <Section number="03" title="Index refresh lifecycle">
        <p>
          Ingestion is incremental by content hash: read a bounded source page, prepare retrieval
          text and metadata, update lexical records, embed only changed items, then update vector
          records. Reconciliation removes IDs no longer present after a successful full scan.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric
            icon={RefreshCw}
            title="Incremental"
            text="Upsert new or changed records without unnecessary embedding work."
          />
          <Metric
            icon={Database}
            title="Reconcile"
            text="Remove stale index IDs only after a complete source scan succeeds."
          />
          <Metric
            icon={TimerReset}
            title="Replace source"
            text="Rebuild retrieval indexes without mutating the tenant's canonical data."
          />
        </div>
      </Section>
      <Section number="04" title="Route-aware verification">
        <p>
          Do not treat a warm result-cache hit as representative production throughput. Test
          deterministic filters, unique semantic queries, repeated semantic queries, provider
          fallback paths, mixed filters, compatibility mappings, and planned concurrent load
          independently.
        </p>
        <StatusTable
          rows={[
            ["Readiness", "API process accepts requests."],
            ["Tenant health", "Index, database, cache, and dependencies are ready."],
            ["Strict doctor", "Configuration, index paths, and runtime prerequisites are safe."],
            ["Evaluation", "Expected query-routing and relevance behavior regressions are caught."],
          ]}
        />
      </Section>
      <Section number="05" title="Monitoring and incident response">
        <p>
          One trace should connect request start, cache lookup, planning, vector and lexical
          retrieval, fusion, reranker attempts, canonical row mapping, and completion. Store route,
          provider label, fallback reason, cache state, counts, and timing, while omitting raw query
          text, private fields, and credentials from normal telemetry.
        </p>
        <Callout icon={Gauge} title="Operational signals">
          Monitor tenant database availability, cache connectivity, provider failures, rate limits,
          token usage, disk/RAM, index revision, and p95 latency split by deterministic, semantic,
          and cached routes.
        </Callout>
      </Section>
      <Section number="06" title="Runbook checklist">
        <Checklist
          items={[
            "Confirm readiness and tenant health after every deployment.",
            "Run a deterministic query, a semantic query, and a repeat-query cache check.",
            "Refresh indexes incrementally; reconcile only after a successful full scan.",
            "Rotate exposed credentials, verify backups, and test restore procedures.",
            "Keep one worker for an embedded single-host vector store until durable shared retrieval is introduced.",
          ]}
        />
      </Section>
    </article>
  );
}

function ArchitectureGuide() {
  return (
    <article className="max-w-5xl">
      <Title
        icon={Network}
        eyebrow="Technical reference"
        title="Semantic search architecture"
        body="The decisions that protect relevance, data freshness, tenant boundaries, and predictable failure behavior."
      />
      <Section number="01" title="Design principles">
        <p>
          Querix preserves broad browse/filter behavior instead of forcing every query through a
          semantic top-K. It separates explicit constraints from descriptive meaning, skips model
          work when deterministic rules are enough, hydrates current canonical rows, and keeps every
          tenant's data and runtime state isolated.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric
            icon={Search}
            title="Intent-safe"
            text="Explicit constraints are enforced; inferred categories remain soft ranking hints."
          />
          <Metric
            icon={Database}
            title="Fresh"
            text="Indexes select IDs; canonical source rows are fetched at response time."
          />
          <Metric
            icon={ShieldCheck}
            title="Isolated"
            text="Credentials, indexes, caches, cursors, and mappings are tenant-scoped."
          />
        </div>
      </Section>
      <Section number="02" title="Four data roles">
        <FieldTable
          rows={[
            [
              "Search-ready source",
              "MySQL or PostgreSQL",
              "Preprocessed retrieval text, filter metadata, stable IDs.",
            ],
            ["Vector index", "Chroma or pgvector", "Embeddings and candidate-retrieval metadata."],
            [
              "Lexical/filter index",
              "SQLite FTS5/BM25",
              "Literal relevance, structured browse fields, relationship catalogue.",
            ],
            [
              "Result table",
              "MySQL or PostgreSQL",
              "Canonical public fields returned in the response.",
            ],
          ]}
        />
      </Section>
      <Section number="03" title="Three execution paths">
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric
            icon={Workflow}
            title="Deterministic filter"
            text="For fully understood catalogue queries such as category, location, duration, or budget. No model, embedding, vector retrieval, or reranker."
          />
          <Metric
            icon={GitBranch}
            title="Semantic hybrid"
            text="For functional, descriptive, brand/model, or ambiguous language. Vector and lexical retrieval fuse before reranking."
          />
          <Metric
            icon={TimerReset}
            title="Result cache"
            text="Returns ordered IDs and interpretation metadata, then rehydrates current rows without repeating ranking work."
          />
        </div>
      </Section>
      <Section number="04" title="Query planning and filter safety">
        <p>
          The planner uses a closed JSON schema. A deterministic validator normalizes values,
          resolves only against indexed catalogues, records unresolved values, and rejects silently
          invented filters. Explicit UI filters override query-derived values. The governing rule is
          simple: explicit constraints become hard filters; functional inference remains a soft
          hint.
        </p>
        <CodeBlock
          label="Closed plan shape"
          code={`{
  "semantic_query": "portable equipment for recording a distant event",
  "keyword_query": "portable camera recorder microphone",
  "target_ad_type": "offer",
  "filters": { "city": null, "max_rental_fee": null }
}`}
        />
      </Section>
      <Section number="05" title="Hybrid retrieval and reranking">
        <p>
          Vector retrieval handles paraphrase and functional need. Lexical BM25 retrieval handles
          literal names, IDs, brands, and rare terms. Results are fused by rank, validated against
          current availability/type information, reranked within a bounded window, then hydrated
          from the canonical table.
        </p>
        <Flow
          steps={[
            "Normalize and safely plan",
            "Vector retrieval and BM25 run concurrently",
            "Reciprocal-rank fusion",
            "Current-state validation",
            "Bounded provider reranking",
            "Canonical row hydration and IDs-only cache",
          ]}
        />
      </Section>
      <Section number="06" title="Security, resilience, and scaling">
        <p>
          Request models reject unexpected fields. API keys bind to endpoint slugs. Public response
          mappings are allowlisted. Tenant rate policies, cache keys, cursors, and indexes are
          isolated. When a planner or reranker provider fails, configured fallbacks are attempted; a
          complete ranking failure is observable rather than presented as normal quality.
        </p>
        <Checklist
          items={[
            "Use HTTPS, network restrictions, secret rotation, and read-only database grants.",
            "Do not cache complete rows; cache ordered IDs so visible fields stay current.",
            "Move to a durable shared vector service before adding API replicas.",
            "Use shared cache/rate/cursor state and durable telemetry before horizontal scaling.",
            "Build atomic index generations and durable ingestion jobs as scale requirements grow.",
          ]}
        />
      </Section>
    </article>
  );
}

function DataPipelineGuide() {
  return (
    <article className="max-w-5xl">
      <Title
        icon={DatabaseZap}
        eyebrow="Data lifecycle"
        title="How tenant data becomes search-ready"
        body="A high-level view of the controlled data path that prepares each tenant's catalog before it is indexed for Querix search."
      />
      <Section number="01" title="What the pipeline owns">
        <p>
          The pipeline is deliberately separate from online search. It reads tenant source data,
          applies tenant-specific normalization, produces retrieval text and structured metadata,
          validates the output, and can publish a complete validated dataset to an isolated serving
          destination. Embeddings are generated later by the search ingestion service.
        </p>
        <Flow
          steps={[
            "Read-only source database",
            "Source refresh and local snapshots",
            "Tenant adapter and normalization",
            "Retrieval-content enrichment",
            "Validation and Parquet artifact",
            "Optional atomic publish",
          ]}
        />
        <Callout icon={ShieldCheck} title="Tenant data boundary">
          Source access is read-only. Each tenant's source, processing artifacts, and serving
          destination remain isolated, and validated output is handed to search indexing only after
          the data-quality checks pass.
        </Callout>
      </Section>
      <Section number="02" title="The staged transformation model">
        <p>
          A tenant profile selects the source/destination contracts and adapter. The pipeline builds
          one traceable artifact through ordered stages, so a failure can be resumed at the affected
          stage instead of repeating safe completed work.
        </p>
        <FieldTable
          rows={[
            [
              "Source sync",
              "Snapshot",
              "Reads source tables, compares changes, and maintains a current local input snapshot.",
            ],
            [
              "Canonical catalog",
              "Normalize",
              "Applies tenant adapter rules and produces stable IDs and core catalog records.",
            ],
            [
              "Category, location, attributes",
              "Enrich",
              "Adds structured metadata used by filters and search interpretation.",
            ],
            [
              "Embedding-ready",
              "Compose",
              "Builds normalized retrieval content and filter metadata without generating embeddings.",
            ],
            [
              "Search-ready",
              "Validate",
              "Produces the final Parquet dataset consumed by downstream search ingestion.",
            ],
            [
              "Publish",
              "Promote",
              "Loads a staging table and atomically promotes the validated destination dataset.",
            ],
          ]}
        />
      </Section>
      <Section number="03" title="Freshness without exposing internal operations">
        <p>
          The first successful run creates the baseline required for later change detection. It
          reads the configured source, backs up the previous local snapshot, runs every
          transformation stage, and validates the final artifact. It does not publish to a tenant
          destination unless publishing is explicitly requested.
        </p>
      </Section>
      <Section number="04" title="Incremental change handling">
        <p>
          Subsequent runs compare source snapshots and rebuild only new, changed, dependent, or
          deleted records. No-change runs skip expensive transforms. A missing baseline triggers a
          safe full build; shared category, location, or attribute reference changes also trigger a
          full rebuild because they can affect many records at once.
        </p>
        <Checklist
          items={[
            "New and changed source records are rebuilt.",
            "Deleted records are removed from the next search-ready artifact.",
            "Dependent-record changes rebuild the affected catalog entries.",
            "The full merged final artifact is retained for atomic destination replacement.",
          ]}
        />
      </Section>
      <Section number="05" title="Validation before search">
        <p>
          Validation is a hard gate: a failed validation cannot publish. Successful output is stored
          as a Parquet artifact, which is compact and suitable for production servers. When publish
          is requested, the destination write uses a staging table and atomic promotion rather than
          exposing a partially-loaded serving table.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric
            icon={CheckCircle2}
            title="Validation report"
            text="Confirms final output correctness before any destination write."
          />
          <Metric
            icon={Database}
            title="Search-ready artifact"
            text="The durable Parquet handoff from ETL to downstream retrieval indexing."
          />
          <Metric
            icon={RefreshCw}
            title="Atomic promotion"
            text="Avoids presenting a partially loaded destination table to search consumers."
          />
        </div>
      </Section>
      <Section number="06" title="Reliable lifecycle management">
        <p>
          Refreshes are guarded so one tenant's processing cannot overlap with itself. The operating
          workflow can resume from the last safe stage rather than repeating successful work,
          keeping the data lifecycle reliable without exposing operational controls to client users.
        </p>
        <p>
          Validation failures are isolated from source data and completed transformation stages. The
          pipeline can safely recover from the affected validation point without unnecessarily
          re-reading tenant data or recomputing finished enrichment.
        </p>
      </Section>
      <Section number="07" title="What this means for a tenant">
        <p>
          The data lifecycle produces traceable quality and change records for the Querix operations
          team. Tenant systems retain ownership of their canonical data, while Querix prepares the
          validated search-ready representation required for accurate discovery.
        </p>
        <Checklist
          items={[
            "Tenant source data stays isolated from other tenants.",
            "Normalization creates consistent catalog and filter metadata.",
            "Validation prevents malformed or incomplete data from reaching search.",
            "Only validated search-ready data moves into the retrieval indexing path.",
            "Canonical tenant records remain the source of truth for results returned to users.",
          ]}
        />
      </Section>
    </article>
  );
}

const serverExamples = {
  typescript: {
    label: "TypeScript",
    code: `type SearchInput = { query?: string; cursor?: string; page_size?: number };

export async function POST(request: Request) {
  const input = (await request.json()) as SearchInput;
  const hasQuery = Boolean(input.query?.trim());
  const hasCursor = Boolean(input.cursor);
  if (hasQuery === hasCursor) {
    return Response.json({ error: "Send exactly one of query or cursor." }, { status: 422 });
  }

  const upstream = await fetch("https://api.querix.co/api/v1/<tenant>/search", {
    method: "POST",
    headers: { "content-type": "application/json", "X-API-Key": process.env.QUERIX_TENANT_API_KEY! },
    body: JSON.stringify(hasQuery ? { query: input.query!.trim(), page_size: 20 } : { cursor: input.cursor, page_size: 20 }),
  });
  return new Response(upstream.body, { status: upstream.status, headers: { "content-type": "application/json" } });
}`,
  },
  java: {
    label: "Java (Spring Boot)",
    code: `@RestController
@RequestMapping("/api/search")
public class SearchController {
  private final RestClient client = RestClient.create();
  private final String apiKey;

  public SearchController() {
    this.apiKey = System.getenv("QUERIX_TENANT_API_KEY");
  }

  @PostMapping
  public ResponseEntity<String> search(@RequestBody SearchRequest request) {
    if ((request.query() == null) == (request.cursor() == null)) {
      return ResponseEntity.unprocessableEntity().body("Send exactly one of query or cursor.");
    }
    return client.post()
      .uri("https://api.querix.co/api/v1/<tenant>/search")
      .header("X-API-Key", apiKey)
      .contentType(MediaType.APPLICATION_JSON)
      .body(Map.of("page_size", 20, request.query() != null ? "query" : "cursor", request.query() != null ? request.query().trim() : request.cursor()))
      .retrieve().toEntity(String.class);
  }
}`,
  },
  python: {
    label: "Python (FastAPI)",
    code: `import os
import httpx
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel

app = FastAPI()
class SearchInput(BaseModel):
    query: str | None = None
    cursor: str | None = None
    page_size: int = 20

@app.post("/api/search")
async def search(input: SearchInput):
    if bool(input.query and input.query.strip()) == bool(input.cursor):
        raise HTTPException(422, "Send exactly one of query or cursor.")
    payload = {"page_size": min(max(input.page_size, 1), 20)}
    payload["query" if input.query else "cursor"] = input.query.strip() if input.query else input.cursor
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            "https://api.querix.co/api/v1/<tenant>/search",
            headers={"X-API-Key": os.environ["QUERIX_TENANT_API_KEY"]}, json=payload,
        )
    return Response(content=response.content, status_code=response.status_code, media_type="application/json")`,
  },
  kotlin: {
    label: "Kotlin (Ktor)",
    code: `routing {
  post("/api/search") {
    val input = call.receive<SearchInput>()
    val hasQuery = !input.query.isNullOrBlank()
    val hasCursor = !input.cursor.isNullOrBlank()
    if (hasQuery == hasCursor) {
      call.respond(HttpStatusCode.UnprocessableEntity, mapOf("error" to "Send exactly one of query or cursor."))
      return@post
    }
    val response = httpClient.post("https://api.querix.co/api/v1/<tenant>/search") {
      header("X-API-Key", System.getenv("QUERIX_TENANT_API_KEY"))
      contentType(ContentType.Application.Json)
      setBody(if (hasQuery) mapOf("query" to input.query!!.trim(), "page_size" to 20) else mapOf("cursor" to input.cursor, "page_size" to 20))
    }
    call.respondText(response.bodyAsText(), ContentType.Application.Json, response.status)
  }
}`,
  },
} as const;

function LanguageIntegrationExamples() {
  const [language, setLanguage] = useState<keyof typeof serverExamples>("typescript");
  const example = serverExamples[language];

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Server-side integration example</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose the backend your team uses. Every version keeps the tenant key server-side.
          </p>
        </div>
        <label className="grid gap-1 text-xs text-muted-foreground">
          Language
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as keyof typeof serverExamples)}
            className="h-9 min-w-44 rounded-md border border-white/15 bg-[#0a1625] px-3 text-sm text-white outline-none transition focus:border-brand-blue"
          >
            {Object.entries(serverExamples).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <CodeBlock label={`Server proxy · ${example.label}`} code={example.code} />
    </div>
  );
}

function Title({
  icon: Icon,
  eyebrow,
  title,
  body,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <header>
      <div className="inline-flex items-center gap-2 rounded-md border border-brand-blue/30 bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-[#9ed1ff]">
        <Icon className="h-3.5 w-3.5" /> {eyebrow}
      </div>
      <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{body}</p>
    </header>
  );
}
function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 scroll-mt-28 border-t border-white/10 pt-10">
      <p className="font-mono text-xs text-brand-blue">{number}</p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[12px] text-[#b7dcff]">
      {children}
    </code>
  );
}
function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-[#050b13]">
      <div className="border-b border-white/10 px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
        {label}
      </div>
      <pre className="overflow-x-auto p-4 text-[12px] leading-6 text-[#d8e6f7]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
function Callout({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-4">
      <h3 className="flex items-center gap-2 font-medium text-amber-100">
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-amber-100/70">{children}</p>
    </div>
  );
}
function Endpoint({
  icon: Icon,
  method,
  path,
  title,
  detail,
}: {
  icon: LucideIcon;
  method: string;
  path: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-5">
      <Icon className="h-5 w-5 text-brand-blue" />
      <div className="mt-4 flex gap-2">
        <span className="font-mono text-xs text-emerald-200">{method}</span>
        <Code>{path}</Code>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}
function StatusTable({ rows }: { rows: string[][] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[440px] text-left text-sm">
        <thead className="bg-white/[0.05] text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Meaning and action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map(([status, text]) => (
            <tr key={status}>
              <td className="px-4 py-3 font-mono text-xs text-[#9ed1ff]">{status}</td>
              <td className="px-4 py-3">{text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function FieldTable({ rows }: { rows: string[][] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[580px] text-left text-sm">
        <thead className="bg-white/[0.05] text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Field or role</th>
            <th className="px-4 py-3 font-medium">Type or store</th>
            <th className="px-4 py-3 font-medium">Contract</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map(([a, b, c]) => (
            <tr key={a}>
              <td className="px-4 py-3 font-mono text-xs text-[#9ed1ff]">{a}</td>
              <td className="px-4 py-3">{b}</td>
              <td className="px-4 py-3">{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Metric({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-5">
      <Icon className="h-5 w-5 text-brand-blue" />
      <h3 className="mt-5 font-display text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-6 grid gap-3 md:grid-cols-5">
      {steps.map((step, index) => (
        <li
          key={step}
          className="relative rounded-lg border border-white/10 bg-white/[0.025] p-4 text-sm text-muted-foreground"
        >
          <span className="font-mono text-xs text-brand-blue">0{index + 1}</span>
          <p className="mt-3 leading-5">{step}</p>
        </li>
      ))}
    </ol>
  );
}
function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3 rounded-lg border border-white/10 bg-white/[0.025] p-5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
