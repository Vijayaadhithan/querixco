import { useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  GitCompareArrows,
  SlidersHorizontal,
  Sparkles,
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
import {
  advanceConversation,
  choiceLabel,
  startConversation,
  type GuidedAction,
  type GuidedConversation,
} from "./guided-conversation";
import "@/components/commerce/commerce.css";
import "./commerce-preview.css";

type PreviewState = {
  conversation: GuidedConversation;
  pending: GuidedConversation | null;
  playing: boolean;
  elapsed: number;
};
type PreviewAction =
  | { type: "tick"; brief: boolean }
  | { type: "choose"; action: GuidedAction; instant: boolean }
  | { type: "commit" }
  | { type: "pause" }
  | { type: "toggle" }
  | { type: "reset"; scenario: DiscoveryExampleID; autoplay?: boolean };

function previewReducer(state: PreviewState, action: PreviewAction): PreviewState {
  if (action.type === "reset")
    return {
      conversation: startConversation(action.scenario),
      pending: null,
      playing: Boolean(action.autoplay),
      elapsed: 0,
    };
  if (action.type === "pause") return { ...state, playing: false };
  if (action.type === "toggle") return { ...state, playing: !state.playing };
  if (action.type === "commit")
    return state.pending
      ? { ...state, conversation: state.pending, pending: null, elapsed: 0 }
      : state;
  if (action.type === "choose") {
    if (state.pending) return state;
    const next = advanceConversation(state.conversation, action.action);
    return {
      ...state,
      playing: false,
      elapsed: 0,
      conversation: action.instant ? next : state.conversation,
      pending: action.instant || next === state.conversation ? null : next,
    };
  }
  if (!state.playing || state.pending) return state;
  const elapsed = state.elapsed + 100;
  if (elapsed < 3800) return { ...state, elapsed };
  const nextAction = state.conversation.narrowed ? "compare" : "budget";
  const pending = advanceConversation(state.conversation, nextAction);
  if (pending === state.conversation) return { ...state, playing: false, elapsed: 0 };
  return { ...state, pending, elapsed: 0, playing: !action.brief && nextAction !== "compare" };
}

export function CommerceShowcase({
  brief = false,
  initialScenario = "fashion",
}: {
  brief?: boolean;
  initialScenario?: DiscoveryExampleID;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const followTail = useRef(true);
  const { preview, canAdvance, reducedMotion } = usePreviewPlayback();
  const [{ conversation, pending, playing }, dispatch] = useReducer(previewReducer, {
    conversation: startConversation(initialScenario),
    pending: null,
    playing: true,
    elapsed: 0,
  });
  const [away, setAway] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const { scenario, turns, narrowed, preferred } = conversation;
  const example = DISCOVERY_EXAMPLES[scenario];
  const latest = turns.at(-1)!;
  const choices: GuidedAction[] = [
    ...(!narrowed ? ["budget" as const] : []),
    ...(!preferred ? ["preference" as const] : []),
    ...(!latest.comparison && latest.products.length > 1 ? ["compare" as const] : []),
  ];
  const canPlay = !narrowed || (!brief && !latest.comparison && latest.products.length > 1);

  useEffect(() => {
    if (!canAdvance || !playing || pending || selected) return;
    const timer = window.setInterval(() => dispatch({ type: "tick", brief }), 100);
    return () => window.clearInterval(timer);
  }, [canAdvance, playing, pending, selected, brief]);

  useEffect(() => {
    if (!pending || selected) return;
    const timer = window.setTimeout(() => dispatch({ type: "commit" }), reducedMotion ? 0 : 650);
    return () => window.clearTimeout(timer);
  }, [pending, selected, reducedMotion]);

  useEffect(() => {
    if (followTail.current) thread.current?.scrollTo?.({ top: thread.current.scrollHeight });
  }, [turns.length, pending]);

  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);

  function reset(nextScenario = scenario, autoplay = false) {
    dispatch({ type: "reset", scenario: nextScenario, autoplay: autoplay && !reducedMotion });
    followTail.current = true;
    setAway(false);
    thread.current?.scrollTo?.({ top: 0 });
  }
  function showDetails(product: Product) {
    setSelected(product);
    dispatch({ type: "pause" });
  }

  return (
    <div
      ref={preview}
      className={`commerce-app qc-preview${brief ? " qc-preview-brief" : ""}`}
      id="commerce-preview"
      tabIndex={-1}
    >
      <div className="qc-caption">
        <span>
          {brief ? "A LITTLE CONVERSATION. A BETTER FIND." : "DISCOVER. REFINE. COMPARE."}
        </span>
        <span className="qc-demo-badge">
          <i /> Interactive preview
        </span>
      </div>
      <div className="qc-window">
        <header className="qc-header">
          <div>
            <Brand light markOnly />
            <span>
              <strong>Shopping with Querix</strong>
              <small>A few words. The right products.</small>
            </span>
          </div>
          <div className="qc-playback">
            {!reducedMotion && (
              <button
                type="button"
                aria-label={playing ? "Pause preview" : canPlay ? "Play preview" : "Replay preview"}
                aria-pressed={playing}
                onClick={() => {
                  if (!canPlay) reset(scenario, true);
                  else dispatch({ type: "toggle" });
                }}
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>
            )}
            <button type="button" aria-label="Restart preview" onClick={() => reset()}>
              <RotateCcw size={14} />
            </button>
          </div>
        </header>
        <div className="qc-examples" role="group" aria-label="Shopping example">
          <span>Shop a little</span>
          {Object.keys(DISCOVERY_EXAMPLES).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={scenario === key}
              onClick={() => reset(key as DiscoveryExampleID)}
            >
              {key === "fashion" ? "Workwear" : "Skincare"}
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
          {turns.map((turn, index) => (
            <section className="qc-turn" data-turn={index} key={`${scenario}-${index}`}>
              <div className="qc-user">
                <span className="qx-sr-only">You: </span>
                {turn.prompt}
              </div>
              <div className="qc-reply">
                <span className="qc-avatar">
                  <Brand light markOnly />
                </span>
                <div>
                  <p>{turn.reply}</p>
                  {!turn.comparison ? (
                    <>
                      <div className="qc-preferences">
                        <span>
                          <Check size={10} />
                          {example.preference}
                        </span>
                        <span>Under ${turn.budget}</span>
                        {turn.preference && (
                          <span>
                            <Check size={10} />
                            {turn.preference}
                          </span>
                        )}
                      </div>
                      <div className="qc-products">
                        {turn.products.map((product) => (
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
                      products={turn.products}
                      fields={example.fields}
                      onSelect={showDetails}
                    />
                  )}
                </div>
              </div>
            </section>
          ))}
          {pending && (
            <section className="qc-turn qc-incoming">
              <div className="qc-user">{pending.turns.at(-1)!.prompt}</div>
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
          <div className="qc-choice-heading">
            <span>{pending ? "Finding your next match…" : "Make it yours"}</span>
            <span>{pending ? "" : "Choose a follow-up"}</span>
          </div>
          <div
            className="qc-choices"
            role="group"
            aria-label="Suggested follow-ups"
            aria-busy={Boolean(pending)}
          >
            {choices.map((action) => {
              const Icon =
                action === "budget"
                  ? SlidersHorizontal
                  : action === "compare"
                    ? GitCompareArrows
                    : Sparkles;
              return (
                <button
                  key={action}
                  type="button"
                  className="qc-suggestion"
                  disabled={Boolean(pending)}
                  onClick={() => dispatch({ type: "choose", action, instant: reducedMotion })}
                >
                  <Icon size={13} />
                  {choiceLabel(action, scenario)}
                  <ChevronRight size={12} />
                </button>
              );
            })}
            {!choices.length && (
              <button type="button" className="qc-suggestion" onClick={() => reset()}>
                <RotateCcw size={13} /> Start again
              </button>
            )}
          </div>
          <div className="qc-choice-footer">
            <button
              type="button"
              onClick={() => reset(scenario === "fashion" ? "beauty" : "fashion")}
            >
              Try {scenario === "fashion" ? "skincare" : "workwear"} <ArrowUpRight size={12} />
            </button>
            {turns.length > 1 && choices.length > 0 && (
              <button type="button" onClick={() => reset()}>
                <RotateCcw size={11} /> Start again
              </button>
            )}
          </div>
          <p className="qc-guidance">Guided experience · Sample products & prices</p>
        </div>
      </div>
      <div className="qc-footer">
        <span>
          {brief
            ? "Your next find starts with a conversation."
            : "Live demo access requires an approved account."}
        </span>
        <a href={brief ? "/use-cases/conversational-commerce" : "/commerce/login"}>
          {brief ? "Full walkthrough" : "Demo sign-in"} <ArrowUpRight size={12} />
        </a>
      </div>
      <span className="qx-sr-only" role="status">
        {example.label} example. {turns.length} replies shown.{" "}
        {pending ? "Preparing a reply." : latest.reply}
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
                <img
                  className="qc-compare-photo"
                  src={product.image_urls?.[0]}
                  alt=""
                  width={140}
                  height={120}
                  loading="lazy"
                />
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
