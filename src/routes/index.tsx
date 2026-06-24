import { createFileRoute } from "@tanstack/react-router";
import { QuerixLogo } from "@/components/QuerixLogo";
import {
  ArrowRight,
  Search,
  Brain,
  Sparkles,
  Compass,
  ShieldCheck,
  Languages,
  Mic,
  Layers,
  ShoppingBag,
  Store,
  Building2,
  Home,
  Plane,
  HeartPulse,
  GraduationCap,
  Landmark,
  Newspaper,
  BookOpen,
  Headphones,
  Briefcase,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Querix AI — Beyond Keywords" },
      { name: "description", content: "Querix AI helps businesses understand what users mean, not just what they type. Semantic search, embeddings, and intelligent discovery." },
      { property: "og:title", content: "Querix AI — Beyond Keywords" },
      { property: "og:description", content: "The intelligence layer behind search, recommendations, and discovery." },
    ],
  }),
  component: Landing,
});

const capabilities = [
  { icon: Search, title: "Semantic Search", desc: "Move beyond exact keyword matching to meaning-based retrieval." },
  { icon: Brain, title: "Intent Understanding", desc: "Interpret context, nuance, and the why behind every query." },
  { icon: Sparkles, title: "Intelligent Discovery", desc: "Surface what matters automatically — before users ask." },
  { icon: Compass, title: "Recommendation Engine", desc: "Connect users with the most relevant results in real time." },
  { icon: ShieldCheck, title: "Zero Result Elimination", desc: "Reduce dead-end searches and lift engagement everywhere." },
  { icon: Layers, title: "Context-Aware Retrieval", desc: "Results ranked by meaning and context, not syntax." },
  { icon: Mic, title: "Voice & Conversational Ready", desc: "Architected for the next generation of natural interfaces." },
  { icon: Languages, title: "Multilingual Ready", desc: "Built for global and regional languages from day one." },
];

const industries = [
  { icon: ShoppingBag, label: "E-commerce" },
  { icon: Store, label: "Marketplaces" },
  { icon: Building2, label: "Enterprise Search" },
  { icon: Home, label: "Property Platforms" },
  { icon: Plane, label: "Travel Platforms" },
  { icon: HeartPulse, label: "Healthcare" },
  { icon: GraduationCap, label: "Education" },
  { icon: Landmark, label: "Finance" },
  { icon: Newspaper, label: "Media" },
  { icon: BookOpen, label: "Knowledge Bases" },
  { icon: Headphones, label: "Customer Support" },
  { icon: Briefcase, label: "B2B Applications" },
];

const stack = [
  "Embeddings",
  "Transformer Models",
  "Vector Databases",
  "Semantic Retrieval",
  "Machine Learning",
  "Python",
  "FastAPI",
  "Scalable APIs",
];

function Landing() {
  return (
    <div className="min-h-screen text-foreground">
      <Nav />
      <Hero />
      <Problem />
      <Capabilities />
      <Industries />
      <TechStack />
      <VisionMission />
      <Contact />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="glass-card flex items-center justify-between rounded-full px-5 py-2.5">
          <a href="#top" className="flex items-center gap-2.5">
            <QuerixLogo size={30} />
            <span className="font-display text-lg font-semibold tracking-tight">
              Querix<span className="gradient-text">AI</span>
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#capabilities" className="hover:text-foreground transition">Capabilities</a>
            <a href="#industries" className="hover:text-foreground transition">Industries</a>
            <a href="#stack" className="hover:text-foreground transition">Technology</a>
            <a href="#vision" className="hover:text-foreground transition">Vision</a>
          </nav>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground/95 px-4 py-2 text-sm font-medium text-background hover:bg-foreground transition"
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
    <section id="top" className="relative overflow-hidden pt-40 pb-32">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75" style={{ animation: "pulse-ring 1.8s ease-out infinite" }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-blue" />
          </span>
          The intelligence layer for modern discovery
        </div>

        <h1 className="animate-fade-up mt-8 font-display text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-semibold leading-[0.98]" style={{ animationDelay: "0.1s" }}>
          Beyond <span className="gradient-text">Keywords.</span>
        </h1>

        <p className="animate-fade-up mx-auto mt-7 max-w-2xl text-lg text-muted-foreground sm:text-xl" style={{ animationDelay: "0.2s" }}>
          Querix AI helps businesses understand what users mean — not just what they type.
        </p>

        <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.3s" }}>
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_40px_-10px_oklch(0.62_0.22_290/0.7)] transition hover:shadow-[0_0_60px_-10px_oklch(0.62_0.22_290/0.9)]"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            Request Demo
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
          <a
            href="#capabilities"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-medium text-foreground hover:bg-surface backdrop-blur transition"
          >
            Explore Capabilities
          </a>
        </div>

        <div className="animate-fade-up mt-20" style={{ animationDelay: "0.45s" }}>
          <SearchOrb />
        </div>
      </div>
    </section>
  );
}

function SearchOrb() {
  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3">
          <Search className="h-4 w-4 text-brand-blue" />
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground">"affordable getaway near the coast for next weekend"</span>
          </span>
          <span className="ml-auto h-4 w-px bg-border" />
          <span className="text-xs text-muted-foreground">semantic</span>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["Intent decoded", "Context expanded", "Results re-ranked"].map((label, i) => (
            <div key={label} className="rounded-lg border border-border bg-background/30 p-3 text-left">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Step {i + 1}</div>
              <div className="mt-1 text-sm text-foreground">{label}</div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full" style={{ width: `${60 + i * 15}%`, backgroundImage: "var(--gradient-brand)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] opacity-60" style={{ background: "var(--gradient-radial-glow)" }} />
    </div>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-brand-blue">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-semibold">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Problem() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeader eyebrow="The Problem" title={<>Traditional search relies on keywords. <span className="gradient-text">Human intent does not.</span></>} />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass-card rounded-2xl p-7">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Keyword Search</div>
            <p className="mt-3 text-foreground/90">Matches strings. Misses meaning. Returns empty results when phrasing varies — even slightly.</p>
            <div className="mt-6 space-y-2 font-mono text-xs text-muted-foreground">
              <div className="rounded bg-background/40 px-3 py-2">query → exact match → fail</div>
              <div className="rounded bg-background/40 px-3 py-2">synonym → unknown → fail</div>
              <div className="rounded bg-background/40 px-3 py-2">intent → ignored</div>
            </div>
          </div>
          <div className="glass-card hover-glow rounded-2xl p-7" style={{ borderColor: "oklch(0.62 0.22 290 / 0.3)" }}>
            <div className="text-xs uppercase tracking-wider gradient-text font-semibold">Querix AI</div>
            <p className="mt-3 text-foreground/90">Understands meaning, context, and intent. Delivers relevant results even when the question is vague, conversational, or multilingual.</p>
            <div className="mt-6 space-y-2 font-mono text-xs">
              <div className="rounded bg-background/40 px-3 py-2">query → embedding → vector search</div>
              <div className="rounded bg-background/40 px-3 py-2">intent → contextualized → ranked</div>
              <div className="rounded bg-background/40 px-3 py-2 text-foreground">result → relevant ✓</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section id="capabilities" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Core Capabilities"
          title={<>An engine built for <span className="gradient-text">meaning</span>.</>}
          sub="Eight capabilities that turn search into intelligent discovery."
        />
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card hover-glow group rounded-2xl p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundImage: "var(--gradient-brand)" }}>
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

function Industries() {
  return (
    <section id="industries" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Industries"
          title={<>Built to power <span className="gradient-text">every domain</span>.</>}
          sub="Querix AI is domain-agnostic — designed to plug into any product where discovery matters."
        />
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {industries.map(({ icon: Icon, label }) => (
            <div key={label} className="glass-card hover-glow flex items-center gap-3 rounded-xl p-4">
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
    <section id="stack" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Technology"
          title={<>A modern <span className="gradient-text">AI foundation</span>.</>}
          sub="Composable, production-grade infrastructure designed to scale."
        />
        <div className="relative mt-16">
          <div className="absolute inset-0 -z-10 rounded-3xl opacity-50" style={{ background: "var(--gradient-radial-glow)" }} />
          <div className="glass-card rounded-3xl p-8 sm:p-10">
            <div className="flex flex-wrap gap-2.5 justify-center">
              {stack.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-background/40 px-4 py-2 text-sm text-foreground/90 hover:border-brand-blue/50 transition"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              {[
                { k: "ms", v: "<50", label: "Query latency" },
                { k: "M+", v: "10", label: "Vectors per index" },
                { k: "%", v: "99.9", label: "API uptime target" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-background/30 p-6">
                  <div className="font-display text-3xl font-semibold">
                    <span className="gradient-text">{s.v}</span>
                    <span className="text-muted-foreground text-base ml-1">{s.k}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionMission() {
  return (
    <section id="vision" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          <div className="text-xs uppercase tracking-[0.2em] text-brand-blue">Vision</div>
          <p className="mt-5 font-display text-2xl sm:text-3xl font-semibold leading-tight">
            To become the <span className="gradient-text">intelligence layer</span> behind search, recommendations, and discovery.
          </p>
        </div>
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          <div className="text-xs uppercase tracking-[0.2em] text-brand-blue">Mission</div>
          <p className="mt-5 font-display text-2xl sm:text-3xl font-semibold leading-tight">
            Empower businesses to deliver experiences that <span className="gradient-text">understand users naturally</span>.
          </p>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border p-10 sm:p-16 text-center">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-brand-blue">Get Started</div>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight">
            Build smarter search <br className="hidden sm:block" /> with <span className="gradient-text">Querix AI</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            See how semantic retrieval transforms discovery in your product.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:hello@querix.co?subject=Querix%20AI%20Demo%20Request"
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_40px_-10px_oklch(0.62_0.22_290/0.7)] transition hover:shadow-[0_0_60px_-10px_oklch(0.62_0.22_290/0.9)]"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              Request Demo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="mailto:hello@querix.co"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-medium text-foreground hover:bg-surface backdrop-blur transition"
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
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <QuerixLogo size={26} />
          <span className="font-display font-semibold">
            Querix<span className="gradient-text">AI</span>
          </span>
          <span className="text-xs text-muted-foreground ml-2">Beyond Keywords.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="mailto:hello@querix.co" className="hover:text-foreground transition">hello@querix.co</a>
          <span>© {new Date().getFullYear()} Querix AI</span>
        </div>
      </div>
    </footer>
  );
}
