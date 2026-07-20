import { QuerixLogo } from "@/components/QuerixLogo";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Brain,
  Briefcase,
  Car,
  CheckCircle2,
  Compass,
  Cpu,
  Database,
  Gauge,
  Home,
  Languages,
  Layers,
  Mail,
  Megaphone,
  Mic,
  Newspaper,
  PackageSearch,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";

const capabilities = [
  {
    icon: Search,
    title: "Semantic search",
    desc: "Retrieve by meaning, not brittle keyword overlap.",
  },
  {
    icon: Brain,
    title: "Intent parsing",
    desc: "Extract filters, goals, synonyms, and hidden constraints from messy queries.",
  },
  {
    icon: Sparkles,
    title: "Smart discovery",
    desc: "Promote relevant inventory before users know exactly what to type.",
  },
  {
    icon: Compass,
    title: "Adaptive ranking",
    desc: "Blend semantic relevance, business rules, freshness, and availability.",
  },
  {
    icon: ShieldCheck,
    title: "Zero-result recovery",
    desc: "Rewrite, broaden, and explain fallbacks before a search dead-ends.",
  },
  {
    icon: Layers,
    title: "Hybrid retrieval",
    desc: "Fuse vector search, structured filters, lexical signals, and reranking.",
  },
  {
    icon: Mic,
    title: "Conversational search",
    desc: "Handle voice-like questions, fragments, typos, and follow-up intent.",
  },
  {
    icon: Languages,
    title: "Multilingual signals",
    desc: "Support regional vocabulary, mixed-language prompts, and synonym expansion.",
  },
];

const industries = [
  { icon: ShoppingBag, label: "E-commerce stores" },
  { icon: Store, label: "Online marketplaces" },
  { icon: Megaphone, label: "Advertisement platforms" },
  { icon: Newspaper, label: "Classifieds and listings" },
  { icon: PackageSearch, label: "Product catalogs" },
  { icon: Briefcase, label: "B2B commerce" },
  { icon: Car, label: "Automotive listings" },
  { icon: Home, label: "Property listings" },
];

const stack = [
  "Embeddings",
  "Hybrid search",
  "Vector stores",
  "Rerankers",
  "Query planning",
  "FastAPI",
  "Observability",
  "Tenant isolation",
];

const demoQueries = [
  {
    query: "comfortable office chair for long workdays under 15000",
    intent: "Ergonomic home-office upgrade",
    filters: ["category: office chair", "price: <= 15000", "use: long workdays"],
    rewrite: "ergonomic office chairs with strong back support for extended daily use under 15000",
    results: [
      {
        label: "Ergonomic mesh chair with lumbar support",
        score: 96,
        reason: "comfort + support + price",
      },
      { label: "Adjustable high-back office chair", score: 91, reason: "long-use fit + budget" },
      { label: "Breathable work chair with headrest", score: 86, reason: "ergonomic alternative" },
    ],
  },
  {
    query: "laptop for editing reels under 80000",
    intent: "Creator workstation",
    filters: ["price: <= 80000", "use: video editing", "category: laptop"],
    rewrite: "creator laptops with strong CPU/GPU for short-form video editing under 80000",
    results: [
      { label: "RTX creator laptop 16GB RAM", score: 95, reason: "GPU + RAM + price" },
      { label: "OLED ultrabook with H-series CPU", score: 89, reason: "display + CPU" },
      { label: "Gaming laptop for Premiere workflows", score: 86, reason: "performance match" },
    ],
  },
  {
    query: "used automatic hatchback in Chennai under 6 lakh",
    intent: "City-friendly used car",
    filters: ["condition: used", "transmission: automatic", "city: Chennai", "price: <= 600000"],
    rewrite: "used automatic hatchback listings in Chennai priced below 6 lakh",
    results: [
      {
        label: "2021 automatic hatchback · single owner",
        score: 97,
        reason: "type + city + budget",
      },
      {
        label: "2020 compact automatic · low mileage",
        score: 92,
        reason: "condition + transmission",
      },
      { label: "2019 city hatchback · automatic", score: 86, reason: "broadened model match" },
    ],
  },
];

const pipeline = [
  {
    icon: Brain,
    title: "Understand",
    body: "Parse intent, entities, filters, typos, and ambiguity before retrieval starts.",
  },
  {
    icon: Database,
    title: "Retrieve",
    body: "Combine semantic candidates with structured filters and catalog-safe browse paths.",
  },
  {
    icon: Workflow,
    title: "Rerank",
    body: "Apply context, freshness, availability, tenant rules, and business priorities.",
  },
  {
    icon: Activity,
    title: "Explain",
    body: "Expose diagnostics, fallback reasons, and measurable quality signals for teams.",
  },
];

const proof = [
  { value: "API", label: "Tenant-scoped integration" },
  { value: "Hybrid", label: "Semantic + lexical retrieval" },
  { value: "Cursor", label: "Stable search pagination" },
  { value: "Live", label: "Public readiness status" },
];

type ApiHealth = {
  status: string;
  tenantMode: boolean;
  configuredCompanies: number;
  latencyMs: number;
  checkedAt: string;
};

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden text-foreground">
      <Nav />
      <Hero />
      <ProofStrip />
      <ApiStatus />
      <LiveDemo />
      <Problem />
      <Capabilities />
      <Pipeline />
      <Industries />
      <TechStack />
      <VisionMission />
      <Contact />
      <Footer />
    </div>
  );
}

function ApiStatus() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [state, setState] = useState<"loading" | "online" | "offline">("loading");

  useEffect(() => {
    let cancelled = false;

    async function checkApi() {
      try {
        const response = await fetch("/api/ready", { cache: "no-store" });
        if (!response.ok) throw new Error(`API status returned ${response.status}`);
        const data = (await response.json()) as ApiHealth;
        if (cancelled) return;
        setHealth(data);
        setState(data.status === "ok" ? "online" : "offline");
      } catch {
        if (cancelled) return;
        setState("offline");
      }
    }

    void checkApi();
    const interval = window.setInterval(checkApi, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const isOnline = state === "online";
  const statusLabel =
    state === "loading"
      ? "Checking live endpoint"
      : isOnline
        ? "API is live"
        : "Status check failed";
  const latency = health?.latencyMs ?? 0;
  const latencyLabel = health
    ? latency < 250
      ? "Fast edge response"
      : latency < 750
        ? "Healthy response"
        : "Elevated response"
    : "Awaiting probe";
  const latencyWidth = health ? `${Math.min(100, Math.max(10, latency / 8))}%` : "12%";
  const lastChecked = health
    ? new Date(health.checkedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  return (
    <section id="status" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#081827] shadow-[0_32px_100px_-52px_oklch(0.68_0.18_250/0.9)]">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue to-transparent" />
          <div className="relative grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-6 sm:p-9 lg:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-blue/30 bg-brand-blue/10">
                    <Server className="h-5 w-5 text-brand-blue" />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-blue">
                      Live infrastructure signal
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Public readiness probe · refreshes every 60 seconds
                    </div>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${isOnline ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : state === "loading" ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-red-400/30 bg-red-400/10 text-red-200"}`}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`absolute inline-flex h-full w-full rounded-full ${isOnline ? "bg-emerald-400 animate-ping" : ""}`}
                    />
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${isOnline ? "bg-emerald-400" : state === "loading" ? "bg-amber-300" : "bg-red-400"}`}
                    />
                  </span>
                  {statusLabel}
                </div>
              </div>

              <div className="mt-10">
                <p className="text-sm font-medium text-muted-foreground">
                  Production control plane
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold leading-none text-white sm:text-5xl">
                  {isOnline
                    ? "All systems nominal."
                    : state === "loading"
                      ? "Verifying the edge."
                      : "Availability needs attention."}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                  A live readiness signal from the Querix API gateway. Search requests stay
                  tenant-scoped and authenticated beyond this public boundary.
                </p>
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                <StatusMetric
                  label="Gateway"
                  value={health?.status === "ok" ? "OK" : (health?.status ?? "Checking")}
                  detail="Readiness response"
                  accent={isOnline ? "emerald" : "blue"}
                />
                <StatusMetric
                  label="Isolation"
                  value={health?.tenantMode ? "Active" : "--"}
                  detail="Tenant mode"
                  accent="blue"
                />
                <StatusMetric
                  label="Tenants"
                  value={health ? String(health.configuredCompanies) : "--"}
                  detail="Configured now"
                  accent="purple"
                />
              </div>

              <div className="mt-7 rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Edge probe latency
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold text-white">
                      {health ? `${latency} ms` : "-- ms"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{latencyLabel}</span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${latency < 250 ? "bg-emerald-400" : latency < 750 ? "bg-brand-blue" : "bg-amber-300"}`}
                    style={{ width: latencyWidth }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                  <span>Probe start</span>
                  <span>Last verified {lastChecked}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-[#050d17]/75 p-5 backdrop-blur-xl lg:border-t-0 lg:border-l lg:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <Terminal className="h-4 w-4 text-brand-blue" /> Live probe transcript
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">GET /ready</span>
              </div>
              <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-xs leading-6 text-[#cfe2f8]">
                <div className="text-muted-foreground">$ curl -sS api.querix.co/api/v1/ready</div>
                <div className="mt-3 text-brand-blue">&#123;</div>
                <div className="pl-4">
                  "status":{" "}
                  <span className={isOnline ? "text-emerald-300" : "text-amber-200"}>
                    "{health?.status ?? "checking"}"
                  </span>
                  ,
                </div>
                <div className="pl-4">
                  "tenant_mode":{" "}
                  <span className="text-violet-300">{String(health?.tenantMode ?? false)}</span>,
                </div>
                <div className="pl-4">
                  "configured_companies":{" "}
                  <span className="text-amber-200">{health?.configuredCompanies ?? 0}</span>
                </div>
                <div className="text-brand-blue">&#125;</div>
              </div>
              <div className="mt-5 space-y-3">
                <ProbeStep
                  label="Gateway accepted request"
                  value={health?.status === "ok" ? "Verified" : "Pending"}
                  complete={health?.status === "ok"}
                />
                <ProbeStep
                  label="Tenant boundary reported"
                  value={health?.tenantMode ? "Enabled" : "Pending"}
                  complete={Boolean(health?.tenantMode)}
                />
                <ProbeStep label="Next automatic probe" value="In under 60 seconds" complete />
              </div>
              <div className="mt-6 rounded-lg border border-brand-blue/20 bg-brand-blue/[0.06] p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-[#9ed1ff]">
                  <ShieldCheck className="h-4 w-4" /> Search API contract
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Tenant search calls require a tenant-bound key. Public status exposes only safe
                  readiness information.
                </p>
                <a
                  href="/developers/integration"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#9ed1ff] transition hover:text-white"
                >
                  Read integration guide <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusMetric({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent: "emerald" | "blue" | "purple";
}) {
  const accentStyles = {
    emerald: "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-200",
    blue: "border-brand-blue/20 bg-brand-blue/[0.05] text-[#9ed1ff]",
    purple: "border-violet-400/20 bg-violet-400/[0.05] text-violet-200",
  };
  return (
    <div className={`rounded-lg border p-4 ${accentStyles[accent]}`}>
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-70">{label}</div>
      <div className="mt-2 font-display text-xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{detail}</div>
    </div>
  );
}

function ProbeStep({
  label,
  value,
  complete,
}: {
  label: string;
  value: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={`h-1.5 w-1.5 rounded-full ${complete ? "bg-emerald-400" : "bg-amber-300"}`}
        />
        {label}
      </div>
      <span className={`font-mono text-[10px] ${complete ? "text-emerald-300" : "text-amber-200"}`}>
        {value}
      </span>
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="glass-card flex items-center justify-between rounded-full px-4 py-2.5">
          <a href="#top" className="flex items-center" aria-label="Querix AI home">
            <QuerixLogo size={42} className="h-8 w-auto sm:h-[42px]" />
          </a>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#demo" className="hover:text-foreground transition">
              Demo
            </a>
            <a href="#capabilities" className="hover:text-foreground transition">
              Capabilities
            </a>
            <a href="#pipeline" className="hover:text-foreground transition">
              Pipeline
            </a>
            <a href="#industries" className="hover:text-foreground transition">
              Industries
            </a>
            <a href="/developers" className="hover:text-foreground transition">
              Developers
            </a>
          </nav>
          <a
            href="#contact"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
          >
            Request Demo <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue/60 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75"
              style={{ animation: "pulse-ring 1.8s ease-out infinite" }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-blue" />
          </span>
          Intent-aware search API for commerce and listings
        </div>

        <h1
          className="animate-fade-up mx-auto mt-8 max-w-5xl font-display text-5xl font-semibold leading-none sm:text-6xl md:text-7xl lg:text-[88px]"
          style={{ animationDelay: "0.08s" }}
        >
          Make product search feel like it can <span className="gradient-text">read minds.</span>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl"
          style={{ animationDelay: "0.16s" }}
        >
          Querix AI turns vague shopping, product, and listing queries into ranked, filtered results
          that e-commerce and marketplace users can trust.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "0.24s" }}
        >
          <a
            href="#demo"
            className="group inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_40px_-10px_oklch(0.62_0.22_290/0.7)] transition hover:shadow-[0_0_60px_-10px_oklch(0.62_0.22_290/0.9)]"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            Watch it think
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
          <a
            href="#pipeline"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface/70 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-surface"
          >
            See architecture
          </a>
        </div>

        <div className="animate-fade-up mt-16" style={{ animationDelay: "0.34s" }}>
          <HeroConsole />
        </div>
      </div>
    </section>
  );
}

function HeroConsole() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="console-shell overflow-hidden rounded-[1.75rem] border border-border bg-background/60 text-left shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border bg-surface/50 px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-3 font-medium text-foreground">querix.live/search</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Gauge className="h-3.5 w-3.5 text-brand-blue" />
            Realtime intent graph
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-border p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="rounded-2xl border border-border bg-surface/50 p-4">
              <div className="flex items-center gap-3 rounded-xl border border-input bg-background/70 px-4 py-3">
                <Search className="h-4 w-4 text-brand-blue" />
                <span className="typing-text font-mono text-sm text-foreground">
                  wedding planner with DJ and makeup in Chennai under 50k
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {["city: Chennai", "budget: <50k", "bundle: event"].map((item) => (
                  <div key={item} className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="text-[10px] uppercase text-muted-foreground">Extracted</div>
                    <div className="mt-1 text-sm text-foreground">{item}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Intent", "Event vendor bundle"],
                ["Fallback", "Category + semantic"],
                ["Ranker", "Hybrid rerank"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-background/35 p-4">
                  <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative p-5 sm:p-6">
            <div className="scan-line" />
            <div className="space-y-3">
              {[
                { name: "Event studio with DJ partner", score: 97 },
                { name: "Bridal makeup + decor package", score: 92 },
                { name: "Planner network near Adyar", score: 88 },
              ].map((result, index) => (
                <div
                  key={result.name}
                  className="rounded-2xl border border-border bg-surface/45 p-4"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{result.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Matched by meaning, filters, and bundle intent
                      </div>
                    </div>
                    <div className="rounded-full border border-brand-blue/40 px-2.5 py-1 text-xs text-brand-blue">
                      {result.score}%
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${result.score}%`,
                        backgroundImage: "var(--gradient-brand)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProofStrip() {
  return (
    <section className="relative -mt-8 pb-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {proof.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-surface/35 p-5">
              <div className="font-display text-3xl font-semibold gradient-text">{item.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = demoQueries[selectedIndex];

  return (
    <section id="demo" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Live intelligence"
          title={
            <>
              From messy text to <span className="gradient-text">ranked action</span>.
            </>
          }
          sub="Try a shopping or listing query that usually breaks ordinary search. Querix turns it into intent, filters, rewrites, and ranked catalog results."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-3">
            {demoQueries.map((demo, index) => (
              <button
                key={demo.query}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedIndex === index
                    ? "border-brand-blue/60 bg-brand-blue/10"
                    : "border-border bg-surface/35 hover:border-brand-blue/35"
                }`}
              >
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-brand-blue" />
                  Scenario {index + 1}
                </div>
                <div className="mt-2 text-sm font-medium text-foreground">{demo.query}</div>
              </button>
            ))}
          </div>

          <div className="console-shell rounded-[1.75rem] border border-border bg-background/55 p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Decoded intent</div>
                <div className="mt-1 font-display text-2xl font-semibold text-foreground">
                  {selected.intent}
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Confident match
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface/35 p-4">
                <div className="text-xs uppercase text-muted-foreground">Query rewrite</div>
                <p className="mt-2 text-sm leading-6 text-foreground">{selected.rewrite}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface/35 p-4">
                <div className="text-xs uppercase text-muted-foreground">Structured filters</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.filters.map((filter) => (
                    <span
                      key={filter}
                      className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-foreground"
                    >
                      {filter}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selected.results.map((result) => (
                <div
                  key={result.label}
                  className="rounded-2xl border border-border bg-surface/35 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{result.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{result.reason}</div>
                    </div>
                    <div className="text-sm font-semibold text-brand-blue">{result.score}%</div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-border">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${result.score}%`,
                        backgroundImage: "var(--gradient-brand)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-brand-blue">
        {eyebrow}
      </div>
      <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 leading-7 text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Problem() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="The upgrade"
          title={
            <>
              Search should recover when users <span className="gradient-text">do not.</span>
            </>
          }
        />
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-border bg-surface/35 p-7">
            <div className="text-xs uppercase text-muted-foreground">Traditional search</div>
            <p className="mt-3 text-foreground/90">
              Matches strings and misses buying intent. Treats category, price, location, product
              use, condition, and synonyms as separate problems.
            </p>
            <div className="mt-6 space-y-2 font-mono text-xs text-muted-foreground">
              <div className="rounded bg-background/40 px-3 py-2">query -&gt; exact match</div>
              <div className="rounded bg-background/40 px-3 py-2">synonym -&gt; unknown</div>
              <div className="rounded bg-background/40 px-3 py-2">intent -&gt; ignored</div>
            </div>
          </div>
          <div className="hover-glow rounded-[1.5rem] border border-brand-blue/30 bg-surface/45 p-7">
            <div className="text-xs font-semibold uppercase gradient-text">Querix AI</div>
            <p className="mt-3 text-foreground/90">
              Understands the job behind the query, builds a retrieval plan, then returns ranked
              results with a reason to believe.
            </p>
            <div className="mt-6 space-y-2 font-mono text-xs">
              <div className="rounded bg-background/40 px-3 py-2">query -&gt; intent graph</div>
              <div className="rounded bg-background/40 px-3 py-2">filters -&gt; safe retrieval</div>
              <div className="rounded bg-background/40 px-3 py-2 text-foreground">
                results -&gt; explainable rank
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section id="capabilities" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Core capabilities"
          title={
            <>
              Built for commerce teams that need{" "}
              <span className="gradient-text">trustworthy AI</span>.
            </>
          }
          sub="A practical intelligence layer for e-commerce search, marketplace discovery, product catalogs, and listing platforms."
        />
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="hover-glow group rounded-2xl border border-border bg-surface/35 p-6"
            >
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundImage: "var(--gradient-brand)" }}
              >
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pipeline() {
  return (
    <section id="pipeline" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Architecture"
          title={
            <>
              A retrieval pipeline that feels <span className="gradient-text">alive</span>.
            </>
          }
          sub="Every stage is observable, tunable, and built to fit behind an existing commerce or marketplace experience."
        />
        <div className="mt-16 grid gap-4 md:grid-cols-4">
          {pipeline.map(({ icon: Icon, title, body }, index) => (
            <div
              key={title}
              className="relative rounded-2xl border border-border bg-surface/35 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/45">
                  <Icon className="h-5 w-5 text-brand-blue" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section id="industries" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Industries"
          title={
            <>
              Built for <span className="gradient-text">commerce and catalog discovery</span>.
            </>
          }
          sub="Querix is focused on companies that sell, rent, advertise, or organize products and listings at scale."
        />
        <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {industries.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="hover-glow flex items-center gap-3 rounded-xl border border-border bg-surface/35 p-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/40">
                <Icon className="h-4 w-4 text-brand-blue" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section id="stack" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Technology"
          title={
            <>
              Modern AI search, packaged for <span className="gradient-text">shipping</span>.
            </>
          }
          sub="A composable API foundation for web and mobile storefronts, marketplaces, classified listings, and product catalogs."
        />
        <div className="mt-16 rounded-[1.75rem] border border-border bg-surface/35 p-8 sm:p-10">
          <div className="flex flex-wrap justify-center gap-2.5">
            {stack.map((technology) => (
              <span
                key={technology}
                className="rounded-full border border-border bg-background/40 px-4 py-2 text-sm text-foreground/90 transition hover:border-brand-blue/50"
              >
                {technology}
              </span>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
            {[
              { icon: Cpu, label: "Model routing", value: "Adaptive" },
              { icon: Rocket, label: "Deployment", value: "API-first" },
              { icon: ShieldCheck, label: "Controls", value: "Tenant-safe" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-background/30 p-6">
                <Icon className="mx-auto h-5 w-5 text-brand-blue" />
                <div className="mt-3 font-display text-2xl font-semibold gradient-text">
                  {value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionMission() {
  return (
    <section id="vision" className="relative py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-border bg-surface/35 p-8 sm:p-10">
          <div className="text-xs uppercase tracking-[0.2em] text-brand-blue">Vision</div>
          <p className="mt-5 font-display text-2xl font-semibold leading-tight sm:text-3xl">
            Become the intelligence layer behind product search, marketplace discovery, and catalog
            recommendations.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-border bg-surface/35 p-8 sm:p-10">
          <div className="text-xs uppercase tracking-[0.2em] text-brand-blue">Mission</div>
          <p className="mt-5 font-display text-2xl font-semibold leading-tight sm:text-3xl">
            Help commerce and listing businesses connect customer intent with the right products,
            services, and advertisements.
          </p>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-border p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-brand-blue">
            Get started
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Turn your search box into your{" "}
            <span className="gradient-text">best product feature</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-muted-foreground">
            Bring a real product or listing catalog, messy customer queries, and business rules.
            Querix can show exactly where discovery improves.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:hello@querix.co?subject=Querix%20AI%20Demo%20Request"
              className="group inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_40px_-10px_oklch(0.62_0.22_290/0.7)] transition hover:shadow-[0_0_60px_-10px_oklch(0.62_0.22_290/0.9)]"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              Request Demo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="mailto:hello@querix.co"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface/70 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-surface"
            >
              <Mail className="h-4 w-4" /> hello@querix.co
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <QuerixLogo size={38} />
          <span className="ml-2 text-xs text-muted-foreground">
            Understanding thoughts — not just words.
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/developers" className="hover:text-foreground transition">
            Developers
          </a>
          <a href="mailto:hello@querix.co" className="hover:text-foreground transition">
            hello@querix.co
          </a>
          <span>(c) {new Date().getFullYear()} Querix AI</span>
        </div>
      </div>
    </footer>
  );
}
