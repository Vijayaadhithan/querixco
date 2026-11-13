import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  Code2,
  Database,
  Headphones,
  Layers3,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Workflow,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Brand } from "@/components/marketing/Brand";
import { CommerceShowcase } from "./CommerceShowcase";
import { IntelligenceDashboard } from "./IntelligenceDashboard";
import { IndustryShowcase } from "./IndustryShowcase";
import { BuyerConfidence } from "./BuyerConfidence";
import { Reveal } from "@/components/Reveal";
import "./landing.css";

export function LandingPage() {
  return (
    <MarketingShell>
      <div className="ql-home">
        <section className="ql-hero qx-container" aria-labelledby="hero-title">
          <div className="ql-hero-copy">
            <p className="qx-eyebrow">
              <span /> SEARCH. CONVERSATION. INSIGHT.
            </p>
            <h1 id="hero-title">
              <span className="ql-headline-line">Help shoppers</span>
              <span className="ql-headline-line">find what</span>
              <span className="ql-headline-line">
                <em>they mean.</em>
              </span>
            </h1>
            <p className="ql-hero-description">A more natural way to shop your catalog.</p>
            <p className="ql-hero-body">
              Connect shoppers to relevant products through search and conversation. See what
              customers search for, and where discovery falls short.
            </p>
            <div className="qx-actions">
              <a className="qx-button" href="/request-demo">
                Request a demo <ArrowUpRight size={16} />
              </a>
              <a
                className="qx-button qx-button-outline"
                href="#commerce-preview"
                onClick={() => document.getElementById("commerce-preview")?.focus()}
              >
                <PlayIcon />
                See it in action
              </a>
            </div>
            <div className="ql-hero-proof">
              <span>
                <Check size={13} />
                Your storefront, enhanced
              </span>
              <span>
                <Check size={13} />
                Your catalog at the centre
              </span>
            </div>
          </div>
          <CommerceShowcase />
        </section>
        <section className="ql-offering qx-container" aria-labelledby="offering-title">
          <div className="ql-offering-heading">
            <p className="qx-eyebrow">WHAT QUERIX BRINGS TO YOUR BUSINESS</p>
            <h2 id="offering-title">Better discovery, from every angle.</h2>
          </div>
          <div className="ql-offering-grid">
            {[
              {
                icon: Search,
                title: "Search that understands",
                body: "Connect everyday language to relevant products, with the filters your customers need.",
                href: "/products/search",
                label: "Explore intelligent search",
                number: "01",
              },
              {
                icon: MessageCircle,
                title: "Shopping that flows",
                body: "Help shoppers discover, refine and compare without starting over at every question.",
                href: "/use-cases/conversational-commerce",
                label: "Explore interactive commerce",
                number: "02",
              },
              {
                icon: BarChart3,
                title: "Demand you can understand",
                body: "See what customers look for, where results fall short and what deserves a closer look.",
                href: "#intelligence",
                label: "Explore the analytics preview",
                number: "03",
              },
            ].map(({ icon: Icon, title, body, href, label, number }) => (
              <a key={number} className="ql-offering-card" href={href}>
                <div>
                  <Icon size={23} />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className="ql-offering-link">
                  {label}
                  <ArrowUpRight size={16} />
                </span>
              </a>
            ))}
          </div>
        </section>
        <Reveal>
          <section id="intelligence" className="ql-section qx-container">
            <div className="ql-section-heading">
              <div>
                <p className="qx-eyebrow">01 / COMMERCE INTELLIGENCE</p>
                <h2>
                  Know what shoppers want.
                  <br />
                  <em>See what’s missing.</em>
                </h2>
              </div>
              <p>
                See what customers want, what they explore and what they can’t find. Turn discovery
                into direction for your business.
              </p>
            </div>
            <IntelligenceDashboard />
            <div className="ql-section-foot">
              <p>From the words shoppers use to the opportunities your catalogue could meet.</p>
              <a href="/request-demo?intent=demo">
                Explore your insights <ArrowRight size={14} />
              </a>
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section id="industries" className="ql-section ql-industry-section">
            <div className="qx-container">
              <div className="ql-section-heading">
                <div>
                  <p className="qx-eyebrow">02 / BUILT AROUND YOUR BUSINESS</p>
                  <h2>
                    Built for your catalog.
                    <br />
                    <em>Shaped around your shoppers.</em>
                  </h2>
                </div>
                <p>
                  From everyday essentials to detailed specifications, explore how conversational
                  discovery adapts to different catalogues.
                </p>
              </div>
              <IndustryShowcase />
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section id="integration" className="ql-section qx-container">
            <div className="ql-section-heading">
              <div>
                <p className="qx-eyebrow">03 / TECHNOLOGY & INTEGRATION</p>
                <h2>
                  Your storefront.
                  <br />
                  <em>Querix underneath.</em>
                </h2>
              </div>
              <p>
                Keep the experience you’ve built. Connect search and conversation through your
                backend, with a clear path from catalogue to customer.
              </p>
            </div>
            <div className="ql-integration-grid">
              <div className="ql-architecture">
                <div className="ql-architecture-top">
                  <span>
                    <ShoppingBag size={21} />
                    <strong>Your storefront</strong>
                    <small>Your customer experience</small>
                  </span>
                  <ArrowRight size={20} />
                  <span>
                    <Database size={21} />
                    <strong>Your catalogue</strong>
                    <small>Products & listing attributes</small>
                  </span>
                </div>
                <div className="ql-connectors" aria-hidden="true">
                  <span />
                  <span />
                </div>
                <div className="ql-engine">
                  <Brand light />
                  <span>THE DISCOVERY LAYER</span>
                  <div>
                    <span>
                      <Search size={14} />
                      Intelligent search
                    </span>
                    <span>
                      <MessageCircle size={14} />
                      Interactive commerce
                    </span>
                    <span>
                      <Workflow size={14} />
                      Search insights
                    </span>
                  </div>
                </div>
                <div className="ql-integration-assurances">
                  <span>
                    <ShieldCheck size={14} />
                    Server-side credentials
                  </span>
                  <span>
                    <Layers3 size={14} />
                    Documented API contracts
                  </span>
                </div>
              </div>
              <div className="ql-code">
                <div>
                  <span>
                    <Code2 size={15} />
                    SEARCH API
                  </span>
                  <a href="/developers/integration">
                    View docs <ArrowUpRight size={13} />
                  </a>
                </div>
                <p>One request. Relevant possibilities.</p>
                <pre aria-label="Illustrative search API request">
                  <code>
                    <span className="ql-code-muted">// Send from your backend</span>
                    {"\n"}
                    <span className="ql-code-blue">POST</span>
                    {" /api/v1/{tenant}/search\n\n"}
                    {"{\n"}
                    {"  "}
                    <span className="ql-code-key">"query"</span>
                    {": "}
                    <span className="ql-code-string">"cotton shirt under $40"</span>
                    {",\n"}
                    {"  "}
                    <span className="ql-code-key">"page_size"</span>
                    {": "}
                    <span className="ql-code-blue">20</span>
                    {"\n}"}
                  </code>
                </pre>
                <div className="ql-code-note">
                  <Check size={14} />
                  <span>Tenant-scoped search. Keep API keys on your server.</span>
                </div>
                <a className="qx-text-link" href="/developers/commerce">
                  Explore the conversation lifecycle <ArrowRight size={14} />
                </a>
              </div>
            </div>
            <div className="ql-doc-links">
              <a href="/developers/architecture">
                Architecture <ArrowUpRight size={13} />
              </a>
              <a href="/developers/data-pipeline">
                Catalogue integration <ArrowUpRight size={13} />
              </a>
              <a href="/developers/operations">
                Security & operations <ArrowUpRight size={13} />
              </a>
              <a href="/developers">
                Developer documentation <ArrowUpRight size={13} />
              </a>
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section id="why-querix" className="ql-section ql-why">
            <div className="qx-container">
              <div className="ql-section-heading">
                <div>
                  <p className="qx-eyebrow">04 / WHY QUERIXAI</p>
                  <h2>
                    Move forward with
                    <br />
                    <em>a clear starting point.</em>
                  </h2>
                </div>
                <p>
                  A practical path to better product discovery, built around your business, your
                  catalogue and your team.
                </p>
              </div>
              <div className="ql-benefits">
                {[
                  {
                    icon: Layers3,
                    title: "Fits what you’ve built",
                    text: "Connect with your existing storefront and backend. Plan the integration around your current infrastructure.",
                  },
                  {
                    icon: Workflow,
                    title: "Start with a focused scope",
                    text: "Scope the service around your catalogue, workloads and customer journeys. Start with a focused proof of concept.",
                  },
                  {
                    icon: RefreshCw,
                    title: "Keep getting better",
                    text: "Use search trends, unmet demand and customer interactions to guide ongoing discovery improvements.",
                  },
                  {
                    icon: Headphones,
                    title: "Support from day one",
                    text: "Work through catalogue mapping, integration and evaluation with implementation support.",
                  },
                ].map(({ icon: Icon, title, text }, i) => (
                  <article key={title}>
                    <div>
                      <Icon size={24} />
                      <span>0{i + 1}</span>
                    </div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
        <Reveal>
          <BuyerConfidence />
        </Reveal>
        <Reveal>
          <section className="ql-conversion qx-container">
            <span className="ql-conversion-orbit" aria-hidden="true" />
            <p className="qx-eyebrow">YOUR CATALOGUE. THE NEXT CONVERSATION.</p>
            <h2>
              Let’s make discovery
              <br />
              <em>work for your business.</em>
            </h2>
            <p>
              Bring your products and the shopping journeys that matter.
              <br />
              We’ll explore the right starting point together.
            </p>
            <div className="qx-actions">
              <a className="qx-button" href="/request-demo?intent=demo">
                Request a demo <ArrowRight size={17} />
              </a>
              <a className="qx-button qx-button-outline" href="/request-demo?intent=integration">
                Discuss integration <ArrowUpRight size={16} />
              </a>
            </div>
            <a className="qx-text-link" href="/request-demo?intent=poc">
              Have a specific use case? Request a proof of concept <ArrowRight size={14} />
            </a>
          </section>
        </Reveal>
      </div>
    </MarketingShell>
  );
}

function PlayIcon() {
  return (
    <svg width="13" height="14" viewBox="0 0 13 14" fill="none" aria-hidden="true">
      <path d="M2 1.5 11 7l-9 5.5z" fill="currentColor" />
    </svg>
  );
}
