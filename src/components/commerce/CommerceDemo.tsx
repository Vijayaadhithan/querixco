import { usePortalUser } from "@/features/commerce/portal-context";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  LoaderCircle,
  PanelLeft,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Square,
  Trash2,
  X,
} from "lucide-react";
import {
  connectLive,
  loadCatalog,
  deleteLive,
  newLive,
  openLive,
  liveStatus,
  sendLive,
  CommerceError,
} from "@/features/commerce/client";
import {
  EMPTY_CONVERSATION,
  attributeText,
  type CatalogSummary,
  type Commerce,
  STARTERS,
  latestGroups,
  productPrice,
  type Conversation,
  type Product,
} from "@/features/commerce/model";
import { sampleTurn } from "@/features/commerce/sample";
import { PortalAccountBar } from "./Portal";
import { CommerceHeader } from "./CommerceChrome";
import { Brand } from "@/components/marketing/Brand";
import { ProductCard } from "./ProductCard";
import { ConversationHistory } from "./ConversationHistory";
import { useConversationHistory } from "./use-conversation-history";
import { PortalDialog } from "./PortalDialog";
import "./commerce.css";
import "./chat.css";
import { STOREFRONTS, isStorefront, type StorefrontID } from "@/features/commerce/storefronts";

type Mode = "sample" | "live";
type Pending = { key: string; message: string; sessionId?: string };
const MODE_KEY = "querix-commerce-mode-v1"; // gitleaks:allow -- non-secret browser storage name
function restorePending(sessionId?: string, storageKey = PENDING_KEY): Pending | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
    return value &&
      value.sessionId === sessionId &&
      typeof value.key === "string" &&
      typeof value.message === "string"
      ? value
      : null;
  } catch {
    return null;
  }
}
const SAVE_KEY = "querix-commerce-sample-v1";
const PENDING_KEY = "querix-commerce-pending-v1"; // gitleaks:allow -- non-secret browser storage name
function storedSample(): Conversation {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw || raw.length > 1_000_000) return EMPTY_CONVERSATION;
    const value = JSON.parse(raw);
    if (
      value.expires < Date.now() ||
      !Array.isArray(value.state?.messages) ||
      !Array.isArray(value.state?.preferences?.tasks)
    )
      return EMPTY_CONVERSATION;
    // Only restore snapshots created by this version of the sample application.
    if (
      value.state.messages.some(
        (m: { role?: string; content?: string }) =>
          !["user", "assistant"].includes(m.role ?? "") || typeof m.content !== "string",
      )
    )
      return EMPTY_CONVERSATION;
    return value.state;
  } catch {
    return EMPTY_CONVERSATION;
  }
}
function Comparison({ products, sample }: { products: Product[]; sample: boolean }) {
  const fields = [...new Set(products.flatMap((product) => Object.keys(product.attributes)))].slice(
    0,
    10,
  );
  return (
    <div className="commerce-comparison" tabIndex={0} role="region" aria-label="Product comparison">
      <table>
        <caption>Compare supplied listing details</caption>
        <thead>
          <tr>
            <th>Attribute</th>
            {products.map((product) => (
              <th key={product.product_id}>{product.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>{sample ? "Sample" : "Historical"} price</th>
            {products.map((product) => (
              <td key={product.product_id}>{productPrice(product)}</td>
            ))}
          </tr>
          {fields.map((field) => (
            <tr key={field}>
              <th>{field.replaceAll("_", " ")}</th>
              {products.map((product) => (
                <td key={product.product_id}>{attributeText(product.attributes[field]?.value)}</td>
              ))}
            </tr>
          ))}
          <tr>
            <th>Current stock</th>
            {products.map((product) => (
              <td key={product.product_id}>Not verified</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
function AssistantResponse({
  commerce,
  content,
  sample,
  actionable,
  disabled,
  onSend,
}: {
  commerce?: Commerce | null;
  content: string;
  sample: boolean;
  actionable: boolean;
  disabled: boolean;
  onSend: (message: string) => void;
}) {
  const portalUser = usePortalUser();
  const groups = commerce
    ? latestGroups([{ id: "response", role: "assistant", content, commerce }])
    : [];
  if (commerce?.handoff?.targets.length)
    return (
      <div className="chat-response-content">
        <p className="chat-prose">{content}</p>
        <div className="chat-handoffs">
          {commerce.handoff.targets
            .filter(
              (target) =>
                isStorefront(target.storefront_id) &&
                (!portalUser || portalUser.storefronts.includes(target.storefront_id)),
            )
            .map((target, index) => (
              <a
                key={`${target.storefront_id}-${index}`}
                href={`/${target.storefront_id}`}
                onClick={(event) => {
                  if (disabled) {
                    event.preventDefault();
                    return;
                  }
                  try {
                    sessionStorage.setItem(
                      `querix-transfer-${target.storefront_id}`,
                      JSON.stringify({ message: target.message, expires: Date.now() + 600_000 }),
                    );
                  } catch {
                    event.preventDefault();
                    window.alert(
                      "Browser storage is unavailable. Open the section above and paste your request.",
                    );
                  }
                }}
              >
                <strong>Continue in {STOREFRONTS[target.storefront_id].label} →</strong>
                <span>{target.message}</span>
              </a>
            ))}
        </div>
      </div>
    );
  if (!groups.some((group) => group.products.length))
    return <p className="chat-prose">{content}</p>;
  return (
    <div className="chat-response-content">
      {groups.map((group) => {
        const intro =
          group.action === "compare"
            ? "Here’s how these options compare."
            : group.action === "details"
              ? "Here are the details from the listing."
              : (group.reply || content).split(/\n\s*1\./)[0];
        return (
          <section
            className="chat-product-response"
            key={group.task_id}
            aria-label={group.query || "Product suggestions"}
          >
            {groups.length > 1 && <h3>{group.query || `Task ${group.task_id}`}</h3>}
            <p className="chat-prose">{intro}</p>
            {group.action === "compare" && <Comparison products={group.products} sample={sample} />}
            <div
              className={`chat-product-strip ${group.action === "details" ? "is-detail" : ""}`}
              role="region"
              aria-label="Product options"
              tabIndex={0}
            >
              {group.products.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  sample={sample}
                  details={group.action === "details"}
                  disabled={disabled}
                  onDetails={
                    actionable
                      ? () =>
                          onSend(
                            `Details about ${product.product_id.startsWith("sample:") ? (product.display_position ?? 1) : product.product_id} in task ${group.task_id}`,
                          )
                      : undefined
                  }
                />
              ))}
            </div>
            {actionable && group.products.length > 0 && (
              <div className="chat-suggestions">
                {group.products.length > 1 && (
                  <button
                    disabled={disabled}
                    onClick={() => onSend(`Compare the first two in task ${group.task_id}`)}
                  >
                    Compare first two
                  </button>
                )}
                <button
                  disabled={disabled}
                  onClick={() => onSend(`More options for task ${group.task_id}`)}
                >
                  More options
                </button>
                <button
                  disabled={disabled}
                  onClick={() => onSend(`Cheaper options for task ${group.task_id}`)}
                >
                  Find cheaper options
                </button>
              </div>
            )}
          </section>
        );
      })}
      <details className="chat-full-response">
        <summary>Read full listing explanation</summary>
        <p className="chat-prose">{content}</p>
      </details>
      <p className="chat-evidence-note">
        {sample
          ? "Fictional sample products and prices."
          : "Historical USD prices · Listing claims, not verified suitability or current stock."}
      </p>
    </div>
  );
}
export function CommerceDemo({ storefront }: { storefront?: StorefrontID } = {}) {
  const portalUser = usePortalUser();
  const [showHistory, setShowHistory] = useState(
    () => window.matchMedia?.("(min-width: 900px)").matches ?? true,
  );
  const [openingId, setOpeningId] = useState<string | null>(null);
  const section = storefront ? STOREFRONTS[storefront] : undefined;
  const pendingKey = PENDING_KEY + (storefront ? `-${storefront}` : "");
  const starters = section
    ? section.prompts.map((text) => ({ text, label: text, kind: section.label }))
    : STARTERS;
  const [mode, setMode] = useState<Mode>("live");
  const [state, setState] = useState<Conversation>(EMPTY_CONVERSATION);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(true);
  const [catalog, setCatalog] = useState<CatalogSummary | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");
  const [storageNote, setStorageNote] = useState("");
  const [available, setAvailable] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [retryAt, setRetryAt] = useState(0);
  const [streamText, setStreamText] = useState("");
  const [streamCommerce, setStreamCommerce] = useState<Commerce | null>(null);
  const [progress, setProgress] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [awayFromBottom, setAwayFromBottom] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const thread = useRef<HTMLDivElement>(null);
  const followTail = useRef(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const lock = useRef(true);

  const input = useRef<HTMLTextAreaElement>(null);
  const lastResponse = [...state.messages].reverse().find((message) => message.commerce);
  const tasks = state.preferences.tasks;
  const history = useConversationHistory(
    storefront,
    Boolean(portalUser && initialized && !busy && mode === "live"),
    `${state.sessionId}:${state.messages.length}:${state.messages.at(-1)?.id}`,
  );
  const historyToggle = useRef<HTMLButtonElement>(null);
  function closeHistory() {
    setShowHistory(false);
    historyToggle.current?.focus();
  }
  function resetChatView() {
    followTail.current = true;
    setAwayFromBottom(false);
    setDraft("");
    setStreamText("");
    setStreamCommerce(null);
    setProgress("");
    setElapsed(0);
    setRetryAt(0);
    setConfirmDelete(false);
    setShowContext(false);
    if (window.matchMedia?.("(max-width: 899px)").matches) closeHistory();
  }

  useEffect(() => {
    let disposed = false;
    async function initialize() {
      try {
        const status = await liveStatus(storefront);
        if (disposed) return;
        setAvailable(status.available);
        if (storefront) {
          try {
            const transfer = JSON.parse(
              sessionStorage.getItem(`querix-transfer-${storefront}`) ?? "null",
            );
            if (transfer && typeof transfer.message === "string" && transfer.expires > Date.now()) {
              setDraft(transfer.message);
              setStorageNote(
                "Request from another section. Review it below, then send when ready.",
              );
              sessionStorage.removeItem(`querix-transfer-${storefront}`);
            }
          } catch {
            /* Optional browser storage. */
          }
        }

        let preferSample = false;
        try {
          preferSample = sessionStorage.getItem(MODE_KEY) === "sample";
        } catch {
          /* optional storage */
        }
        if (storefront && !status.available)
          throw new Error(
            "Connect the local backend to shop this section. The sample walkthrough is available in the legacy demo.",
          );
        if (!storefront && (!status.available || preferSample)) {
          setMode("sample");
          setState(storedSample());
        } else {
          const [restored, summary] = await Promise.all([
            connectLive(storefront),
            loadCatalog(storefront),
          ]);
          if (disposed) return;
          setState(restored);
          setCatalog(summary);
          setPending(restorePending(restored.sessionId, pendingKey));
        }
      } catch (cause) {
        if (!disposed)
          setError(
            cause instanceof Error ? cause.message : "Could not connect to the local backend.",
          );
      } finally {
        if (!disposed) {
          lock.current = false;
          setBusy(false);
          setInitialized(true);
        }
      }
    }
    void initialize();
    return () => {
      disposed = true;
    };
  }, [storefront, pendingKey]);
  useEffect(() => {
    if (followTail.current) thread.current?.scrollTo({ top: thread.current.scrollHeight });
  }, [state.sessionId, state.messages.length, busy, streamText, streamCommerce]);
  useEffect(() => {
    if (input.current) {
      input.current.style.height = "auto";
      input.current.style.height = `${Math.min(input.current.scrollHeight, 180)}px`;
    }
  }, [draft]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!busy) return;
    const started = Date.now();
    const timer = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [busy]);
  const savePending = useCallback(
    (value: Pending | null) => {
      setPending(value);
      try {
        if (value) sessionStorage.setItem(pendingKey, JSON.stringify(value));
        else sessionStorage.removeItem(pendingKey);
      } catch {
        setStorageNote("Retry recovery is available in this tab, but browser storage is disabled.");
      }
    },
    [pendingKey, setPending, setStorageNote],
  );
  async function changeMode(next: Mode) {
    if (lock.current || next === mode) return;
    lock.current = true;
    setBusy(true);
    setElapsed(0);
    setError("");
    setConfirmDelete(false);
    try {
      if (next === "sample") {
        setState(storedSample());
        setPending(null);
      } else {
        const [restored, summary] = await Promise.all([
          connectLive(storefront),
          loadCatalog(storefront),
        ]);
        setState(restored);
        setCatalog(summary);
        setPending(restorePending(restored.sessionId, pendingKey));
      }
      setMode(next);
      try {
        sessionStorage.setItem(MODE_KEY, next);
      } catch {
        /* optional storage */
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not connect to live mode.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const send = useCallback(
    async (text: string, retry?: Pending) => {
      if (lock.current || !text.trim() || (pending && !retry)) return;
      if (mode === "live" && !state.sessionId) {
        setError("The live session is not connected. Use Reconnect before sending.");
        return;
      }
      if (new TextEncoder().encode(text).length > 4000) {
        setError("Please keep your message within 4,000 UTF-8 bytes.");
        return;
      }
      if (mode === "live" && Date.now() < retryAt) {
        setError("Please wait a moment before retrying.");
        return;
      }
      lock.current = true;
      followTail.current = true;
      setStreamText("");
      setStreamCommerce(null);
      setProgress("Connecting…");
      setBusy(true);
      setElapsed(0);
      setError("");
      setDraft("");
      const operation = retry ?? {
        message: text,
        key: crypto.randomUUID(),
        sessionId: state.sessionId,
      };
      try {
        if (mode === "sample") {
          const next = sampleTurn(state, text);
          setState(next);
          try {
            localStorage.setItem(
              SAVE_KEY,
              JSON.stringify({ expires: Date.now() + 86_400_000, state: next }),
            );
          } catch {
            setStorageNote(
              "Browser storage is unavailable. This sample will reset when you refresh.",
            );
          }
        } else {
          savePending(operation);
          controller.current = new AbortController();
          const result = await sendLive(
            operation.message,
            operation.key,
            (event) => {
              if (event.type === "status") setProgress(event.text);
              if (event.type === "delta") setStreamText((current) => current + event.text);
              if (event.type === "commerce") setStreamCommerce(event.commerce);
            },
            controller.current.signal,
            storefront,
          );
          setState((current) =>
            current.messages.some((message) => message.id === result.message_id)
              ? current
              : {
                  sessionId: current.sessionId,
                  preferences: result.commerce.preferences,
                  messages: [
                    ...current.messages,
                    {
                      id: operation.key,
                      role: "user",
                      content: operation.message,
                    },
                    {
                      id: result.message_id,
                      role: "assistant",
                      content: result.reply,
                      commerce: result.commerce,
                    },
                  ],
                },
          );
          savePending(null);
        }
      } catch (cause) {
        setError(
          cause instanceof Error && cause.name === "AbortError"
            ? "Stopped waiting. Your response may still finish; recover it below."
            : cause instanceof Error
              ? cause.message
              : "Could not complete this message. Please retry.",
        );
        if (cause instanceof CommerceError && cause.retryAfter)
          setRetryAt(Date.now() + cause.retryAfter * 1000);
      } finally {
        lock.current = false;
        setBusy(false);
        controller.current = null;
        setStreamText("");
        setStreamCommerce(null);
        setProgress("");
        input.current?.focus({ preventScroll: true });
      }
    },
    [
      pending,
      mode,
      retryAt,
      state,
      storefront,
      savePending,
      setError,
      setStreamText,
      setStreamCommerce,
      setProgress,
      setBusy,
      setElapsed,
      setDraft,
      setState,
      setStorageNote,
      setRetryAt,
    ],
  );
  async function reset(remove = true) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setElapsed(0);
    setError("");
    try {
      if (mode === "live") {
        if (remove) await deleteLive(storefront);
        else await newLive(storefront);
        savePending(null);
        resetChatView();
        // The server's active chat has changed. Do not leave the old chat sendable
        // if restoring the new one fails.
        setState(EMPTY_CONVERSATION);
        const restored = await connectLive(storefront);
        setState(restored);
      } else {
        localStorage.removeItem(SAVE_KEY);
      }
      if (mode === "sample") setState(EMPTY_CONVERSATION);
      resetChatView();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reset the conversation.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function resume(id: string) {
    if (!storefront || lock.current) return;
    if (id === state.sessionId) {
      if (window.matchMedia?.("(max-width: 899px)").matches) closeHistory();
      return;
    }
    lock.current = true;
    setOpeningId(id);
    setBusy(true);
    setElapsed(0);
    setError("");
    try {
      await openLive(id, storefront);
      savePending(null);
      resetChatView();
      setState(EMPTY_CONVERSATION);
      setState(await connectLive(storefront));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open conversation");
    } finally {
      lock.current = false;
      setBusy(false);
      setOpeningId(null);
    }
  }
  return (
    <div className="commerce-app commerce-demo commerce-chat-page">
      <CommerceHeader
        demo
        account={portalUser ? <PortalAccountBar user={portalUser} /> : undefined}
      />
      <div className="chat-workspace">
        {portalUser && storefront && showHistory && (
          <ConversationHistory
            items={history.items}
            loading={history.loading || !initialized}
            error={history.error}
            hasMore={history.hasMore}
            activeId={state.sessionId}
            openingId={openingId}
            disabled={busy}
            category={section?.label ?? "Shopping"}
            onNew={() => void reset(false)}
            onOpen={(id) => void resume(id)}
            onClose={closeHistory}
            onRefresh={() => void history.refresh()}
            onRetry={() => void history.retry()}
            onLoadMore={() => void history.loadMore()}
          />
        )}
        <div className="chat-main-column">
          <div className="chat-toolbar">
            <div className="chat-toolbar-heading">
              {portalUser && storefront && (
                <button
                  ref={historyToggle}
                  className="chat-icon-button"
                  aria-label={showHistory ? "Hide history" : "Show history"}
                  aria-expanded={showHistory}
                  aria-controls="conversation-history"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <PanelLeft size={19} />
                </button>
              )}
              <details className="chat-category-picker">
                <summary>
                  <span>{section?.label ?? "Shopping companion"}</span>
                  <ChevronDown size={15} />
                </summary>
                <nav className="chat-sections" aria-label="Shopping sections">
                  {Object.entries(STOREFRONTS)
                    .filter(
                      ([id]) => !portalUser || portalUser.storefronts.includes(id as StorefrontID),
                    )
                    .map(([id, item]) => (
                      <a
                        key={id}
                        href={`/${id}`}
                        aria-current={storefront === id ? "page" : undefined}
                      >
                        {item.label}
                      </a>
                    ))}
                </nav>
              </details>
              <span className="chat-connection" role="status">
                <i />
                {mode === "sample"
                  ? "Sample"
                  : state.sessionId
                    ? "Live catalog"
                    : initialized
                      ? "Not connected"
                      : "Connecting…"}
              </span>
            </div>
            <div className="chat-toolbar-actions">
              {!storefront && (
                <button
                  disabled={busy}
                  onClick={() => void changeMode(mode === "live" ? "sample" : "live")}
                  title={
                    mode === "live" ? "Switch to sample walkthrough" : "Connect to live catalog"
                  }
                >
                  {mode === "live" ? "Try sample" : "Use live catalog"}
                  {!available && mode === "sample" ? " · offline" : ""}
                </button>
              )}
              <button
                aria-expanded={showContext}
                aria-label="Conversation preferences"
                onClick={() => setShowContext(!showContext)}
              >
                <SlidersHorizontal size={17} />
                <span>Preferences</span>
              </button>
              {portalUser && (
                <button
                  aria-label="Delete chat"
                  disabled={busy || !state.messages.length}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={17} />
                </button>
              )}
              <button
                aria-label="New chat"
                disabled={busy}
                onClick={() => (portalUser ? void reset(false) : setConfirmDelete(true))}
              >
                <Plus size={18} />
                <span>New chat</span>
              </button>
            </div>
          </div>
          {showContext && (
            <aside className="chat-context" aria-label="Saved shopping preferences">
              <div>
                <strong>Your shopping context</strong>
                <button aria-label="Close preferences" onClick={() => setShowContext(false)}>
                  <X size={17} />
                </button>
              </div>
              <p>
                {catalog && mode === "live"
                  ? `${catalog.product_count.toLocaleString()} products · ${catalog.categories.length} categories`
                  : "An illustrative shopping walkthrough"}
              </p>
              {tasks.length ? (
                tasks.map((task) => (
                  <section key={task.id}>
                    <strong>
                      Task {task.id} · {task.query || "Discovering your needs"}
                    </strong>
                    <p>{task.need}</p>
                    {task.filters.max_price != null && (
                      <p>Maximum ${Number(task.filters.max_price).toFixed(2)}</p>
                    )}
                    {Object.entries(task.filters.attributes ?? {}).map(([name, value]) => (
                      <p key={name}>
                        {name.replaceAll("_", " ")}: {String(value)}
                      </p>
                    ))}
                  </section>
                ))
              ) : (
                <p>Your preferences will appear as we chat.</p>
              )}
            </aside>
          )}
          {confirmDelete && (
            <PortalDialog busy={busy} onClose={() => setConfirmDelete(false)}>
              <h2 id="portal-dialog-title">Delete this conversation?</h2>
              <p>This chat will be permanently deleted. You can then start a new conversation.</p>
              <div className="chat-delete-dialog-actions">
                <button disabled={busy} onClick={() => setConfirmDelete(false)}>
                  Keep conversation
                </button>
                <button className="portal-danger" disabled={busy} onClick={() => void reset()}>
                  <Trash2 size={15} /> Delete chat
                </button>
              </div>
            </PortalDialog>
          )}
          <main
            className="chat-thread"
            ref={thread}
            onScroll={() => {
              const element = thread.current;
              if (!element) return;
              followTail.current =
                element.scrollHeight - element.scrollTop - element.clientHeight < 100;
              setAwayFromBottom(!followTail.current);
            }}
            onLoadCapture={() => {
              if (followTail.current)
                thread.current?.scrollTo({ top: thread.current.scrollHeight });
            }}
          >
            {openingId && (
              <div className="chat-opening" role="status">
                <LoaderCircle size={18} className="commerce-spin" /> Opening conversation…
              </div>
            )}
            <div
              className="chat-feed"
              hidden={Boolean(openingId)}
              role="log"
              aria-label="Shopping conversation"
              aria-live="polite"
            >
              {state.messages.length === 0 && !pending && (
                <div className="chat-welcome">
                  <span className="chat-welcome-mark">
                    <Brand light markOnly />
                  </span>
                  <h1>{section?.welcome ?? "What are you looking for?"}</h1>
                  <p>Tell me what matters to you. We’ll find a few good options together.</p>
                  <div className="chat-starters">
                    {starters.map((starter) => (
                      <button
                        key={starter.text}
                        disabled={busy}
                        onClick={() => void send(starter.text)}
                      >
                        <small>{starter.kind}</small>
                        <strong>{starter.label}</strong>
                        <span>
                          {starter.text}
                          <ArrowRight size={14} />
                        </span>
                      </button>
                    ))}
                  </div>
                  {catalog && mode === "live" && (
                    <small>
                      Explore {catalog.product_count.toLocaleString()} products in your catalog
                    </small>
                  )}
                </div>
              )}
              {state.messages.map((message) => (
                <article key={message.id} className={`chat-turn ${message.role}`}>
                  <div className="chat-speaker">
                    {message.role === "user" ? (
                      "You"
                    ) : (
                      <>
                        <span className="chat-avatar">
                          <Brand light markOnly />
                        </span>{" "}
                        Querix
                      </>
                    )}
                  </div>
                  {message.role === "user" ? (
                    <p className="chat-user-bubble">{message.content}</p>
                  ) : (
                    <AssistantResponse
                      commerce={message.commerce}
                      content={message.content}
                      sample={mode === "sample"}
                      actionable={message === lastResponse}
                      disabled={busy || Boolean(pending)}
                      onSend={(text) => void send(text)}
                    />
                  )}
                </article>
              ))}
              {pending && (
                <article className="chat-turn user">
                  <div className="chat-speaker">You</div>
                  <p className="chat-user-bubble">{pending.message}</p>
                </article>
              )}
              {busy && !openingId && (
                <article className="chat-turn assistant chat-incoming">
                  <div className="chat-speaker">
                    <span className="chat-avatar">
                      <Brand light markOnly />
                    </span>{" "}
                    Querix
                  </div>
                  {streamText ? (
                    <AssistantResponse
                      content={streamText}
                      commerce={streamCommerce}
                      sample={false}
                      actionable={false}
                      disabled
                      onSend={() => undefined}
                    />
                  ) : (
                    <div className="chat-progress" role="status">
                      <LoaderCircle size={15} className="commerce-spin" />
                      {progress || "Connecting to your conversation…"}
                      {elapsed > 0 && <span>{elapsed}s</span>}
                    </div>
                  )}
                </article>
              )}
            </div>
          </main>
          <div className="chat-composer-dock">
            {awayFromBottom && (
              <button
                className="chat-jump"
                aria-label="Jump to latest message"
                onClick={() => {
                  followTail.current = true;
                  thread.current?.scrollTo({
                    top: thread.current.scrollHeight,
                    behavior: "smooth",
                  });
                }}
              >
                <ArrowDown size={18} />
              </button>
            )}
            <div className="commerce-composer chat-composer">
              {error && (
                <div className="commerce-error" role="alert">
                  {error}
                  {mode === "live" && !busy && (
                    <button
                      onClick={() => {
                        void (async () => {
                          if (lock.current) return;
                          lock.current = true;
                          setBusy(true);
                          setError("");
                          try {
                            const restored = await connectLive(storefront);
                            setState(restored);
                            setPending(restorePending(restored.sessionId, pendingKey));
                            setAvailable(true);
                            setCatalog(await loadCatalog(storefront));
                          } catch (cause) {
                            setError(
                              cause instanceof Error ? cause.message : "Connection unavailable",
                            );
                          } finally {
                            lock.current = false;
                            setBusy(false);
                          }
                        })();
                      }}
                    >
                      <RotateCcw size={13} /> Reconnect & restore
                    </button>
                  )}
                  {pending && (
                    <button disabled={busy} onClick={() => void send(pending.message, pending)}>
                      <RotateCcw size={13} /> Retry same message
                    </button>
                  )}
                </div>
              )}
              {pending && !busy && !error && (
                <div className="commerce-error">
                  An earlier message may have completed: “{pending.message}”
                  <button onClick={() => void send(pending.message, pending)}>
                    <RotateCcw size={13} /> Recover response
                  </button>
                </div>
              )}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void send(draft);
                }}
              >
                <label htmlFor="commerce-message" className="commerce-sr-only">
                  Your shopping message
                </label>
                <textarea
                  ref={input}
                  id="commerce-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask for a product, or tell me what to change…"
                  rows={1}
                  maxLength={4000}
                  disabled={busy || Boolean(pending) || (mode === "live" && !state.sessionId)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      void send(draft);
                    }
                  }}
                />
                {busy && pending ? (
                  <button
                    type="button"
                    aria-label="Stop waiting for response"
                    title="Stop waiting; the response can be recovered"
                    onClick={() => controller.current?.abort()}
                  >
                    <Square size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    aria-label="Send message"
                    disabled={
                      busy ||
                      !draft.trim() ||
                      Boolean(pending) ||
                      (mode === "live" && !state.sessionId)
                    }
                  >
                    <ArrowUp size={18} />
                  </button>
                )}
              </form>
              <p>
                {mode === "sample"
                  ? "Sample chat saved in this browser for 24 hours."
                  : "Historical prices. Listing details can be incomplete."}{" "}
                <span>↵ Send</span>
              </p>
              {storageNote && <p role="status">{storageNote}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
