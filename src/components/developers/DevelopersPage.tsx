import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Cpu,
  DatabaseZap,
  KeyRound,
  Network,
  Search,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

import { ApiStatusBadge } from "@/components/ApiStatus";
import { DeveloperShell } from "@/components/developers/DeveloperDocs";
import { Reveal } from "@/components/Reveal";

const guides = [
  {
    icon: BookOpen,
    to: "/developers/integration" as const,
    eyebrow: "Start here · API integration",
    title: "Ship your first tenant-scoped search flow.",
    body: "Authentication, backend proxy patterns, request and response contracts, cursor pagination, errors, and launch checks.",
    featured: true,
  },
  {
    icon: Cpu,
    to: "/developers/platform" as const,
    eyebrow: "Search platform",
    title: "Know what the API handles for you.",
    body: "Structured browse, intent-aware discovery, result freshness, tenant boundaries, and routing behavior.",
  },
  {
    icon: Network,
    to: "/developers/architecture" as const,
    eyebrow: "Architecture summary",
    title: "Review the request flow and trust boundaries.",
    body: "A concise view of routing, data freshness, tenant isolation, and predictable failure behavior.",
  },
  {
    icon: DatabaseZap,
    to: "/developers/data-pipeline" as const,
    eyebrow: "Data lifecycle",
    title: "See how catalog data becomes search-ready.",
    body: "Read-only source refresh, tenant normalization, retrieval content, quality gates, incremental updates, and atomic publishing.",
  },
  {
    icon: ServerCog,
    to: "/developers/operations" as const,
    eyebrow: "Service reliability",
    title: "Plan for health, freshness, and failure.",
    body: "Readiness, tenant health, index refreshes, observable fallback behavior, and production assurance.",
  },
];

const essentials = [
  {
    icon: KeyRound,
    title: "Server-side credentials",
    body: "Every issued key is bound to a tenant endpoint and stays behind your backend boundary.",
  },
  {
    icon: ShieldCheck,
    title: "Isolated by contract",
    body: "Keys, public fields, limits, cursors, cache state, and search storage remain tenant-scoped.",
  },
  {
    icon: Activity,
    title: "Health you can act on",
    body: "Use public readiness for traffic checks and authenticated health for tenant dependencies.",
  },
];

const launchSteps = [
  {
    title: "Provision the tenant contract",
    body: "Agree the tenant slug, public response fields, source mapping, limits, and any compatibility adapter required by an established client.",
  },
  {
    title: "Prepare and publish the catalog",
    body: "Run tenant normalization and validation, then atomically promote a complete retrieval dataset.",
  },
  {
    title: "Integrate through your backend",
    body: "Keep the tenant key server-side and expose only the search behavior your web or mobile client needs.",
  },
  {
    title: "Accept relevance with real demand",
    body: "Exercise exact, semantic, multilingual, zero-result, cursor, fallback, and concurrency cases from representative customer queries.",
  },
  {
    title: "Launch with measurable operations",
    body: "Gate traffic on readiness, monitor authenticated tenant health, and review separate company and internal daily analytics.",
  },
];

const endpoints = [
  {
    method: "POST",
    path: "/{tenant}/search",
    icon: Search,
    title: "Search",
    body: "Start an intent-aware search or continue an existing cursor session.",
  },
  {
    method: "GET",
    path: "/{tenant}/auth/verify",
    icon: KeyRound,
    title: "Verify access",
    body: "Confirm that an issued API key belongs to the requested tenant endpoint.",
  },
  {
    method: "GET",
    path: "/{tenant}/health",
    icon: Activity,
    title: "Tenant health",
    body: "Inspect the search dependencies behind one authenticated company experience.",
  },
  {
    method: "GET",
    path: "/{tenant}/usage",
    icon: BarChart3,
    title: "Usage",
    body: "Retrieve tenant-scoped monthly request accounting for reporting.",
  },
];

export function DevelopersPage() {
  return (
    <DeveloperShell active="overview">
      <section className="grid max-w-6xl gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] xl:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-brand-blue/30 bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-[#9ed1ff]">
            <ShieldCheck className="h-3.5 w-3.5" /> Tenant-scoped Search API
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Add intent-aware search without rebuilding your product around it.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Querix gives product teams one authenticated API for exact filters, broad catalog
            browsing, and natural-language discovery. Start with the integration contract; use the
            platform and data guides when your team needs deeper context.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/developers/integration"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-blue px-4 text-sm font-medium text-white transition hover:bg-brand-blue/85"
            >
              Read the API guide <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:hello@querix.co?subject=Querix%20AI%20API%20Access"
              className="inline-flex h-11 items-center rounded-md border border-white/15 bg-white/[0.035] px-4 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.07]"
            >
              Request API access
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#050b13] shadow-[0_32px_90px_-50px_rgba(30,144,255,0.75)]">
          <div className="scan-line" />
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="font-mono text-[11px] text-muted-foreground">
              First search request
            </span>
            <span className="rounded border border-emerald-300/20 bg-emerald-300/[0.08] px-2 py-1 font-mono text-[10px] text-emerald-200">
              HTTPS · JSON
            </span>
          </div>
          <div className="p-5 font-mono text-[12px] leading-6 sm:p-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Request
              </p>
              <p className="mt-2">
                <span className="text-emerald-300">POST</span>{" "}
                <span className="text-[#b7dcff]">/api/v1/&lt;tenant&gt;/search</span>
              </p>
              <p className="text-muted-foreground">X-API-Key: &lt;server-side-key&gt;</p>
              <pre className="mt-3 whitespace-pre-wrap text-[#d8e6f7]">{`{
  "query": "bike in Chennai under 1000",
  "page_size": 20
}`}</pre>
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Response
                </p>
                <span className="text-[10px] text-emerald-300">200 OK</span>
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-[#d8e6f7]">{`{
  "items": [{ "id": "p_1042", "title": "City Bike" }],
  "interpreted_query": {
    "category": "bicycles",
    "location": "Chennai",
    "max_price": 1000
  },
  "pagination": { "has_more": true, "next_cursor": "..." }
}`}</pre>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center text-[10px] text-muted-foreground">
              <span>public fields</span>
              <span>safe filters</span>
              <span>next cursor</span>
            </div>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mt-12 max-w-6xl rounded-xl border border-white/10 bg-[#081522] p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-brand-blue">
                Canonical API surface
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white">
                A small contract for the complete search lifecycle.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Every company receives a tenant slug and server-side key. Your backend integrates
                the endpoints below; Querix owns retrieval, ranking, cursors, and search operations.
              </p>
            </div>
            <ApiStatusBadge detailed />
          </div>
          <div className="reveal-stagger mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {endpoints.map(({ method, path, icon: Icon, title, body }) => (
              <article
                key={path}
                className="rounded-lg border border-white/10 bg-[#050d16] p-4 transition duration-300 hover:-translate-y-1 hover:border-brand-blue/35"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-brand-blue" />
                  <span className="font-mono text-[10px] text-emerald-200">{method}</span>
                </div>
                <code className="mt-4 block truncate font-mono text-[11px] text-[#9ed1ff]">
                  {path}
                </code>
                <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="reveal-stagger mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
          {essentials.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-blue/30"
            >
              <Icon className="h-5 w-5 text-brand-blue" />
              <h2 className="mt-5 font-display text-base font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-16 max-w-6xl" aria-labelledby="launch-path-heading">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-brand-blue">
              Tenant onboarding
            </p>
            <h2
              id="launch-path-heading"
              className="mt-3 font-display text-3xl font-semibold text-white"
            >
              From provisioned tenant to measured launch.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The integration is small, but a reliable launch also covers catalog quality, relevance
              acceptance, and operational ownership.
            </p>
          </div>
          <ol className="reveal-stagger mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {launchSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-lg border border-white/10 bg-white/[0.025] p-5"
              >
                <span className="font-mono text-xs text-brand-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-16 max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-brand-blue">
              Documentation paths
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-white">
              Start with the contract. Go deeper when you need to.
            </h2>
          </div>
          <div className="reveal-stagger mt-7 grid gap-5 md:grid-cols-2">
            {guides.map(({ icon: Icon, to, eyebrow, title, body, featured }) => (
              <a
                key={to}
                href={to}
                className={`group rounded-lg border p-6 transition hover:border-brand-blue/45 hover:bg-white/[0.05] ${featured ? "border-brand-blue/30 bg-brand-blue/[0.06] md:col-span-2" : "border-white/10 bg-white/[0.025]"}`}
              >
                <div
                  className={
                    featured ? "md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-8" : ""
                  }
                >
                  <div>
                    <Icon className="h-5 w-5 text-brand-blue" />
                    <p className="mt-6 text-xs font-medium uppercase tracking-[0.13em] text-brand-blue">
                      {eyebrow}
                    </p>
                    <h3 className="mt-3 font-display text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{body}</p>
                  </div>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#9ed1ff] group-hover:text-white md:mt-0">
                    Read guide <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-16 max-w-6xl rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-5">
          <h2 className="font-display text-lg font-semibold text-amber-100">
            Your tenant key belongs behind your application.
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-amber-100/70">
            Browser and mobile clients should call your backend proxy. Querix examples use
            placeholders intentionally; issued keys, admin diagnostics, and private data never
            belong in public source or client-visible configuration.
          </p>
        </section>
      </Reveal>
    </DeveloperShell>
  );
}
