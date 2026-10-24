import { ArrowRight, ArrowUpRight, Check, MessageCircle, MoveDown } from "lucide-react";
import { CommerceHeader } from "./CommerceChrome";
import { SAMPLE_PRODUCTS } from "@/features/commerce/sample";
import "./commerce.css";
export function CommerceUseCase() {
  return (
    <div className="commerce-app commerce-story">
      <CommerceHeader />
      <main>
        <section className="commerce-story-hero">
          <div className="commerce-story-copy">
            <p className="commerce-eyebrow">
              <span /> A QUERIX USE CASE
            </p>
            <h1>
              Good shopping starts with a <em>conversation.</em>
            </h1>
            <p className="commerce-story-intro">
              A little context. A few thoughtful questions. Products that make sense for what your
              customer needs.
            </p>
            <div className="commerce-story-cta">
              <a href="/demo/commerce" className="commerce-button dark">
                Explore the shopping demo <ArrowUpRight size={18} />
              </a>
              <span>Beauty & fashion · No signup for the sample</span>
            </div>
            <div className="commerce-story-tags">
              <span>
                <Check size={14} /> Remembers requirements
              </span>
              <span>
                <Check size={14} /> Keeps budgets separate
              </span>
            </div>
          </div>
          <div className="commerce-story-preview">
            <div className="commerce-preview-top">
              <span>
                <span className="commerce-status-dot" /> THE SHOPPING COMPANION
              </span>
              <span>Sample walkthrough</span>
            </div>
            <div className="commerce-preview-user">A moisturizer for dry skin under $30</div>
            <div className="commerce-preview-response">
              <span className="commerce-avatar">q</span>
              <p>
                A few options to start with.
                <br />
                <strong>Let’s find your everyday favorite.</strong>
              </p>
            </div>
            <div className="commerce-preview-products">
              {SAMPLE_PRODUCTS.slice(0, 2).map((product) => (
                <div key={product.product_id}>
                  <img
                    src={product.image_urls?.[0]}
                    alt={`Sample illustration: ${product.title}`}
                  />
                  <p>{product.brand?.value}</p>
                  <h3>{product.title}</h3>
                  <span>${product.price.amount}</span>
                </div>
              ))}
            </div>
            <div className="commerce-preview-followup">
              <MessageCircle size={15} /> “Under $20 instead” <ArrowRight size={16} />
            </div>
            <p className="commerce-preview-disclaimer">
              Fictional products and prices, shown to illustrate the experience.
            </p>
          </div>
        </section>
        <div className="commerce-story-strip">
          <span>From a vague idea</span>
          <ArrowRight />
          <span>To clear requirements</span>
          <ArrowRight />
          <span>To relevant choices</span>
        </div>
        <section className="commerce-story-section">
          <div>
            <p className="commerce-eyebrow">LESS SEARCHING. MORE UNDERSTANDING.</p>
            <h2>
              The next question
              <br />
              makes the difference.
            </h2>
            <p className="commerce-story-intro">
              Shopping rarely happens in a single search. Querix carries context through the
              conversation, so customers can keep moving forward.
            </p>
          </div>
          <ol className="commerce-story-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Start with what matters</h3>
                <p>
                  “I have dry skin.” The live assistant can ask for missing context before
                  suggesting products.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Refine without starting over</h3>
                <p>
                  “Under $20 instead.” Change the budget while preserving the other saved
                  requirements.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Make room for another need</h3>
                <p>
                  “I also need shampoo.” Keep each product’s preferences, budget, and results
                  together.
                </p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>Understand the options</h3>
                <p>
                  Compare supplied listing attributes and read why a product was recommended.
                  Missing facts stay unknown.
                </p>
              </div>
            </li>
          </ol>
        </section>
        <section className="commerce-story-bottom">
          <div>
            <p className="commerce-eyebrow">TAKE IT FOR A CONVERSATION</p>
            <h2>
              Your next discovery
              <br />
              is a message away.
            </h2>
            <p>Explore the sample experience, or connect the live commerce catalog.</p>
          </div>
          <a href="/demo/commerce" className="commerce-button dark">
            Try the shopping companion <ArrowUpRight size={18} />
          </a>
          <MoveDown className="commerce-bottom-decoration" size={90} />
        </section>
      </main>
      <footer className="commerce-footer">
        <span>Querix · Conversational commerce</span>
        <p>
          Sample content is illustrative. Live catalog prices are historical USD; current stock and
          suitability are not verified.
        </p>
        <a href="/developers">
          Explore the platform <ArrowUpRight size={13} />
        </a>
      </footer>
    </div>
  );
}
