import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { Brand } from "@/components/marketing/Brand";
import { ProductCard } from "@/components/commerce/ProductCard";
import {
  DISCOVERY_EXAMPLES,
  type DiscoveryExampleID,
} from "@/features/commerce/discovery-examples";
import { attributeText, productPrice, type Product } from "@/features/commerce/model";
import { usePreviewPlayback } from "./use-preview-playback";
import "@/components/commerce/commerce.css";
import "./commerce-preview.css";

const WAIT = 3200;
const TYPE = 1600;
const THINK = 700;
const TURN_DURATION = WAIT + TYPE + THINK;

export function CommerceShowcase() {
  const dialog = useRef<HTMLDialogElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const followTail = useRef(true);
  const { preview, canAdvance, reducedMotion } = usePreviewPlayback();
  const [scenario, setScenario] = useState<DiscoveryExampleID>("fashion");
  const [revealed, setRevealed] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [away, setAway] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const example = DISCOVERY_EXAMPLES[scenario];
  const prompts = [example.query, `Keep it under $${example.refinedBudget}`, "Compare these two"];
  const replies = [example.answer, example.refinement, example.comparison];
  const complete = revealed === prompts.length;
  const typing = !complete && elapsed >= WAIT && elapsed < WAIT + TYPE;
  const thinking = !complete && elapsed >= WAIT + TYPE;
  const draft = typing
    ? prompts[revealed].slice(0, Math.ceil(((elapsed - WAIT) / TYPE) * prompts[revealed].length))
    : "";

  useEffect(() => {
    if (!canAdvance || !playing || complete || selected) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 40), 40);
    return () => window.clearInterval(timer);
  }, [canAdvance, playing, complete, selected]);

  useEffect(() => {
    if (elapsed < TURN_DURATION) return;
    setRevealed((value) => Math.min(value + 1, prompts.length));
    setElapsed(0);
  }, [elapsed, prompts.length]);

  useEffect(() => {
    if (followTail.current) thread.current?.scrollTo?.({ top: thread.current.scrollHeight });
  }, [revealed, thinking]);

  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);

  function sendNext() {
    if (complete) return;
    setPlaying(false);
    setRevealed((value) => Math.min(value + 1, prompts.length));
    setElapsed(0);
  }
  function reset(nextScenario = scenario, autoplay = false) {
    const animate = autoplay && !reducedMotion;
    setScenario(nextScenario);
    setRevealed(animate ? 0 : 1);
    setPlaying(animate);
    setElapsed(animate ? WAIT : 0);
    followTail.current = true;
    setAway(false);
    if (!animate) thread.current?.scrollTo?.({ top: 0 });
  }
  function showDetails(product: Product) {
    setSelected(product);
    setPlaying(false);
  }

  return (
    <div ref={preview} className="commerce-app qc-preview" id="commerce-preview" tabIndex={-1}>
      <div className="qc-caption">
        <span>THE COMMERCE EXPERIENCE</span>
        <span>Guided sample</span>
      </div>
      <div className="qc-window">
        <header className="qc-header">
          <div>
            <Brand light markOnly />
            <span>
              <strong>Shopping with Querix</strong>
              <small>Your catalog, in conversation</small>
            </span>
          </div>
          <div className="qc-playback">
            {!reducedMotion && (
              <button
                type="button"
                aria-label={playing && !complete ? "Pause preview" : "Play preview"}
                aria-pressed={playing && !complete}
                onClick={() => {
                  if (complete) reset(scenario, true);
                  else setPlaying(!playing);
                }}
              >
                {playing && !complete ? <Pause size={14} /> : <Play size={14} />}
              </button>
            )}
            <button type="button" aria-label="Restart preview" onClick={() => reset()}>
              <RotateCcw size={14} />
            </button>
          </div>
        </header>
        <div className="qc-examples" role="group" aria-label="Shopping example">
          <span>Explore a conversation</span>
          {Object.entries(DISCOVERY_EXAMPLES).map(([key, item]) => (
            <button
              key={key}
              type="button"
              aria-pressed={scenario === key}
              onClick={() => reset(key as DiscoveryExampleID)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          ref={thread}
          className="qc-thread"
          role="log"
          aria-label="Sample shopping conversation"
          aria-live="off"
          onScroll={() => {
            const node = thread.current;
            if (!node) return;
            followTail.current = node.scrollHeight - node.scrollTop - node.clientHeight < 60;
            setAway(!followTail.current);
          }}
          onLoadCapture={() => {
            if (followTail.current)
              thread.current?.scrollTo?.({ top: thread.current.scrollHeight });
          }}
        >
          {prompts.slice(0, revealed).map((prompt, index) => (
            <section className="qc-turn" data-turn={index} key={`${scenario}-${index}`}>
              <div className="qc-user">
                <span className="qx-sr-only">You: </span>
                {prompt}
              </div>
              <div className="qc-reply">
                <span className="qc-avatar">
                  <Brand light markOnly />
                </span>
                <div>
                  <p>{replies[index]}</p>
                  {index < 2 ? (
                    <>
                      <div className="qc-preferences">
                        <span>
                          <Check size={10} />
                          {example.preference}
                        </span>
                        <span>Under ${index === 0 ? example.budget : example.refinedBudget}</span>
                      </div>
                      <div className="qc-products">
                        {(index === 0 ? example.initial : example.refined).map((product) => (
                          <ProductCard
                            key={product.product_id}
                            product={product}
                            sample
                            onDetails={() => showDetails(product)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <PreviewComparison
                      products={example.refined}
                      fields={example.fields}
                      onSelect={showDetails}
                    />
                  )}
                </div>
              </div>
            </section>
          ))}
          {thinking && (
            <section className="qc-turn qc-incoming">
              <div className="qc-user">{prompts[revealed]}</div>
              <div className="qc-reply">
                <span className="qc-avatar">
                  <Brand light markOnly />
                </span>
                <span className="qc-typing" role="status" aria-label="Querix is preparing a reply">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </section>
          )}
        </div>
        <div className="qc-composer-dock">
          {away && (
            <button
              type="button"
              className="qc-jump"
              aria-label="Jump to latest example"
              onClick={() => {
                followTail.current = true;
                setAway(false);
                thread.current?.scrollTo?.({
                  top: thread.current.scrollHeight,
                  behavior: "smooth",
                });
              }}
            >
              <ArrowDown size={14} /> Latest message
            </button>
          )}
          {!complete && (
            <button type="button" className="qc-suggestion" onClick={sendNext}>
              {prompts[revealed]}
              <ChevronRight size={13} />
            </button>
          )}
          <form
            className="qc-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendNext();
            }}
          >
            <output className={typing ? "is-typing" : ""} aria-label="Next guided shopping message">
              {complete
                ? "Try another example, or explore your own catalog."
                : thinking
                  ? "Querix is replying…"
                  : draft || "Choose a suggested follow-up…"}
            </output>
            {complete ? (
              <button
                type="button"
                aria-label="Replay conversation"
                onClick={() => reset(scenario, true)}
              >
                <RotateCcw size={15} />
              </button>
            ) : (
              <button type="submit" aria-label="Send next example">
                <ArrowUp size={16} />
              </button>
            )}
          </form>
          <p className="qc-guidance">Guided example · Sample products and prices</p>
        </div>
      </div>
      <div className="qc-footer">
        <span>Discover. Refine. Compare.</span>
        <a href="/commerce/login">
          Try the live demo <ArrowUpRight size={12} />
        </a>
      </div>
      <span className="qx-sr-only" role="status">
        {example.label} example. {revealed} of 3 replies shown.
        {revealed > 1 ? ` ${example.preference} preference kept.` : ""}
      </span>
      {selected && (
        <dialog
          ref={dialog}
          className="qc-detail"
          aria-label="Sample product details"
          onClose={() => setSelected(null)}
        >
          <button
            type="button"
            className="qc-detail-close"
            aria-label="Close product details"
            onClick={() => dialog.current?.close()}
            autoFocus
          >
            <X size={18} />
          </button>
          <ProductCard product={selected} sample details />
          <button type="button" className="qc-detail-back" onClick={() => dialog.current?.close()}>
            Back to the conversation
          </button>
        </dialog>
      )}
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
  onSelect: (product: Product) => void;
}) {
  return (
    <div className="qc-comparison-wrap">
      <table className="qc-comparison">
        <caption className="qx-sr-only">Product comparison</caption>
        <thead>
          <tr>
            <th scope="col">Compare</th>
            {products.map((product) => (
              <th scope="col" key={product.product_id}>
                <button
                  type="button"
                  onClick={() => onSelect(product)}
                  aria-label={`View ${product.title}`}
                >
                  {product.title}
                  <ChevronRight size={12} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Price</th>
            {products.map((product) => (
              <td key={product.product_id}>{productPrice(product)}</td>
            ))}
          </tr>
          {fields.map(([field, label]) => (
            <tr key={field}>
              <th scope="row">{label}</th>
              {products.map((product) => (
                <td key={product.product_id}>{attributeText(product.attributes[field]?.value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
