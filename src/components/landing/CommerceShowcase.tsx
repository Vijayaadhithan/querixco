import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  FlaskConical,
  Pause,
  Play,
  RotateCcw,
  Shirt,
  ShoppingBag,
  X,
} from "lucide-react";
import { Brand } from "@/components/marketing/Brand";
import { SAMPLE_PRODUCTS } from "@/features/commerce/sample";
import { attributeText, productPrice, type Product } from "@/features/commerce/model";
import { usePreviewPlayback } from "./use-preview-playback";

const sampleProducts = (ids: string[]) => SAMPLE_PRODUCTS.filter((p) => ids.includes(p.product_id));
const examples = {
  fashion: {
    label: "Fashion",
    icon: Shirt,
    query: "A cotton shirt for work under $40",
    budget: 40,
    refinedBudget: 30,
    preference: "Cotton",
    category: "Shirts",
    initial: sampleProducts(["sample:f1", "sample:f2"]),
    refined: sampleProducts(["sample:f2", "sample:f3"]),
    answer: "Two cotton shirts, both within your budget.",
    kept: "Cotton preference kept.",
    fields: [
      ["color", "Colour"],
      ["material", "Material"],
    ],
    explanation: "Category, material and budget become clear product requirements.",
  },
  beauty: {
    label: "Beauty",
    icon: FlaskConical,
    query: "A fragrance-free moisturizer under $30",
    budget: 30,
    refinedBudget: 20,
    preference: "Fragrance-free",
    category: "Moisturizer",
    initial: sampleProducts(["sample:m1", "sample:m2"]),
    refined: sampleProducts(["sample:m4", "sample:m5"]),
    answer: "Two fragrance-free options, within your budget.",
    kept: "Fragrance-free preference kept.",
    fields: [
      ["skin_type", "Skin type"],
      ["volume", "Volume"],
    ],
    explanation: "Product type, preferences and budget become clear product requirements.",
  },
} as const;

export function CommerceShowcase() {
  const dialog = useRef<HTMLDialogElement>(null);
  const { preview, canAdvance } = usePreviewPlayback();
  const [scenario, setScenario] = useState<keyof typeof examples>("fashion");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [replay, setReplay] = useState(0);
  const example = examples[scenario];
  const activePlayback = playing && step < 2;
  const refined = step > 0;
  const products = refined ? example.refined : example.initial;

  useEffect(() => {
    if (!canAdvance || !playing || step >= 2 || selected) return;
    const timer = window.setTimeout(() => setStep((value) => Math.min(value + 1, 2)), 6500);
    return () => window.clearTimeout(timer);
  }, [canAdvance, playing, step, selected, replay]);

  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);
  function advance(value: number) {
    setStep(value);
    setPlaying(false);
  }

  return (
    <div ref={preview} className="ql-showcase" id="commerce-preview" tabIndex={-1}>
      <div className="ql-preview-caption">
        <span>
          <i /> INTERACTIVE PREVIEW
        </span>
        <span>Sample catalogue</span>
      </div>
      <div className="ql-scenario-switch" role="group" aria-label="Shopping example">
        <span>Try your industry</span>
        {Object.entries(examples).map(([key, { label, icon: Icon }]) => (
          <button
            key={key}
            aria-pressed={scenario === key}
            onClick={() => {
              setScenario(key as keyof typeof examples);
              setStep(0);
              setPlaying(false);
              setReplay(replay + 1);
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
      <div className="ql-storefront">
        <div className="ql-storefront-header">
          <ShoppingBag size={17} />
          <strong>The everyday store</strong>
          <span>
            Powered by <Brand light />
          </span>
        </div>
        <div className="ql-conversation">
          <div className="ql-shopper">
            <span>{example.query}</span>
            <span className="ql-avatar">You</span>
          </div>
          <div className="ql-assistant">
            <Brand markOnly />
            <p>{refined ? `Budget updated. ${example.kept}` : example.answer}</p>
          </div>
          <div className="ql-filter-chips">
            <span>
              <Check size={11} />
              {example.preference}
            </span>
            <span>
              <Check size={11} />
              {example.category}
            </span>
            <span className={refined ? "is-changed" : ""}>
              <Check size={11} />
              Under ${refined ? example.refinedBudget : example.budget}
            </span>
          </div>
          <div className="ql-product-area">
            {step === 2 ? (
              <PreviewComparison
                products={products}
                fields={example.fields}
                onSelect={(p) => {
                  setSelected(p);
                  setPlaying(false);
                }}
              />
            ) : (
              <div className="ql-product-grid" key={`${scenario}-${refined}-${replay}`}>
                {products.map((p) => (
                  <button
                    className="ql-product"
                    key={p.product_id}
                    onClick={() => {
                      setSelected(p);
                      setPlaying(false);
                    }}
                    aria-label={`View ${p.title}`}
                  >
                    <div className="ql-product-art">
                      <img src={p.image_urls?.[0]} alt={p.title} width="280" height="280" />
                      <span>{example.preference}</span>
                    </div>
                    <div className="ql-product-info">
                      <span>{p.brand?.value}</span>
                      <h3>{p.title}</h3>
                      <div>
                        <strong>{productPrice(p)}</strong>
                        <span>
                          Details <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ql-stage-feedback">
            <div className="ql-journey-feedback" key={`${scenario}-${step}`}>
              <span>
                <Check size={14} />
                {step === 0
                  ? "Understands the request"
                  : step === 1
                    ? "Keeps the context"
                    : "Makes the details clear"}
              </span>
              <p>
                {step === 0
                  ? example.explanation
                  : step === 1
                    ? `“Keep it under $${example.refinedBudget} instead.” ${example.kept}`
                    : `Compare supplied attributes side by side. ${example.kept}`}
              </p>
            </div>
          </div>
          <div className="ql-prompt">
            <span>Try the next step</span>
            <button onClick={() => advance(step === 0 ? 1 : step === 1 ? 2 : 0)}>
              {step === 0
                ? `Keep it under $${example.refinedBudget}`
                : step === 1
                  ? "Compare these two"
                  : "Start again"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="ql-showcase-bottom">
          <div className="ql-steps" role="group" aria-label="Shopping journey">
            {["Discover", "Refine", "Compare"].map((label, i) => (
              <button key={label} aria-pressed={step === i} onClick={() => advance(i)}>
                <span>{i + 1}</span>
                {label}
              </button>
            ))}
          </div>
          <div className="ql-player">
            <button
              aria-label={activePlayback ? "Pause preview" : "Play preview"}
              aria-pressed={activePlayback}
              onClick={() => {
                if (step === 2) setStep(0);
                setPlaying(!activePlayback);
              }}
            >
              {activePlayback ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              aria-label="Restart preview"
              onClick={() => {
                setStep(0);
                setPlaying(false);
                setReplay(replay + 1);
              }}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
        {selected && (
          <dialog
            ref={dialog}
            className="ql-product-detail"
            aria-label="Sample product details"
            onClose={() => setSelected(null)}
          >
            <button
              className="ql-detail-close"
              onClick={() => dialog.current?.close()}
              aria-label="Close product details"
              autoFocus
            >
              <X size={18} />
            </button>
            <img src={selected.image_urls?.[0]} alt={selected.title} width="280" height="280" />
            <p className="qx-eyebrow">SAMPLE CATALOGUE</p>
            <h3>{selected.title}</h3>
            <strong>{productPrice(selected)}</strong>
            <dl>
              {Object.entries(selected.attributes).map(([key, value]) => (
                <div key={key}>
                  <dt>{key.replaceAll("_", " ")}</dt>
                  <dd>{attributeText(value?.value)}</dd>
                </div>
              ))}
            </dl>
            <button className="qx-button" onClick={() => dialog.current?.close()}>
              Back to discovery <ArrowRight size={15} />
            </button>
          </dialog>
        )}
      </div>
      <div className="ql-preview-note">
        <span>Illustrative products and prices.</span>
        <a href="/commerce/login">
          Open live demo <ArrowRight size={12} />
        </a>
      </div>
      <span className="qx-sr-only" role="status">
        {example.label} preview.{" "}
        {step === 0
          ? `Two products under $${example.budget}.`
          : step === 1
            ? `Budget updated. Two products under $${example.refinedBudget}. ${example.kept}`
            : `Comparison of two products under $${example.refinedBudget} displayed.`}
      </span>
    </div>
  );
}

function PreviewComparison({
  products,
  fields,
  onSelect,
}: {
  products: readonly Product[];
  fields: readonly (readonly [string, string])[];
  onSelect: (p: Product) => void;
}) {
  return (
    <div className="ql-comparison" role="table" aria-label="Product comparison">
      <div role="row">
        <span role="columnheader">Compare</span>
        {products.map((p) => (
          <strong key={p.product_id} role="columnheader">
            <button aria-label={`View ${p.title}`} onClick={() => onSelect(p)}>
              {p.title}
              <ChevronRight size={12} />
            </button>
          </strong>
        ))}
      </div>
      <div role="row">
        <span role="rowheader">Price</span>
        {products.map((p) => (
          <span key={p.product_id} role="cell">
            {productPrice(p)}
          </span>
        ))}
      </div>
      {fields.map(([field, label]) => (
        <div role="row" key={field}>
          <span role="rowheader">{label}</span>
          {products.map((p) => (
            <span key={p.product_id} role="cell">
              {attributeText(p.attributes[field]?.value)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
