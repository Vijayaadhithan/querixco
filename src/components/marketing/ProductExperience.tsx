import { useId, useState } from "react";
import {
  ArrowRight,
  Check,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Brand } from "./Brand";

const examples = {
  workwear: {
    label: "Workwear",
    query: "A cotton shirt for work under $40",
    budget: 40,
    refinedBudget: 30,
    filters: ["Cotton", "Workwear"],
    detail: "Cotton · Regular fit",
    answer: "Let’s start with these cotton shirts. Both fit your budget.",
    original: [
      { name: "Everyday Oxford", price: "$28", image: "shirt" },
      { name: "Relaxed cotton shirt", price: "$38", image: "shirt-sand" },
    ],
    refined: [
      { name: "Everyday Oxford", price: "$28", image: "shirt" },
      { name: "Cotton weekend shirt", price: "$26", image: "shirt-sand" },
    ],
  },
  skincare: {
    label: "Skincare",
    query: "A fragrance-free moisturizer under $30",
    budget: 30,
    refinedBudget: 20,
    filters: ["Moisturizer", "Fragrance-free"],
    detail: "Fragrance-free · 50 ml",
    answer: "Two fragrance-free options within your budget.",
    original: [
      { name: "Daily barrier cream", price: "$24", image: "quiet-cream" },
      { name: "Everyday moisture", price: "$28", image: "simple-lotion" },
    ],
    refined: [
      { name: "Simple daily lotion", price: "$18", image: "simple-lotion" },
      { name: "Quiet moisture cream", price: "$19", image: "quiet-cream" },
    ],
  },
};

export function ProductExperience({
  initialMode = "commerce",
}: {
  initialMode?: "search" | "commerce";
}) {
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(0);
  const [scenario, setScenario] = useState<keyof typeof examples>("workwear");
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(false);
  const id = useId();
  const example = examples[mode === "commerce" ? "workwear" : scenario];
  const refined = step >= 1;
  const products = refined ? example.refined : example.original;
  const animationKey = `${mode}-${scenario}-${step}-${replay}`;
  return (
    <div className="qx-experience" data-paused={paused}>
      <div className="qx-experience-label">
        <span>
          <span className="qx-live-dot" /> THE QUERIX EXPERIENCE
        </span>
        <span>Illustrative walkthrough</span>
      </div>
      <div className="qx-experience-tabs" role="group" aria-label="Product experience">
        <button
          aria-pressed={mode === "search"}
          aria-controls={id}
          onClick={() => {
            setMode("search");
            setStep(0);
          }}
        >
          <Search size={15} /> Intelligent search
        </button>
        <button
          aria-pressed={mode === "commerce"}
          aria-controls={id}
          onClick={() => {
            setMode("commerce");
            setStep(0);
          }}
        >
          <MessageCircle size={15} /> Conversation
        </button>
      </div>
      {mode === "search" && (
        <div className="qx-search-scenarios" role="group" aria-label="Search example">
          <span>TRY A SEARCH</span>
          {Object.entries(examples).map(([key, item]) => (
            <button
              key={key}
              aria-pressed={scenario === key}
              onClick={() => {
                setScenario(key as keyof typeof examples);
                setStep(0);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <div className="qx-demo-window" id={id}>
        <div className="qx-demo-window-top">
          <Brand markOnly />
          <span>YOUR STOREFRONT</span>
          <span className="qx-window-dots">•••</span>
        </div>
        <div className="qx-demo-content">
          <div className="qx-demo-sequence" key={animationKey}>
            <div className={mode === "search" ? "qx-query" : "qx-message-user"}>
              {mode === "search" && <Search size={17} />}
              <span className="qx-query-text">{example.query}</span>
            </div>
            {mode === "search" && (
              <div className="qx-search-process" aria-hidden="true">
                <span>Understand</span>
                <i />
                <span>Match</span>
                <i />
                <span>Rank</span>
              </div>
            )}
            <div className="qx-demo-answer">
              <span className="qx-answer-mark">q</span>
              <p>{mode === "commerce" ? example.answer : "Matching the details that matter."}</p>
            </div>
            <div className="qx-filter-line">
              {example.filters.map((filter) => (
                <span key={filter}>
                  <Check size={11} />
                  {filter}
                </span>
              ))}
              <span>
                <Check size={11} /> Under ${refined ? example.refinedBudget : example.budget}
              </span>
            </div>
            <div className="qx-demo-products">
              {products.map((product) => (
                <article key={product.name}>
                  <div className="qx-product-image">
                    <img
                      src={`/commerce/${product.image}.svg`}
                      alt={`Illustration of ${product.name}`}
                      width="280"
                      height="280"
                    />
                    <span>CATALOG MATCH</span>
                  </div>
                  <div className="qx-product-details">
                    <p>THE EVERYDAY EDIT</p>
                    <h3>{product.name}</h3>
                    <div>
                      <span>{example.detail}</span>
                      <strong>{product.price}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          {mode === "commerce" ? (
            <div className="qx-followup-area">
              {step === 0 ? (
                <button onClick={() => setStep(1)}>
                  Keep it under $30 instead <ArrowRight size={15} />
                </button>
              ) : (
                <>
                  <p className="qx-refinement">
                    <Check size={14} /> Budget updated. Cotton and workwear preferences kept.
                  </p>
                  {step === 1 ? (
                    <button onClick={() => setStep(2)}>
                      Compare these two <ArrowRight size={15} />
                    </button>
                  ) : (
                    <div className="qx-mini-comparison">
                      <div>
                        <strong>Everyday Oxford</strong>
                        <span>$28 · Structured collar</span>
                      </div>
                      <div>
                        <strong>Cotton weekend shirt</strong>
                        <span>$26 · Relaxed collar</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="qx-followup-area">
              <button onClick={() => setStep(refined ? 0 : 1)}>
                <SlidersHorizontal size={14} />
                {refined
                  ? `Reset budget to $${example.budget}`
                  : `Narrow the budget to $${example.refinedBudget}`}
                <ArrowRight size={15} />
              </button>
            </div>
          )}
          <span className="qx-sr-only" role="status">
            {refined
              ? `Budget is under $${example.refinedBudget}. ${step === 2 ? "Comparison displayed." : "Two matching products displayed."}`
              : `Showing two illustrative ${example.label.toLowerCase()} products under $${example.budget}.`}
          </span>
        </div>
      </div>
      <div className="qx-experience-foot">
        <span>Sample products & prices. No live AI request.</span>
        <div className="qx-motion-controls">
          <button
            className="qx-pause-motion"
            aria-pressed={paused}
            aria-label={paused ? "Resume walkthrough animation" : "Pause walkthrough animation"}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={() => {
              setStep(0);
              setReplay(replay + 1);
            }}
          >
            <RotateCcw size={12} />
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
