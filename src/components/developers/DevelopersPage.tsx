import {
  ArrowRight,
  BookOpen,
  Cpu,
  DatabaseZap,
  Network,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

import { DeveloperShell } from "@/components/developers/DeveloperDocs";

const guides = [
  {
    icon: Cpu,
    to: "/developers/platform" as const,
    eyebrow: "Search platform",
    title: "See the full system at a glance.",
    body: "Capabilities, components, dependencies, ingestion modes, caching, observability, testing, and production limits.",
  },
  {
    icon: BookOpen,
    to: "/developers/integration" as const,
    eyebrow: "Integration guide",
    title: "Build a dependable search experience.",
    body: "Authentication, readiness, search contracts, cursors, errors, usage, and launch checks for product teams.",
  },
  {
    icon: ServerCog,
    to: "/developers/operations" as const,
    eyebrow: "Operations runbook",
    title: "Run search safely in production.",
    body: "Tenant configuration, index refreshes, health checks, observability, capacity planning, and incident response.",
  },
  {
    icon: Network,
    to: "/developers/architecture" as const,
    eyebrow: "Architecture reference",
    title: "Understand how relevance stays reliable.",
    body: "Data boundaries, query routing, hybrid retrieval, reranking, caching, isolation, and scaling decisions.",
  },
  {
    icon: DatabaseZap,
    to: "/developers/data-pipeline" as const,
    eyebrow: "Data pipeline",
    title: "Turn source data into search-ready inventory.",
    body: "Read-only source refresh, staged enrichment, validation, Parquet artifacts, incremental runs, and atomic publishing.",
  },
];

export function DevelopersPage() {
  return (
    <DeveloperShell active="overview">
      <section className="max-w-5xl">
        <div className="inline-flex items-center gap-2 rounded-md border border-brand-blue/30 bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-[#9ed1ff]">
          <ShieldCheck className="h-3.5 w-3.5" /> Private, tenant-scoped search infrastructure
        </div>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Documentation built for the teams that integrate and operate Querix.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
          Everything here is part of the Querix product documentation. Integration teams get a clear
          API contract; platform teams get the operational and architectural context needed to run
          it responsibly.
        </p>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-2">
        {guides.map(({ icon: Icon, to, eyebrow, title, body }) => (
          <a
            key={to}
            href={to}
            className="group rounded-lg border border-white/10 bg-white/[0.025] p-6 transition hover:border-brand-blue/45 hover:bg-white/[0.05]"
          >
            <Icon className="h-5 w-5 text-brand-blue" />
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.13em] text-brand-blue">
              {eyebrow}
            </p>
            <h2 className="mt-3 font-display text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
            <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#9ed1ff] group-hover:text-white">
              Read guide <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        ))}
      </section>

      <section className="mt-16 max-w-5xl rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-5">
        <h2 className="font-display text-lg font-semibold text-amber-100">
          Credentials are never public documentation.
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-100/70">
          Tenant API keys belong in a server-side secret store. The examples use placeholders
          intentionally, and the API access request goes directly to the Querix team.
        </p>
      </section>
    </DeveloperShell>
  );
}
