import { ArrowRight, ArrowUpRight, MessageCircle, Search } from "lucide-react";
import { MarketingShell, DemoCta } from "@/components/marketing/MarketingShell";
import { CommerceShowcase } from "./CommerceShowcase";
import { BuyerConfidence } from "./BuyerConfidence";
import { Reveal } from "@/components/Reveal";
import "./landing.css";

export function LandingPage() {
  return (
    <MarketingShell>
      <div className="ql-home">
        <section className="ql-hero qx-container" aria-labelledby="hero-title">
          <div className="ql-hero-copy">
            <h1 id="hero-title">
              The next evolution of <em>e-commerce</em> starts here
            </h1>
            <p className="ql-hero-description">Introducing Interactive Commerce.</p>
            <p className="ql-hero-body">
              What if your online store could interact with customers just like ChatGPT? Instead of
              simply browsing, shoppers could ask questions, refine their needs and compare products
              through conversation.
            </p>
            <p className="ql-hero-context">
              Answers grounded in the product details your catalog provides.
            </p>
          </div>
          <CommerceShowcase brief />
        </section>
        <Reveal>
          <section className="ql-offering qx-container" aria-labelledby="offering-title">
            <div className="ql-offering-heading">
              <p className="qx-eyebrow">TWO WAYS TO CONNECT SHOPPERS TO PRODUCTS</p>
              <h2 id="offering-title">Start with a search. Continue with a conversation.</h2>
            </div>
            <div className="ql-offering-grid">
              {[
                {
                  icon: Search,
                  title: "Intelligent Search",
                  body: "Turn a shopper’s description into relevant catalog results, with filters for their specific requirements.",
                  href: "/products/search",
                  label: "Explore search",
                  number: "01",
                },
                {
                  icon: MessageCircle,
                  title: "Interactive Commerce",
                  body: "Let shoppers ask follow-up questions, adjust a budget and compare products without starting over.",
                  href: "/use-cases/conversational-commerce",
                  label: "Explore the full conversation",
                  number: "02",
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
                    {label} <ArrowUpRight size={16} />
                  </span>
                </a>
              ))}
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section
            id="integration"
            className="ql-connect qx-container"
            aria-labelledby="integration-title"
          >
            <div>
              <p className="qx-eyebrow">CONNECT TO YOUR STOREFRONT</p>
              <h2 id="integration-title">Your experience. Querix behind it.</h2>
            </div>
            <div>
              <p>
                Connect your backend to the search or commerce service. Catalog requirements and
                access depend on the product you choose; the developer guides explain each
                integration.
              </p>
              <a className="qx-text-link" href="/developers">
                See how to integrate <ArrowRight size={15} />
              </a>
            </div>
          </section>
        </Reveal>
        <Reveal>
          <BuyerConfidence />
        </Reveal>
        <DemoCta />
      </div>
    </MarketingShell>
  );
}
