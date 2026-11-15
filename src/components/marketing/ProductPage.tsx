import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Footprints,
  MessageCircle,
  Search,
  Watch,
} from "lucide-react";
import { MarketingShell, DemoCta } from "./MarketingShell";
import { ProductExperience } from "./ProductExperience";
import { CommerceShowcase } from "@/components/landing/CommerceShowcase";
import "@/components/landing/landing.css";

export function ProductPage({ product }: { product: "search" | "commerce" }) {
  const commerce = product === "commerce";
  const features = commerce
    ? [
        [
          "Remember the requirements",
          "A lower budget doesn’t have to mean starting again. Keep the fabric, style or other preferences already discussed.",
        ],
        [
          "Keep different needs separate",
          "Ask for shampoo under $15 and moisturizer under $25. Each product need keeps its own budget and preferences.",
        ],
        [
          "Explain and compare",
          "Compare the details listed for the products in front of you. When an attribute is missing, the answer stays unknown.",
        ],
        [
          "Continue the conversation",
          "Signed-in testers can revisit saved conversations, start a new chat, or explicitly delete an existing one.",
        ],
      ]
    : [
        [
          "Understand the intent",
          "Handle natural-language descriptions, vague wording, typos, and multilingual searches alongside exact product terms.",
        ],
        [
          "Respect explicit constraints",
          "Keep stated filters such as category, price, location, and listing type authoritative. Inferred preferences help guide ranking.",
        ],
        [
          "Balance meaning and precision",
          "Combine semantic and lexical retrieval, then rank relevant candidates for the customer’s request.",
        ],
        [
          "Integrate through your backend",
          "Use the tenant-scoped API with server-side credentials, cursor pagination, and documented response and error contracts.",
        ],
      ];
  return (
    <MarketingShell active={commerce ? "/use-cases/conversational-commerce" : "/products/search"}>
      <section className="qx-container qx-hero qx-product-hero">
        <div className="qx-hero-copy">
          <p className="qx-eyebrow">
            {commerce ? <MessageCircle size={15} /> : <Search size={15} />}
            {commerce ? "INTERACTIVE COMMERCE" : "INTELLIGENT SEARCH"}
          </p>
          <h1>
            {commerce ? (
              <>
                A conversation that
                <br />
                <em>moves shopping forward.</em>
              </>
            ) : (
              <>
                Their words.
                <br />
                <em>The right discovery.</em>
              </>
            )}
          </h1>
          <p className="qx-hero-body">
            {commerce
              ? "Watch a shopper narrow a skincare budget, keep a fragrance-free preference and compare the resulting choices. Then switch to the clothing example to try another conversation."
              : "Connect the meaning behind a customer’s search to relevant inventory. Support natural language and precise requirements in the same experience."}
          </p>
          <div className="qx-actions">
            <a className="qx-button" href={`/request-demo?product=${product}`}>
              Request a demo <ArrowUpRight size={16} />
            </a>
          </div>
          <a
            className="qx-text-link qx-secondary-link"
            href={commerce ? "/commerce/login" : "/developers/integration"}
          >
            {commerce ? "Already have demo access? Sign in" : "Read the integration guide"}
            <ArrowRight size={15} />
          </a>
        </div>
        <div className={commerce ? "ql-commerce-stage" : "qx-hero-stage"}>
          {commerce ? <CommerceShowcase initialScenario="beauty" /> : <ProductExperience />}
        </div>
      </section>
      <section className="qx-section qx-container">
        <div className="qx-section-heading">
          <p className="qx-eyebrow">DESIGNED AROUND THE SHOPPER</p>
          <div>
            <h2>
              {commerce ? (
                <>
                  More context.
                  <br />
                  More useful choices.
                </>
              ) : (
                <>
                  Flexible language.
                  <br />
                  Precise requirements.
                </>
              )}
            </h2>
            <p>
              {commerce
                ? "From a first idea to a specific comparison, give every follow-up a useful role in the shopping journey."
                : "Let shoppers describe their needs in their own words, while keeping your catalog rules explicit."}
            </p>
          </div>
        </div>
        <div className="qx-feature-grid">
          {features.map(([title, body], index) => (
            <article key={title}>
              <span className="qx-step-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      {commerce ? (
        <section id="storefronts" className="qx-journey">
          <div className="qx-container qx-section">
            <p className="qx-eyebrow">EXPLORE THE COMMERCE DEMO</p>
            <h2>
              Different catalogs.
              <br />
              Specific conversations.
            </h2>
            <div className="qx-storefront-grid">
              {[
                ["Clothing", "“A cotton shirt for work under $40.”", "shirt"],
                [
                  "Beauty & personal care",
                  "“Shampoo under $15 and moisturizer under $25.”",
                  "quiet-cream",
                ],
                ["Footwear", "“Show me running shoes under $60.”", null],
                ["Fashion accessories", "“A crossbody bag under $40.”", null],
              ].map(([title, quote, asset], index) => (
                <article key={title}>
                  <span className="qx-storefront-index">0{index + 1} / STOREFRONT</span>
                  {asset ? (
                    <img
                      src={`/commerce/${asset}.svg`}
                      width="150"
                      height="150"
                      alt={`${title} sample illustration`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="qx-type-art" aria-hidden="true">
                      {index === 2 ? (
                        <Footprints size={66} strokeWidth={1} />
                      ) : (
                        <Watch size={66} strokeWidth={1} />
                      )}
                    </div>
                  )}
                  <h3>{title}</h3>
                  <p>{quote}</p>
                </article>
              ))}
            </div>
            <p className="qx-small-note">
              The live demo requires an approved account. Its catalog contains historical product
              metadata; current prices, stock, and variant availability are not verified.
            </p>
            <a className="qx-text-link" href="/request-demo?product=commerce">
              Request access to the live demo <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
      ) : (
        <section className="qx-journey">
          <div className="qx-container qx-section qx-catalog-section">
            <div>
              <p className="qx-eyebrow">A CONTRACT YOUR TEAM CAN BUILD ON</p>
              <h2>
                Intelligence inside.
                <br />
                Clarity at the boundary.
              </h2>
            </div>
            <div className="qx-contract-list">
              {[
                "Tenant-scoped access and approved response fields",
                "Explicit filters and cursor-based pagination",
                "Documented health checks and failure behavior",
              ].map((item) => (
                <p key={item}>
                  <Check size={18} />
                  {item}
                </p>
              ))}
              <a className="qx-text-link" href="/developers/integration">
                Explore the API contract <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>
      )}
      <section className="qx-container qx-section qx-related">
        <div>
          <p className="qx-eyebrow">
            {commerce ? "FOR YOUR ENGINEERING TEAM" : "KEEP THE DISCOVERY GOING"}
          </p>
          <h2>
            {commerce ? "A clear conversation lifecycle." : "Some searches need a follow-up."}
          </h2>
          <p>
            {commerce
              ? "Review session ownership, saved preferences, streaming, and the current demo boundaries before planning an integration."
              : "Add a conversation when customers need to refine a requirement or understand the options in front of them."}
          </p>
        </div>
        <a
          className="qx-button qx-button-outline"
          href={commerce ? "/developers/commerce" : "/use-cases/conversational-commerce"}
        >
          {commerce ? "Commerce integration" : "Explore interactive commerce"}
          <ArrowUpRight size={16} />
        </a>
      </section>
      <DemoCta product={product} />
    </MarketingShell>
  );
}
