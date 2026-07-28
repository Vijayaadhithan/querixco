import { QuerixLogo } from "@/components/QuerixLogo";
import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Code2,
  Database,
  FileCheck2,
  Filter,
  GitBranch,
  KeyRound,
  Layers3,
  Mail,
  Menu,
  MessageSquareText,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  Target,
  Workflow,
  X,
  Zap,
} from "lucide-react";

const demoQueries = [
  {
    label: "Home office",
    query: "comfortable office chair for long workdays under ₹15,000",
    understood: ["office chair", "comfort", "long daily use", "under ₹15,000"],
    results: [
      {
        name: "Ergonomic mesh chair with lumbar support",
        detail: "Adjustable support · breathable back · ₹12,499",
        reason: "Best match for comfort, long use, and budget",
      },
      {
        name: "High-back work chair with headrest",
        detail: "Multi-angle recline · adjustable arms · ₹14,250",
        reason: "Strong ergonomic fit within the stated budget",
      },
      {
        name: "Compact posture-support office chair",
        detail: "Small-space design · lumbar support · ₹9,999",
        reason: "Relevant lower-priced alternative",
      },
    ],
  },
  {
    label: "Creator laptop",
    query: "laptop for editing reels under ₹80,000",
    understood: ["laptop", "video editing", "creator performance", "under ₹80,000"],
    results: [
      {
        name: "Creator laptop · 16 GB RAM · dedicated GPU",
        detail: "Performance display · fast storage · ₹76,990",
        reason: "Strongest fit for short-form video workflows",
      },
      {
        name: "OLED performance ultrabook",
        detail: "H-series processor · colour-accurate panel · ₹79,499",
        reason: "Balances editing performance and display quality",
      },
      {
        name: "Entry creator workstation",
        detail: "Upgradeable memory · discrete graphics · ₹69,990",
        reason: "Good value option for the stated use",
      },
    ],
  },
  {
    label: "Used car",
    query: "used automatic hatchback in Chennai under ₹6 lakh",
    understood: ["used car", "automatic", "hatchback", "Chennai", "under ₹6 lakh"],
    results: [
      {
        name: "2021 automatic hatchback · single owner",
        detail: "Chennai · 32,000 km · ₹5.85 lakh",
        reason: "Matches every explicit constraint",
      },
      {
        name: "2020 compact automatic · low mileage",
        detail: "Chennai · 28,500 km · ₹5.60 lakh",
        reason: "Strong match for city use, condition, and budget",
      },
      {
        name: "2019 city hatchback · automatic",
        detail: "Chennai · 41,000 km · ₹4.95 lakh",
        reason: "Relevant lower-priced alternative",
      },
    ],
  },
] as const;

const outcomes = [
  {
    icon: Search,
    title: "Find the right result sooner",
    body: "Match the need behind a search, even when the shopper does not know the exact product name.",
  },
  {
    icon: Target,
    title: "Respect every constraint",
    body: "Keep stated filters such as category, location, price, duration, and listing type authoritative.",
  },
  {
    icon: Sparkles,
    title: "Recover difficult searches",
    body: "Handle vague language, typos, multilingual wording, and unusual descriptions without a brittle synonym maze.",
  },
] satisfies Array<{ icon: LucideIcon; title: string; body: string }>;

const capabilities = [
  {
    icon: BrainCircuit,
    title: "Understands intent",
    body: "Interprets what the shopper wants, not only the terms that happen to appear in the catalog.",
  },
  {
    icon: Layers3,
    title: "Balances meaning and precision",
    body: "Combines semantic retrieval with lexical matching so intent, product names, and rare exact terms all matter.",
  },
  {
    icon: Filter,
    title: "Keeps hard filters hard",
    body: "Explicit customer constraints stay enforced while inferred preferences guide ranking instead of hiding good alternatives.",
  },
  {
    icon: RefreshCw,
    title: "Returns current catalog data",
    body: "Ranks candidate IDs, then hydrates approved fields from the canonical catalog before results reach the shopper.",
  },
  {
    icon: ShieldCheck,
    title: "Isolates every tenant",
    body: "Credentials, limits, indexes, cache state, cursors, usage, and response fields remain company-scoped.",
  },
  {
    icon: GitBranch,
    title: "Degrades gracefully",
    body: "Vector and keyword retrieval can cover for one another, while reranker failure retains the fused result order.",
  },
] satisfies Array<{ icon: LucideIcon; title: string; body: string }>;

const useCases = [
  { icon: ShoppingBag, label: "E-commerce storefronts" },
  { icon: Store, label: "Marketplaces" },
  { icon: PackageCheck, label: "Product catalogs" },
  { icon: MessageSquareText, label: "Classifieds and listings" },
] satisfies Array<{ icon: LucideIcon; label: string }>;

type ApiHealth = {
  status: string;
  tenantMode: boolean;
  configuredCompanies: number;
};

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden text-foreground">
      <Nav />
      <main>
        <Hero />
        <AudienceStrip />
        <Problem />
        <SearchExperience />
        <BusinessValue />
        <HowItWorks />
        <Capabilities />
        <Platform />
        <Trust />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Why Querix", "#why-querix"],
    ["How it works", "#how-it-works"],
    ["Platform", "#platform"],
    ["Developers", "/developers"],
  ] as const;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-[#071525]/90 shadow-[0_14px_45px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-5">
          <a href="#top" className="flex items-center" aria-label="Querix AI home">
            <QuerixLogo size={42} className="h-9 w-auto" />
          </a>

          <nav
            className="hidden items-center gap-7 text-sm text-[#a9b8ca] md:flex"
            aria-label="Main navigation"
          >
            {links.map(([label, href]) => (
              <a key={href} href={href} className="transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="mailto:hello@querix.co?subject=Querix%20AI%20Demo"
              className="hidden min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#071525] transition hover:bg-[#dceeff] sm:inline-flex"
            >
              Book a demo <ArrowRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white md:hidden"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close navigation" : "Open navigation"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="mobile-navigation"
            className="border-t border-white/10 px-4 py-4 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="grid gap-1">
              {links.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm text-[#c6d4e4] transition hover:bg-white/[0.05] hover:text-white"
                >
                  {label}
                </a>
              ))}
              <a
                href="mailto:hello@querix.co?subject=Querix%20AI%20Demo"
                className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#071525]"
              >
                Book a demo <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative pb-20 pt-36 sm:pb-28 sm:pt-44">
      <div className="pointer-events-none absolute inset-0 hero-mesh" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-[110px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-[#4fa4ff]/25 bg-[#4fa4ff]/10 px-3.5 py-1.5 text-xs font-medium text-[#a9d5ff]">
            <Sparkles className="h-3.5 w-3.5" />
            Intent-aware product discovery
          </div>
          <h1
            className="animate-fade-up mt-7 max-w-3xl font-display text-[2.85rem] font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-[4.65rem]"
            style={{ animationDelay: "70ms" }}
          >
            Your customers think in ideas.{" "}
            <span className="text-[#8dc9ff]">Your search engine thinks in keywords.</span>
          </h1>
          <p
            className="animate-fade-up mt-7 max-w-2xl text-lg leading-8 text-[#a9b8ca] sm:text-xl"
            style={{ animationDelay: "140ms" }}
          >
            Querix AI understands customer intent and helps shoppers find the products they are
            actually looking for—even when they search using vague, incomplete, or natural-language
            queries.
          </p>
          <div
            className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "210ms" }}
          >
            <a
              href="mailto:hello@querix.co?subject=Querix%20AI%20Demo"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 text-sm font-semibold text-white shadow-[0_18px_50px_-20px_rgba(30,144,255,0.9)] transition hover:bg-[#49a7ff]"
            >
              See Querix on your catalog <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#search-experience"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.035] px-5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.07]"
            >
              Explore the experience <ChevronRight className="h-4 w-4" />
            </a>
          </div>
          <div
            className="animate-fade-up mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#91a2b7]"
            style={{ animationDelay: "280ms" }}
          >
            {["Natural-language queries", "Exact filter control", "API-first integration"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-300" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <HeroSearch />
      </div>
    </section>
  );
}

function HeroSearch() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-brand-blue/20 via-brand-purple/10 to-transparent blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#081522]/95 shadow-[0_36px_120px_-45px_rgba(0,0,0,0.95)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#b7c6d8]">
            <Store className="h-4 w-4 text-brand-blue" />
            Store search
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-[#8193a8]">
            Experience preview
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="rounded-2xl border border-[#4fa4ff]/30 bg-[#07111c] p-4 shadow-[0_0_0_3px_rgba(30,144,255,0.05)]">
            <div className="flex items-start gap-3">
              <Search className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
              <div>
                <p className="text-sm leading-6 text-white">
                  something for back pain while working from home
                </p>
                <p className="mt-1 text-[11px] text-[#6f849b]">Press Enter to search</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#71849a]">
            <BrainCircuit className="h-3.5 w-3.5 text-violet-300" />
            Querix understood
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["ergonomic support", "home office", "back comfort", "long sitting"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-3 py-1.5 text-xs text-violet-100"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {[
              ["Ergonomic mesh chair", "Lumbar support · adjustable seat", "Best overall match"],
              ["High-back work chair", "Headrest · multi-angle recline", "Strong comfort match"],
              [
                "Sit-stand desk converter",
                "Alternate posture through the day",
                "Useful alternative",
              ],
            ].map(([name, detail, reason], index) => (
              <div
                key={name}
                className="rounded-2xl border border-white/[0.09] bg-white/[0.025] p-4"
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#163f65] to-[#302556]">
                    <ShoppingBag className="h-5 w-5 text-[#c9e7ff]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-white">{name}</p>
                      <span className="font-mono text-[10px] text-[#6e8298]">0{index + 1}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#7f93a9]">{detail}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-200">
                      <CircleDot className="h-3 w-3" />
                      {reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AudienceStrip() {
  return (
    <section className="border-y border-white/[0.07] bg-white/[0.018]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-7 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm font-medium text-[#8799ad]">Built for high-intent discovery across</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:gap-x-9">
          {useCases.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-[#c1cfdf]">
              <Icon className="h-4 w-4 text-brand-blue" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section id="why-querix" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionIntro
          eyebrow="Why search loses shoppers"
          title={
            <>
              Customers describe a need. Most search boxes wait for a{" "}
              <span className="gradient-text">matching word.</span>
            </>
          }
          body="A shopper should not need to understand your catalog vocabulary before they can buy from you. Querix closes the gap between how people express intent and how product data is organized."
          align="left"
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-7 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#778ba1]">
              Keyword-only search hears
            </p>
            <div className="mt-6 rounded-xl border border-red-300/15 bg-red-300/[0.04] p-5 font-mono text-sm text-[#c5cfda]">
              <span className="text-red-200">No exact match:</span> “something elegant for an
              outdoor evening wedding”
            </div>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-[#91a2b7]">
              {[
                "The shopper used a need, not a product name.",
                "Relevant attributes live across inconsistent catalog fields.",
                "A minor vocabulary mismatch becomes a dead end.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <X className="mt-1 h-4 w-4 shrink-0 text-red-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-brand-blue/25 bg-gradient-to-br from-brand-blue/[0.11] via-white/[0.035] to-violet-400/[0.06] p-7 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9ed1ff]">
              Querix understands
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Occasion", "Outdoor evening wedding"],
                ["Desired style", "Elegant"],
                ["Likely categories", "Apparel, lighting, decor"],
                ["Search approach", "Intent + exact inventory filters"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-[#07111c]/60 p-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#6f8298]">{label}</p>
                  <p className="mt-1.5 text-sm font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 flex items-start gap-3 text-sm leading-6 text-[#b8c8d9]">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
              The shopper sees useful, current products ranked around their goal—not a blank page or
              an arbitrary keyword match.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchExperience() {
  const [active, setActive] = useState(0);
  const demo = demoQueries[active];

  return (
    <section
      id="search-experience"
      className="relative border-y border-white/[0.07] bg-[#06111d] py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-35" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionIntro
          eyebrow="The shopper experience"
          title={
            <>
              Let customers search the way they{" "}
              <span className="gradient-text">naturally think.</span>
            </>
          }
          body="Explore representative queries across products and listings. The examples show the intent and explicit constraints Querix can use to rank relevant inventory."
        />

        <div
          className="mt-12 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Search examples"
        >
          {demoQueries.map((item, index) => (
            <button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={active === index}
              onClick={() => setActive(index)}
              className={`min-h-10 rounded-full border px-4 text-sm transition ${
                active === index
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-white/10 bg-white/[0.03] text-[#9aabbe] hover:border-white/20 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#081522] shadow-[0_32px_100px_-55px_rgba(30,144,255,0.8)]">
          <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
            <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#768ba2]">
                Customer searched
              </p>
              <div className="mt-4 rounded-xl border border-brand-blue/30 bg-[#050d16] p-4">
                <div className="flex gap-3">
                  <Search className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                  <p className="text-sm leading-6 text-white">{demo.query}</p>
                </div>
              </div>

              <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.16em] text-[#768ba2]">
                Querix understood
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {demo.understood.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#c3d0df]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-emerald-100">
                  <SlidersHorizontal className="h-4 w-4" />
                  Intent and filters stay distinct
                </p>
                <p className="mt-2 text-xs leading-5 text-emerald-100/60">
                  Stated constraints are enforced. Inferred preferences shape relevance without
                  silently excluding useful alternatives.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#768ba2]">
                    Ranked results
                  </p>
                  <p className="mt-1 text-sm text-[#a6b6c8]">Matched by intent and catalog facts</p>
                </div>
                <BadgeCheck className="h-5 w-5 text-emerald-300" />
              </div>

              <div className="mt-5 space-y-3">
                {demo.results.map((result, index) => (
                  <div
                    key={result.name}
                    className="rounded-xl border border-white/[0.09] bg-white/[0.025] p-4 sm:p-5"
                  >
                    <div className="flex gap-4">
                      <span className="font-mono text-xs text-[#5e758d]">0{index + 1}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{result.name}</h3>
                        <p className="mt-1 text-xs text-[#8194aa]">{result.detail}</p>
                        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#a9d5ff]">
                          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {result.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-right text-[10px] text-[#5e7187]">
                Illustrative catalog experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BusinessValue() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionIntro
          eyebrow="What changes for your business"
          title="Make product discovery feel effortless."
          body="Querix helps teams improve the experience at the exact moment a shopper expresses intent—without forcing a complete storefront rebuild."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {outcomes.map(({ icon: Icon, title, body }, index) => (
            <article
              key={title}
              className="group rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-7 transition hover:-translate-y-1 hover:border-brand-blue/30 hover:bg-brand-blue/[0.045]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-blue/20 bg-brand-blue/10">
                  <Icon className="h-5 w-5 text-[#8dc9ff]" />
                </div>
                <span className="font-mono text-xs text-[#536a82]">0{index + 1}</span>
              </div>
              <h3 className="mt-7 font-display text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#91a2b7]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: MessageSquareText,
      label: "Understand",
      title: "Read the intent behind the query",
      body: "Identify goals, entities, explicit constraints, ambiguity, spelling variation, and tenant-specific language.",
    },
    {
      icon: Layers3,
      label: "Retrieve",
      title: "Find candidates through two lenses",
      body: "Combine semantic meaning with keyword precision, then preserve hard catalog filters and exact customer constraints.",
    },
    {
      icon: SlidersHorizontal,
      label: "Rank",
      title: "Order results around the customer",
      body: "Fuse the strongest candidates, shape them around intent, and apply a hosted reranker when available.",
    },
    {
      icon: Database,
      label: "Return",
      title: "Hydrate current, approved data",
      body: "Fetch the latest public product fields from the canonical catalog before returning tenant-safe results.",
    },
  ] satisfies Array<{ icon: LucideIcon; label: string; title: string; body: string }>;

  return (
    <section
      id="how-it-works"
      className="border-y border-white/[0.07] bg-white/[0.018] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionIntro
          eyebrow="How Querix works"
          title="One search flow. The right path for every query."
          body="Simple catalog searches stay fast and deterministic. Descriptive, ambiguous, misspelled, or multilingual searches use the semantic path."
          align="left"
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {steps.map(({ icon: Icon, label, title, body }, index) => (
            <article
              key={label}
              className="relative rounded-2xl border border-white/[0.08] bg-[#081522] p-6"
            >
              {index < steps.length - 1 && (
                <div className="absolute -right-3 top-10 z-10 hidden h-px w-6 bg-brand-blue/40 lg:block" />
              )}
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-mono text-[11px] text-[#627990]">0{index + 1}</span>
              </div>
              <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-[#8dc9ff]">
                {label}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#8799ad]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-blue">
              Built for dependable relevance
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
              Intelligent where it matters. Predictable where it counts.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#91a2b7]">
              AI search only earns trust when it respects the catalog, the customer, and the rules
              your business depends on.
            </p>
            <a
              href="/developers/platform"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#9ed1ff] transition hover:text-white"
            >
              Explore platform behavior <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6"
              >
                <Icon className="h-5 w-5 text-[#8dc9ff]" />
                <h3 className="mt-5 font-display text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#8799ad]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Platform() {
  return (
    <section id="platform" className="border-y border-white/[0.07] bg-[#06111d] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionIntro
          eyebrow="The Querix platform"
          title="Two systems. One reliable discovery experience."
          body="Querix connects a controlled data lifecycle with an intent-aware serving layer, so search quality starts before the first customer query."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-white/10 bg-[#081522] p-7 sm:p-9">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/[0.08]">
                <Workflow className="h-6 w-6 text-violet-200" />
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#74889f]">
                Data foundation
              </span>
            </div>
            <h3 className="mt-7 font-display text-2xl font-semibold text-white">
              Catalog intelligence pipeline
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#91a2b7]">
              Reads company source data, normalizes it, composes retrieval content, validates the
              result, and optionally promotes a complete search-ready dataset atomically.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#b2c0d0]">
              {[
                "Read-only source access",
                "Company-specific normalization",
                "Validation before publishing",
                "Incremental change handling",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <FileCheck2 className="h-4 w-4 text-emerald-300" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/developers/data-pipeline"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-violet-200 transition hover:text-white"
            >
              Read the data lifecycle <ArrowRight className="h-4 w-4" />
            </a>
          </article>

          <article className="rounded-[1.75rem] border border-brand-blue/20 bg-gradient-to-br from-brand-blue/[0.09] to-[#081522] p-7 sm:p-9">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-blue/25 bg-brand-blue/10">
                <BrainCircuit className="h-6 w-6 text-[#9ed1ff]" />
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#74889f]">
                Search intelligence
              </span>
            </div>
            <h3 className="mt-7 font-display text-2xl font-semibold text-white">
              Intent-aware search API
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#91a2b7]">
              Routes exact requests efficiently, combines pgvector and BM25 for harder queries,
              reranks the strongest candidates, and returns fresh tenant-approved catalog fields.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#b2c0d0]">
              {[
                "Deterministic and semantic routes",
                "Hybrid candidate retrieval",
                "Tenant-scoped controls",
                "Observable fallback behavior",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-[#8dc9ff]" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/developers/architecture"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#9ed1ff] transition hover:text-white"
            >
              Explore the architecture <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const response = await fetch("/api/ready", { cache: "no-store" });
        if (!response.ok) throw new Error("Readiness failed");
        const payload = (await response.json()) as ApiHealth;
        if (!cancelled) setHealth(payload);
      } catch {
        if (!cancelled) setOffline(true);
      }
    }

    void checkHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = health?.status === "ok";

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-blue">
            Designed for real production boundaries
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
            Your search layer should be intelligent—not mysterious.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#91a2b7]">
            Querix exposes clear request contracts, tenant-safe diagnostics, bounded fallbacks, and
            operational health signals so product and engineering teams can ship with confidence.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#081522]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  ready ? "bg-emerald-300" : offline ? "bg-red-300" : "bg-amber-200"
                }`}
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  {ready
                    ? "Search API is ready"
                    : offline
                      ? "Status unavailable"
                      : "Checking live readiness"}
                </p>
                <p className="mt-0.5 text-xs text-[#72869d]">Public serving-path signal</p>
              </div>
            </div>
            <a
              href="/developers/operations"
              className="text-xs font-medium text-[#9ed1ff] transition hover:text-white"
            >
              Reliability guide
            </a>
          </div>
          <div className="grid sm:grid-cols-3">
            {[
              {
                icon: KeyRound,
                title: "Server-side keys",
                body: "Permanent tenant credentials stay behind your backend boundary.",
              },
              {
                icon: ShieldCheck,
                title: "Tenant isolation",
                body: "Search resources and public response fields are company-scoped.",
              },
              {
                icon: Code2,
                title: "Clear API contract",
                body: "Typed requests, cursor pagination, and explicit error behavior.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="border-t border-white/10 p-6 sm:border-r sm:last:border-r-0"
              >
                <Icon className="h-5 w-5 text-[#8dc9ff]" />
                <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#7f93a9]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="contact" className="pb-24 pt-8 sm:pb-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-brand-blue/25 bg-[#091a2b] px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0 cta-glow" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9ed1ff]">
              Start with your hardest searches
            </p>
            <h2 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl md:text-6xl">
              Show us where your customers get stuck.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#a6b6c8]">
              Bring a real catalog, representative customer queries, and the rules your storefront
              must respect. We will show you how Querix interprets and ranks them.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:hello@querix.co?subject=Querix%20AI%20Catalog%20Demo"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#071525] transition hover:bg-[#dceeff]"
              >
                Book a catalog demo <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/developers"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Read the developer docs <Code2 className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  body: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-blue">{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-[#91a2b7]">{body}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050d16]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <QuerixLogo size={42} className="h-10 w-auto" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#7f93a9]">
              Intent-aware product discovery for e-commerce, marketplaces, catalogs, and listing
              platforms.
            </p>
            <a
              href="mailto:hello@querix.co"
              className="mt-5 inline-flex items-center gap-2 text-sm text-[#9ed1ff] transition hover:text-white"
            >
              <Mail className="h-4 w-4" /> hello@querix.co
            </a>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#62778f]">
              Product
            </p>
            <div className="mt-4 grid gap-3 text-sm text-[#9bacc0]">
              <a href="#why-querix" className="transition hover:text-white">
                Why Querix
              </a>
              <a href="#how-it-works" className="transition hover:text-white">
                How it works
              </a>
              <a href="#platform" className="transition hover:text-white">
                Platform
              </a>
              <a href="/developers" className="transition hover:text-white">
                Developers
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#62778f]">
              Engineering
            </p>
            <div className="mt-4 grid gap-3 text-sm text-[#9bacc0]">
              <a
                href="https://github.com/Vijayaadhithan/querix-semantic-search"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                Search engine
              </a>
              <a
                href="https://github.com/Vijayaadhithan/ETL_Pipeline"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                ETL pipeline
              </a>
              <a href="/developers/operations" className="transition hover:text-white">
                Reliability
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-xs text-[#60758d] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Querix AI. All rights reserved.</span>
          <span>Understanding intent—not just matching words.</span>
        </div>
      </div>
    </footer>
  );
}
