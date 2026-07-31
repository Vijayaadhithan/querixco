import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Cpu,
  Database,
  DatabaseZap,
  Gauge,
  GitBranch,
  Menu,
  LockKeyhole,
  Network,
  RefreshCw,
  Search,
  ServerCog,
  ShieldCheck,
  TimerReset,
  Workflow,
  X,
} from "lucide-react";

import { ApiStatusBadge } from "@/components/ApiStatus";
import { QuerixLogo } from "@/components/QuerixLogo";
import { Reveal } from "@/components/Reveal";

type Guide = "platform" | "integration" | "operations" | "architecture" | "data-pipeline";

const titles: Record<Guide | "overview", string> = {
  overview: "API Documentation",
  platform: "Search API Behavior",
  integration: "Quickstart & API",
  operations: "Reliability & Health",
  architecture: "System Architecture",
  "data-pipeline": "Catalog Data Pipeline",
};

const guideSections: Record<Guide, string[]> = {
  platform: [
    "What Querix does",
    "How requests are handled",
    "When each search path is selected",
    "Freshness and tenant boundaries",
    "What your team integrates",
  ],
  integration: [
    "Base URL and authentication",
    "Readiness and tenant health",
    "Recommended browser integration architecture",
    "Browser request and response contract",
    "Interaction lifecycle: typing, submit, and next page",
    "Generic search contract",
    "Response, pagination, and diagnostics",
    "Client error behavior and launch checks",
    "Usage and protected diagnostics",
  ],
  operations: [
    "Readiness and health contract",
    "The serving data boundary",
    "Tenant configuration and isolation",
    "Index refresh lifecycle",
    "Route-aware assurance",
    "Monitoring and incident response",
    "Service assurance checklist",
  ],
  architecture: [
    "Request flow",
    "Three execution paths",
    "Data boundaries and freshness",
    "Failure behavior and client contract",
  ],
  "data-pipeline": [
    "What the pipeline owns",
    "The staged transformation model",
    "Freshness without exposing internal operations",
    "Incremental change handling",
    "Validation before search",
    "Reliable lifecycle management",
    "What this means for a tenant",
  ],
};

const documentationNav = [
  { label: "Overview", to: "/developers", key: "overview", group: "Get started" },
  {
    label: "Quickstart & API",
    to: "/developers/integration",
    key: "integration",
    group: "Get started",
  },
  {
    label: "Search API behavior",
    to: "/developers/platform",
    key: "platform",
    group: "Core concepts",
  },
  {
    label: "System architecture",
    to: "/developers/architecture",
    key: "architecture",
    group: "Core concepts",
  },
  {
    label: "Catalog data pipeline",
    to: "/developers/data-pipeline",
    key: "data-pipeline",
    group: "Operate",
  },
  {
    label: "Reliability & health",
    to: "/developers/operations",
    key: "operations",
    group: "Operate",
  },
] as const;

const documentationGroups = ["Get started", "Core concepts", "Operate"] as const;

function sectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DeveloperShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: Guide | "overview";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sections = useMemo(() => (active === "overview" ? [] : guideSections[active]), [active]);
  const [activeSection, setActiveSection] = useState(sections[0] ? sectionId(sections[0]) : "");

  useEffect(() => {
    if (sections.length === 0 || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      {
        rootMargin: "-18% 0px -68% 0px",
        threshold: 0,
      },
    );

    const elements = sections
      .map((section) => document.getElementById(sectionId(section)))
      .filter((element): element is HTMLElement => Boolean(element));

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen bg-[#07111f] text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 lg:px-8">
          <a href="/" className="flex items-center gap-2.5" aria-label="Querix AI home">
            <QuerixLogo size={40} className="h-8 w-auto sm:h-10" />
            <span className="hidden border-l border-white/15 pl-3 text-sm text-muted-foreground sm:inline">
              Docs
            </span>
          </a>
          <div className="flex items-center gap-2">
            <div className="hidden xl:block">
              <ApiStatusBadge detailed />
            </div>
            <a
              href="mailto:hello@querix.co?subject=Querix%20AI%20Integration"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-blue px-2.5 text-xs font-medium text-white transition hover:bg-brand-blue/85 sm:px-3.5 sm:text-sm"
            >
              <span className="sm:hidden">API access</span>
              <span className="hidden sm:inline">Request API access</span>
              <ArrowRight className="hidden h-3.5 w-3.5 sm:block" />
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="docs-mobile-navigation"
              aria-label={
                mobileOpen ? "Close documentation navigation" : "Open documentation navigation"
              }
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav id="docs-mobile-navigation" className="border-t border-white/10 px-5 py-4 lg:hidden">
            <div className="mx-auto grid max-w-[1440px] gap-1 sm:grid-cols-2">
              {documentationNav.map(({ label, to, key }) => (
                <a
                  key={to}
                  href={to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm transition ${
                    key === active
                      ? "bg-brand-blue/10 text-[#9ed1ff]"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>
      <div className="border-b border-white/10 bg-[#081522] lg:hidden">
        <nav
          className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 py-2"
          aria-label="Documentation sections"
        >
          {documentationNav.map(({ label, to, key }) => (
            <a
              key={to}
              href={to}
              className={`shrink-0 rounded-md px-3 py-2 text-xs transition ${
                key === active ? "bg-brand-blue/10 text-[#9ed1ff]" : "text-muted-foreground"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[250px_minmax(0,1fr)] 2xl:grid-cols-[250px_minmax(0,1fr)_230px]">
        <aside className="hidden border-r border-white/10 px-6 py-10 lg:block">
          <nav className="sticky top-24 text-sm">
            {documentationGroups.map((group, groupIndex) => (
              <div key={group} className={groupIndex === 0 ? "" : "mt-7"}>
                <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/55">
                  {group}
                </p>
                <div className="space-y-1">
                  {documentationNav
                    .filter((item) => item.group === group)
                    .map(({ label, to, key }) => (
                      <a
                        key={to}
                        href={to}
                        className={`docs-nav-link block rounded-md px-3 py-2 pl-4 transition ${
                          key === active
                            ? "is-active bg-brand-blue/10 text-[#9ed1ff]"
                            : "text-muted-foreground hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {label}
                      </a>
                    ))}
                </div>
              </div>
            ))}
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="px-3">
                <ApiStatusBadge detailed />
              </div>
              <p className="px-3 text-xs leading-5 text-muted-foreground">
                Production contracts and integration guidance for customer engineering teams.
              </p>
              <a
                href="mailto:hello@querix.co?subject=Querix%20AI%20API%20Access"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-brand-blue/25 bg-brand-blue/[0.07] px-3 py-2 text-xs text-[#9ed1ff] transition hover:border-brand-blue/50 hover:text-white"
              >
                Request API access <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </nav>
        </aside>
        <main className="min-w-0 px-5 py-12 sm:px-8 lg:px-12 lg:py-16 xl:px-14">
          {active !== "overview" && (
            <div className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <a href="/developers" className="transition hover:text-white">
                Docs
              </a>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#9ed1ff]">{titles[active]}</span>
            </div>
          )}
          <div className="docs-page-enter">{children}</div>
          <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-white">Need help with your integration?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Talk to us about your catalog and search contract.
              </p>
            </div>
            <a
              href="mailto:hello@querix.co?subject=Querix%20AI%20Integration%20Support"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium text-white transition hover:border-brand-blue/50"
            >
              Contact engineering <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </main>
        {sections.length > 0 && (
          <aside className="hidden border-l border-white/10 px-6 py-10 2xl:block">
            <nav className="sticky top-24">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                On this page
              </p>
              <ol className="mt-4 space-y-3">
                {sections.map((section, index) => (
                  <li key={section}>
                    <a
                      href={`#${sectionId(section)}`}
                      className={`flex gap-2 border-l pl-3 text-xs leading-5 transition ${
                        activeSection === sectionId(section)
                          ? "border-brand-blue text-[#9ed1ff]"
                          : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-[#526b83]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}
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
        body="The customer-visible behavior behind exact catalog filtering, natural-language discovery, secure pagination, and fresh results."
      />
      <Section number="01" title="What Querix does">
        <p>
          Querix handles both explicit catalogue search, such as a product with a location, price,
          and duration constraint, and need-based search where the customer cannot name the right
          product. The API chooses the appropriate search path while preserving tenant rules and
          returning the current approved catalog fields.
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
            text="Intent-aware retrieval for functional language, vocabulary gaps, and ambiguity."
          />
          <Metric
            icon={ShieldCheck}
            title="Tenant-safe by design"
            text="Per-tenant credentials, limits, response fields, state, and storage."
          />
        </div>
      </Section>
      <Section number="02" title="How requests are handled">
        <Flow
          steps={[
            "Authenticate the tenant endpoint",
            "Interpret explicit filters and intent",
            "Choose browse or semantic retrieval",
            "Hydrate current approved catalog rows",
            "Return results, diagnostics, and a next cursor",
          ]}
        />
      </Section>
      <Section number="03" title="When each search path is selected">
        <FieldTable
          rows={[
            [
              "bike",
              "Catalog browse",
              "Uses indexed category values and catalog-safe pagination for broad discovery.",
            ],
            [
              "bike in Chennai under 1000",
              "Exact filter",
              "Enforces the explicit category, location, and price constraints.",
            ],
            [
              "red bike with ABS",
              "Intent-aware search",
              "Combines exact constraints with descriptive meaning before ranking current rows.",
            ],
            [
              "equipment for a distant event",
              "Need-based discovery",
              "Uses inferred categories as ranking hints so useful alternatives remain possible.",
            ],
            [
              "Repeated normalized request",
              "Cached search session",
              "Reuses the ranking session while still fetching current approved catalog rows.",
            ],
          ]}
        />
      </Section>
      <Section number="04" title="Freshness and tenant boundaries">
        <p>
          Search indexes select and order candidate IDs; the tenant's canonical database supplies
          the current public fields before a response is returned. This keeps display data fresh
          while search state, credentials, limits, and pagination remain isolated per tenant.
        </p>
        <Checklist
          items={[
            "Public response fields are allowlisted for each tenant.",
            "Explicit filters are enforced; inferred intent remains a ranking hint.",
            "Query sessions and cursors cannot be reused across tenant endpoints.",
            "Catalog changes that affect retrieval are refreshed through the validated data lifecycle.",
          ]}
        />
      </Section>
      <Section number="05" title="What your team integrates">
        <p>
          Your integration needs a provisioned tenant slug, a server-side API key, one backend proxy
          route, and a small client state model for the active query and next cursor. Querix
          operates the search and index lifecycle behind that contract.
        </p>
        <FieldTable
          rows={[
            [
              "Tenant endpoint",
              "HTTPS API",
              "A company-scoped route protected by an issued API key.",
            ],
            [
              "Backend proxy",
              "Your application",
              "Keeps the tenant key server-side and forwards validated search requests.",
            ],
            [
              "Search session",
              "Query + cursor",
              "Starts with a query and advances with an opaque, short-lived cursor.",
            ],
            [
              "Health checks",
              "Readiness + tenant health",
              "Separates public readiness from authenticated tenant dependency status.",
            ],
          ]}
        />
        <Callout icon={LockKeyhole} title="Credential boundary">
          The tenant API key stays in your server-side secret store. Browser and mobile clients
          receive mapped search results, never the permanent credential.
        </Callout>
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
          Use readiness to confirm that critical serving dependencies are available across the
          configured tenants. Use authenticated tenant health for the index, cache, embedding, and
          runtime detail behind one company search experience.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Endpoint
            icon={Activity}
            method="GET"
            path="/ready"
            title="Public readiness"
            detail="Checks configured tenant indexes, source databases, and the embedding runtime; returns 503 when a critical serving dependency is unavailable."
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
        eyebrow="Service reliability"
        title="Production reliability and assurance"
        body="How Querix keeps tenant search healthy, current, observable, and predictable through dependency or provider failures."
      />
      <Section number="01" title="Readiness and health contract">
        <p>
          Querix exposes two health signals. Public readiness answers whether the shared serving
          path can accept traffic. Authenticated tenant health reports whether one company's index,
          source database, embedding runtime, cache, and search configuration are ready.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Endpoint
            icon={Activity}
            method="GET"
            path="/api/v1/ready"
            title="Public readiness"
            detail="Used by load balancers, uptime checks, and the live status indicator in this documentation."
          />
          <Endpoint
            icon={ShieldCheck}
            method="GET"
            path="/api/v1/{tenant}/health"
            title="Authenticated tenant health"
            detail="Used by customer backends and operators to inspect one tenant's serving dependencies."
          />
        </div>
        <CodeBlock
          label="Public readiness response"
          code={`{
  "status": "ok",
  "tenant_mode": true,
  "configured_companies": 1
}`}
        />
        <Callout icon={Activity} title="How this website checks health">
          The website calls its same-origin <Code>/api/ready</Code> route. That server route probes
          the Querix Search API, applies a four-second timeout, removes internal detail, and returns
          a cache-disabled status payload to the browser.
        </Callout>
      </Section>
      <Section number="02" title="The serving data boundary">
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
      <Section number="03" title="Tenant configuration and isolation">
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
      <Section number="04" title="Index refresh lifecycle">
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
      <Section number="05" title="Route-aware assurance">
        <p>
          Do not treat a warm result-cache hit as representative production throughput. Test
          deterministic filters, unique semantic queries, repeated semantic queries, provider
          fallback paths, mixed filters, compatibility mappings, and planned concurrent load
          independently.
        </p>
        <StatusTable
          rows={[
            ["Readiness", "Critical serving dependencies are available for configured tenants."],
            ["Tenant health", "Index, database, cache, and dependencies are ready."],
            [
              "Contract checks",
              "Authentication, request mapping, pagination, and public fields stay compatible.",
            ],
            [
              "Relevance evaluation",
              "Expected query-routing and ranking regressions are caught before release.",
            ],
          ]}
        />
      </Section>
      <Section number="06" title="Monitoring and incident response">
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
      <Section number="07" title="Service assurance checklist">
        <Checklist
          items={[
            "Confirm readiness and tenant health after every deployment.",
            "Run a deterministic query, a semantic query, and a repeat-query cache check.",
            "Refresh indexes incrementally; reconcile only after a successful full scan.",
            "Rotate exposed credentials, verify backups, and test restore procedures.",
            "Confirm authentication, public fields, and pagination remain compatible after changes.",
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
        eyebrow="Architecture summary"
        title="How a Querix request moves through the platform"
        body="A concise system view for integration, security, and platform reviews—without internal deployment detail."
      />
      <Section number="01" title="Request flow">
        <p>
          Every search enters through a tenant-bound endpoint. Querix validates the request,
          separates explicit constraints from descriptive intent, chooses the appropriate retrieval
          path, fetches current approved catalog rows, and returns a bounded result page.
        </p>
        <Flow
          steps={[
            "Tenant-authenticated request",
            "Intent and constraint validation",
            "Browse or hybrid retrieval",
            "Current-row hydration",
            "Mapped response and next cursor",
          ]}
        />
      </Section>
      <Section number="02" title="Three execution paths">
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric
            icon={Workflow}
            title="Catalog browse"
            text="For broad category discovery and explicit location, duration, price, or availability filters."
          />
          <Metric
            icon={GitBranch}
            title="Intent-aware search"
            text="For descriptive, functional, brand, model, or ambiguous language where meaning improves ranking."
          />
          <Metric
            icon={TimerReset}
            title="Continuation"
            text="For later pages in the same bounded search session using an opaque tenant-bound cursor."
          />
        </div>
      </Section>
      <Section number="03" title="Data boundaries and freshness">
        <p>
          Search-ready data supplies retrieval text and filter metadata. Search indexes identify
          candidate IDs, while the tenant's canonical database supplies the current allowlisted
          fields returned to the client. The API does not expose private source columns or internal
          ranking payloads.
        </p>
        <Checklist
          items={[
            "Explicit request and UI filters override inferred intent.",
            "Inferred categories guide ranking rather than silently excluding alternatives.",
            "Current catalog rows are hydrated before the response is mapped.",
            "Credentials, cursors, cache state, indexes, and response mappings remain tenant-scoped.",
          ]}
        />
      </Section>
      <Section number="04" title="Failure behavior and client contract">
        <p>
          Querix uses bounded fallbacks when an optional planning or ranking provider is
          unavailable. Critical serving failures return an error rather than presenting degraded
          quality as a normal response. Authentication, validation, rate-limit, cursor, and
          temporary-service errors remain explicit HTTP outcomes for clients to handle.
        </p>
        <Checklist
          items={[
            "Use readiness for public traffic checks and tenant health for authenticated dependency detail.",
            "Restart the original query when a cursor expires instead of modifying or decoding it.",
            "Honor Retry-After for rate limits and temporary capacity responses.",
            "Keep the tenant key behind the application's server-side credential boundary.",
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
        <Checklist
          items={[
            "Stable catalog IDs are present and unique, with no cross-tenant rows.",
            "Retrieval text and keyword content are present for every searchable record.",
            "Category, location, and attribute mappings meet the tenant's accepted quality baseline.",
            "Unexpected row-count drops, join regressions, or unusually large source changes stop promotion for review.",
          ]}
        />
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
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#71869d]">
        <span>Querix API · v1 contract</span>
        <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
        <span>Last reviewed July 2026</span>
      </div>
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
    <section id={sectionId(title)} className="mt-16 scroll-mt-28 border-t border-white/10 pt-10">
      <Reveal>
        <p className="font-mono text-xs text-brand-blue">{number}</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-white">{title}</h2>
        <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">{children}</div>
      </Reveal>
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
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-[#050b13]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => void copyCode()}
          className="code-copy-button"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
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
    <ol className="docs-flow mt-6 grid gap-3 md:grid-cols-5">
      {steps.map((step, index) => (
        <li
          key={step}
          className="relative z-10 rounded-lg border border-white/10 bg-[#091522] p-4 text-sm text-muted-foreground transition duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:text-white"
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
