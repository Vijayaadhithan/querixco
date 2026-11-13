import { useId, useState } from "react";
import {
  ArrowRight,
  Check,
  MessageCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { CommerceShowcase } from "@/components/landing/CommerceShowcase";
import { ProductCard } from "@/components/commerce/ProductCard";
import {
  DISCOVERY_EXAMPLES,
  type DiscoveryExampleID,
} from "@/features/commerce/discovery-examples";

export function ProductExperience({
  initialMode = "commerce",
}: {
  initialMode?: "search" | "commerce";
}) {
  const [mode, setMode] = useState(initialMode);
  const [scenario, setScenario] = useState<DiscoveryExampleID>("fashion");
  const [refined, setRefined] = useState(false);
  const id = useId();
  const example = DISCOVERY_EXAMPLES[scenario];
  const products = refined ? example.refined : example.initial;
  return (
    <div className="qx-experience">
      <div className="qx-experience-tabs" role="group" aria-label="Product experience">
        <button
          aria-pressed={mode === "search"}
          aria-controls={id}
          onClick={() => setMode("search")}
        >
          <Search size={15} /> Intelligent search
        </button>
        <button
          aria-pressed={mode === "commerce"}
          aria-controls={id}
          onClick={() => setMode("commerce")}
        >
          <MessageCircle size={15} /> Conversation
        </button>
      </div>
      <div id={id}>
        {mode === "commerce" ? (
          <CommerceShowcase />
        ) : (
          <div className="commerce-app qs-preview">
            <div className="qs-heading">
              <strong>Your catalog, understood.</strong>
              <span>Sample search</span>
            </div>
            <div className="qx-search-scenarios" role="group" aria-label="Search example">
              <span>TRY A SEARCH</span>
              {(
                [
                  ["fashion", "Workwear"],
                  ["beauty", "Skincare"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={scenario === key}
                  onClick={() => {
                    setScenario(key);
                    setRefined(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="qs-searchbox qx-query">
              <Search size={17} />
              <span>
                {example.query.replace(
                  `$${example.budget}`,
                  `$${refined ? example.refinedBudget : example.budget}`,
                )}
              </span>
              <ArrowRight size={16} />
            </div>
            <div className="qs-results-heading">
              <span>2 relevant products</span>
              <span>Illustrative catalog</span>
            </div>
            <div className="qx-filter-line">
              <span>
                <Check size={11} />
                {example.preference}
              </span>
              <span>
                <Check size={11} />
                {example.category}
              </span>
              <span>
                <Check size={11} />
                Under ${refined ? example.refinedBudget : example.budget}
              </span>
            </div>
            <div className="qs-products qx-demo-products">
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} sample />
              ))}
            </div>
            <div className="qs-actions">
              <button onClick={() => setRefined(!refined)}>
                <SlidersHorizontal size={14} />
                {refined
                  ? `Reset budget to $${example.budget}`
                  : `Narrow the budget to $${example.refinedBudget}`}
              </button>
              <button aria-label="Restart search example" onClick={() => setRefined(false)}>
                <RotateCcw size={13} />
                Restart
              </button>
            </div>
            <p className="qs-note">
              Sample products and prices. Try a refinement to see the results update.
            </p>
            <span className="qx-sr-only" role="status">
              Showing two {example.label.toLowerCase()} sample products under $
              {refined ? example.refinedBudget : example.budget}.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
