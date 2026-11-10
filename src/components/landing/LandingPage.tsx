import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Database,
  MessageCircle,
  Search,
} from "lucide-react";
import { MarketingShell, DemoCta } from "@/components/marketing/MarketingShell";
import { ProductExperience } from "@/components/marketing/ProductExperience";

export function LandingPage() {
  return (
    <MarketingShell>
      <section className="qx-hero qx-container">
        <div className="qx-hero-copy">
          <p className="qx-eyebrow">
            <span /> INTELLIGENCE FOR PRODUCT DISCOVERY
          </p>
          <h1>
            From “I need”
            <br />
            to <em>“that’s it.”</em>
          </h1>
          <p className="qx-hero-description">Help shoppers find what they mean.</p>
          <p className="qx-hero-body">
            Intent-aware search and conversational shopping that turn customer needs into relevant
            choices from your catalog.
          </p>
          <div className="qx-actions">
            <a className="qx-button" href="/request-demo">
              Request a demo <ArrowUpRight size={18} />
            </a>
            <a className="qx-text-link" href="#discovery">
              Explore the platform <ArrowDown size={15} />
            </a>
          </div>
          <div className="qx-hero-note">
            <span>BUILT AROUND YOUR CATALOG</span>
            <span>Search. Refine. Compare.</span>
          </div>
        </div>
        <div className="qx-hero-stage">
          <ProductExperience />
        </div>
      </section>
      <div className="qx-audience">
        <div className="qx-container">
          <span>MADE FOR THE WAY PEOPLE SHOP</span>
          <p>E-commerce</p>
          <i />
          <p>Marketplaces</p>
          <i />
          <p>Product catalogs</p>
          <i />
          <p>Listing platforms</p>
        </div>
      </div>
      <section id="discovery" className="qx-section qx-container">
        <div className="qx-section-heading">
          <p className="qx-eyebrow">01 / TWO WAYS TO FIND THE RIGHT FIT</p>
          <div>
            <h2>
              A better answer.
              <br />A natural next question.
            </h2>
            <p>
              Some customers know exactly what to search for. Others need a conversation to get
              there. Give both a clear path forward.
            </p>
          </div>
        </div>
        <div className="qx-product-pair">
          <article className="qx-product-panel">
            <div className="qx-panel-top">
              <Search size={23} />
              <span>01 — INTELLIGENT SEARCH</span>
            </div>
            <h3>
              Understand the search.
              <br />
              Find the right products.
            </h3>
            <p>
              Match customer intent, product names, and explicit requirements—even when the query is
              incomplete or imprecise.
            </p>
            <div className="qx-search-example">
              <span>“blue cotton shirt for work under $40”</span>
              <div>
                <span>Blue</span>
                <span>Cotton</span>
                <span>Workwear</span>
                <span>≤ $40</span>
              </div>
            </div>
            <a className="qx-text-link" href="/products/search">
              Explore intelligent search <ArrowUpRight size={18} />
            </a>
          </article>
          <article className="qx-product-panel qx-panel-blue">
            <div className="qx-panel-top">
              <MessageCircle size={23} />
              <span>02 — INTERACTIVE COMMERCE</span>
            </div>
            <h3>
              Keep the context.
              <br />
              Move the choice forward.
            </h3>
            <p>
              Turn a first request into a useful dialogue. Remember requirements, refine results,
              and compare supplied product details.
            </p>
            <div className="qx-conversation-example">
              <span>“Under $30 instead.”</span>
              <p>
                <Check size={16} /> New budget. Same cotton preference.
              </p>
            </div>
            <a className="qx-text-link" href="/use-cases/conversational-commerce">
              Explore interactive commerce <ArrowUpRight size={18} />
            </a>
          </article>
        </div>
      </section>
      <section className="qx-journey">
        <div className="qx-container qx-section">
          <div className="qx-section-heading">
            <p className="qx-eyebrow">02 / EVERY TURN HAS A PURPOSE</p>
            <div>
              <h2>
                Discovery doesn’t stop
                <br />
                at the first result.
              </h2>
              <p>
                Build on what the shopper has already told you. Keep their requirements connected to
                the products they see.
              </p>
            </div>
          </div>
          <div className="qx-journey-grid">
            {[
              [
                "01",
                "Start with a need",
                "“A cotton shirt for work.”",
                "Interpret the request and ask for missing context when needed.",
              ],
              [
                "02",
                "Make it more specific",
                "“Keep it under $30.”",
                "Update the budget while preserving the other saved requirements.",
              ],
              [
                "03",
                "Understand the choices",
                "“Compare these two.”",
                "Put supplied attributes side by side, with missing information left unknown.",
              ],
            ].map(([number, title, quote, body]) => (
              <article key={number}>
                <span className="qx-step-number">{number}</span>
                <h3>{title}</h3>
                <blockquote>{quote}</blockquote>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="qx-section qx-container qx-catalog-section">
        <div>
          <p className="qx-eyebrow">03 / GROUNDED IN THE CATALOG</p>
          <h2>
            The conversation
            <br />
            starts with your products.
          </h2>
          <p className="qx-section-body">
            Explore the shopping journeys supported by the commerce demo. Each storefront keeps its
            own conversation and requirements.
          </p>
          <a className="qx-text-link" href="/use-cases/conversational-commerce#storefronts">
            Explore the use cases <ArrowRight size={17} />
          </a>
          <p className="qx-small-note">Live demo access is provided to approved testers.</p>
        </div>
        <div className="qx-category-list">
          {[
            ["01", "Clothing", "Fabric, fit, occasion & budget"],
            ["02", "Beauty & personal care", "Preferences, routines & listing details"],
            ["03", "Footwear", "Style, use & price range"],
            ["04", "Fashion accessories", "The finishing touches"],
          ].map(([number, name, detail]) => (
            <a href="/request-demo?product=commerce" key={name}>
              <span>{number}</span>
              <div>
                <h3>{name}</h3>
                <p>{detail}</p>
              </div>
              <ArrowUpRight size={20} />
            </a>
          ))}
        </div>
      </section>
      <section className="qx-foundation">
        <div className="qx-container qx-section">
          <div className="qx-section-heading">
            <p className="qx-eyebrow">04 / A CLEAR PATH TO INTEGRATION</p>
            <div>
              <h2>
                Your experience.
                <br />
                Querix underneath.
              </h2>
              <p>
                Start with the catalog and the journeys you want to support. Connect the right
                service through your backend.
              </p>
            </div>
          </div>
          <div className="qx-foundation-flow">
            <div>
              <Database size={24} />
              <h3>Prepare the catalog</h3>
              <p>
                Map source data, approved fields, and the requirements your experience must respect.
              </p>
            </div>
            <ArrowRight className="qx-flow-arrow" />
            <div>
              <Search size={24} />
              <h3>Connect discovery</h3>
              <p>
                Integrate search or conversation with server-side credentials and explicit access
                rules.
              </p>
            </div>
            <ArrowRight className="qx-flow-arrow" />
            <div>
              <Check size={24} />
              <h3>Validate real journeys</h3>
              <p>
                Review relevant results, follow-ups, and failure states against your own customer
                needs.
              </p>
            </div>
          </div>
          <a className="qx-text-link" href="/developers">
            Read the developer documentation <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <DemoCta />
    </MarketingShell>
  );
}
