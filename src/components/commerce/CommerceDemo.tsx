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
  deleteSavedLive,
  startLive,
  type SavedConversation,
  newLive,
  openLive,
  liveStatus,
  sendLive,
  CommerceError,
} from "@/features/commerce/client";
import {
  EMPTY_CONVERSATION,
  type CatalogSummary,
  type Commerce,
  STARTERS,
  latestGroups,
  type Conversation,
  type Group,
  type Product,
} from "@/features/commerce/model";
import { sampleTurn } from "@/features/commerce/sample";
import { PortalAccountBar } from "./Portal";
import { CommerceHeader } from "./CommerceChrome";
import { Brand } from "@/components/marketing/Brand";
import { ShoppingFilters } from "./ShoppingFilters";
import { Comparison, ComparePicker } from "./ProductComparison";
import { ProductCard } from "./ProductCard";
import { ConversationHistory } from "./ConversationHistory";
import { useConversationHistory } from "./use-conversation-history";
import { PortalDialog } from "./PortalDialog";
import "./commerce.css";
import "./chat.css";
import { STOREFRONTS, isStorefront, type StorefrontID } from "@/features/commerce/storefronts";

type Mode = "sample" | "live";
type Operation = { key: string; message: string; requestText?: string };
type Pending = Operation & { sessionId?: string; following?: Operation[] };

function pinReference(text: string, commerce?: Commerce | null) {
  if (!commerce) return text;
  const ordinals = ["first", "second", "third", "fourth", "fifth"];
  const positions = new Set<number>();
  for (const match of text.matchAll(
    /\b(first|second|third|fourth|fifth)\b|\b(?:option|product|item)\s*#?([1-5])\b/gi,
  )) {
    positions.add(match[2] ? Number(match[2]) : ordinals.indexOf(match[1].toLowerCase()) + 1);
  }
  if (/\bfirst two\b/i.test(text)) positions.add(2);
  if (!positions.size) return text;
  const groups = latestGroups([{ id: "visible", role: "assistant", content: "", commerce }]);
  const taskId = /\btask ([1-5])\b/i.exec(text)?.[1];
  const group = taskId
    ? groups.find((g) => g.task_id === Number(taskId))
    : groups.length === 1
      ? groups[0]
      : undefined;
  const ids = [...positions].map((pos) => group?.products[pos - 1]?.product_id);
  if (!group || ids.some((id) => !id)) return null;
  return `${text} (referring to ${ids.join(" and ")} in task ${group.task_id})`;
}
const MODE_KEY = "querix-commerce-mode-v1"; // gitleaks:allow -- non-secret browser storage name
function restorePending(sessionId?: string, storageKey = PENDING_KEY): Pending | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
    return value &&
      value.sessionId === sessionId &&
      typeof value.key === "string" &&
      typeof value.message === "string" &&
      (value.requestText === undefined || typeof value.requestText === "string") &&
      (value.following === undefined ||
        (Array.isArray(value.following) &&
          value.following.every(
            (item: Operation) =>
              item &&
              typeof item.key === "string" &&
              typeof item.message === "string" &&
              (item.requestText === undefined || typeof item.requestText === "string"),
          )))
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
function shopperMessage(text: string, groups: Group[]) {
  const action =
    /^(More options for|Cheaper options for|Details about (.+?) in|Compare (.+?) in) task (\d+)(?: \(referring to (.+?) in task \d+\))?$/i.exec(
      text,
    );
  if (action) {
    const group = groups.find((g) => g.task_id === Number(action[4]));
    const subject = group?.query || "options";
    if (action[1] === "More options for")
      return group?.query ? `Show me more ${subject}.` : "Show me more options.";
    if (action[1] === "Cheaper options for") return `Show me cheaper ${subject}.`;
    if (action[2]) {
      const p = group?.products.find(
        (p) => p.product_id === action[2] || String(p.display_position) === action[2],
      );
      return p ? `Show details for ${p.title}.` : "Show listing details.";
    }
    if (action[3]) {
      const ids = action[5]?.split(" and ") ?? [];
      const titles = ids.map((id) => group?.products.find((p) => p.product_id === id)?.title);
      return titles.length === 2 && titles.every(Boolean)
        ? `Compare ${titles.join(" and ")}.`
        : `Compare ${action[3]}.`;
    }
  }
  const edit =
    /^For task (\d+), (set|remove) (maximum price|minimum price|size|color|material|style|scent)(?: to (.+))?$/i.exec(
      text,
    );
  if (edit) {
    const subject = groups.find((g) => g.task_id === Number(edit[1]))?.query;
    return `${edit[2] === "set" ? "Set" : "Remove"} the ${edit[3]}${subject ? " for " + subject : ""}${edit[4] ? " to " + edit[4] : ""}.`;
  }
  return text.replace(
    / \(referring to (?:amazon:[A-Z0-9]{10})(?: and amazon:[A-Z0-9]{10})* in task \d+\)$/,
    "",
  );
}
function AssistantResponse({
  commerce,
  content,
  sample,
  actionable,
  previousGroups = [],
  disabled,
  onSend,
}: {
  commerce?: Commerce | null;
  content: string;
  sample: boolean;
  actionable: boolean;
  previousGroups?: Group[];
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
        const earlier = previousGroups.find(
          (g) =>
            g.task_id === group.task_id &&
            group.products.every((p) =>
              g.products.some((candidate) => candidate.product_id === p.product_id),
            ),
        );
        const choices = group.action === "compare" && earlier ? earlier.products : group.products;
        const viewDetails = actionable
          ? (product: Product) =>
              onSend(
                `Details about ${product.product_id.startsWith("sample:") ? (product.display_position ?? 1) : product.product_id} in task ${group.task_id}`,
              )
          : undefined;
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
            {group.action === "compare" && (
              <Comparison
                products={group.products}
                sample={sample}
                disabled={disabled}
                onDetails={viewDetails}
              />
            )}
            {group.action !== "compare" && (
              <div
                className={`chat-product-strip ${group.products.length === 1 ? "is-single" : ""} ${group.action === "details" ? "is-detail" : ""}`}
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
                    onDetails={viewDetails ? () => viewDetails(product) : undefined}
                  />
                ))}
              </div>
            )}
            {actionable && group.products.length > 0 && (
              <div className="chat-suggestions">
                <ComparePicker
                  products={choices}
                  group={group}
                  disabled={disabled}
                  onSend={onSend}
                />
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
  const inFlight = useRef<Pending | null>(null);
  const controller = useRef<AbortController | null>(null);
  const thread = useRef<HTMLDivElement>(null);
  const followTail = useRef(true);
  const landOnReply = useRef(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SavedConversation | null>(null);
  const lock = useRef(true);

  const input = useRef<HTMLTextAreaElement>(null);
  const lastResponse = [...state.messages].reverse().find((message) => message.commerce);
  const tasks = state.preferences.tasks;
  // Preserve the displayed choices for each turn, including restored conversations.
  const choicesByTask = new Map<number, Group>();
  const beforeTurn = state.messages.map((message) => {
    const previous = [...choicesByTask.values()];
    if (message.commerce)
      for (const group of latestGroups([message])) {
        if (group.products.length && group.action !== "compare" && group.action !== "details")
          choicesByTask.set(group.task_id, group);
      }
    return previous;
  });
  const latestChoices = [...choicesByTask.values()];
  const history = useConversationHistory(
    storefront,
    Boolean(portalUser && initialized && !busy && mode === "live"),
    `${state.sessionId}:${state.conversationId}:${state.messages.length}:${state.messages.at(-1)?.id}`,
  );
  const historyToggle = useRef<HTMLButtonElement>(null);
  function closeHistory() {
    setShowHistory(false);
    historyToggle.current?.focus();
  }
  function resetChatView() {
    followTail.current = true;
    landOnReply.current = false;
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
    const el = thread.current;
    if (!el || !followTail.current) return;
    if (!busy && landOnReply.current && state.messages.at(-1)?.role === "assistant") {
      landOnReply.current = false;
      const turns = el.querySelectorAll(".chat-turn.assistant");
      const last = turns[turns.length - 1];
      if (last) {
        el.scrollTo({
          top:
            el.scrollTop + last.getBoundingClientRect().top - el.getBoundingClientRect().top - 12,
        });
        followTail.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        setAwayFromBottom(!followTail.current);
        return;
      }
    }
    el.scrollTo({ top: el.scrollHeight });
  }, [state.sessionId, state.messages, busy, streamText, streamCommerce]);
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
      inFlight.current = value;
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
      if (!text.trim()) return;
      if (new TextEncoder().encode(text).length > 4000) {
        setError("Please keep your message within 4,000 UTF-8 bytes.");
        return;
      }
      if (lock.current) {
        const active = inFlight.current;
        if (retry || !active || !controller.current || controller.current.signal.aborted) return;
        const requestText = pinReference(text, streamCommerce ?? lastResponse?.commerce);
        if (!requestText || new TextEncoder().encode(requestText).length > 4000) {
          setError("Name the item or task you mean before sending this follow-up.");
          return;
        }
        const next = { key: crypto.randomUUID(), message: text, requestText };
        savePending({ ...active, following: [...(active.following ?? []), next] });
        followTail.current = true;
        setDraft("");
        setStreamText("");
        setStreamCommerce(null);
        setError("");
        return;
      }
      if (pending && !retry) return;
      if (mode === "live" && !state.sessionId) {
        setError("The live session is not connected. Use Reconnect before sending.");
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
      landOnReply.current = true;
      setProgress("Connecting…");
      setBusy(true);
      setElapsed(0);
      setError("");
      if (!retry) setDraft("");
      let operation: Pending = retry ?? {
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
          if (!state.conversationId) {
            const started = await startLive(
              operation.message,
              storefront,
              controller.current.signal,
              state.sessionId,
            );
            setState((current) => ({ ...current, conversationId: started.conversation_id }));
          }
          const signal = controller.current.signal;
          while (true) {
            const sendingKey = operation.key;
            const result = await sendLive(
              operation.requestText ?? operation.message,
              operation.key,
              (event) => {
                if (
                  signal.aborted ||
                  inFlight.current?.key !== sendingKey ||
                  inFlight.current.following?.length
                )
                  return;
                if (event.type === "status") setProgress(event.text);
                if (event.type === "delta") setStreamText((current) => current + event.text);
                if (event.type === "commerce") setStreamCommerce(event.commerce);
              },
              signal,
              storefront,
              state.sessionId,
            );
            if (signal.aborted) throw new DOMException("Stopped waiting", "AbortError");
            const completed = operation;
            const [next, ...remaining] = inFlight.current?.following ?? [];
            setState((current) =>
              current.messages.some((message) => message.id === result.message_id)
                ? next
                  ? {
                      ...current,
                      messages: current.messages.map((m) =>
                        m.id === result.message_id ? { ...m, superseded: true } : m,
                      ),
                    }
                  : current
                : {
                    sessionId: current.sessionId,
                    conversationId: current.conversationId,
                    preferences: result.commerce.preferences,
                    messages: [
                      ...current.messages,
                      {
                        id: completed.key,
                        role: "user",
                        content: completed.message,
                      },
                      {
                        id: result.message_id,
                        role: "assistant",
                        content: result.reply,
                        commerce: result.commerce,
                        superseded: Boolean(next),
                      },
                    ],
                  },
            );
            if (!next) break;
            operation = { ...next, sessionId: completed.sessionId, following: remaining };
            savePending(operation);
            setStreamText("");
            setStreamCommerce(null);
            setElapsed(0);
            setProgress("Updating your search…");
          }
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
      streamCommerce,
      lastResponse,
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
  const acceptingFollowups = busy && Boolean(pending);
  const composerDisabled =
    ((busy || Boolean(pending)) && !acceptingFollowups) || (mode === "live" && !state.sessionId);
  const previousPreferences = state.messages.filter((m) => m.commerce).at(-2)
    ?.commerce?.preferences;
  async function reset(remove = true) {
    if (lock.current) return;
    if (!remove && mode === "live" && state.sessionId && !state.messages.length && !pending) {
      resetChatView();
      return;
    }
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
    if (id === state.conversationId) {
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
  async function removeSaved() {
    if (!storefront || !deleteTarget || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await deleteSavedLive(deleteTarget.id, storefront);
      setDeleteTarget(null);
      if (result.active || deleteTarget.id === state.conversationId) {
        savePending(null);
        resetChatView();
        setState(EMPTY_CONVERSATION);
        setState(await connectLive(storefront));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this chat.");
      // Keep errors visible outside the confirmation dialog; the row remains retryable.
      setDeleteTarget(null);
    } finally {
      lock.current = false;
      setBusy(false);
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
            activeId={state.conversationId}
            openingId={openingId}
            disabled={busy}
            category={section?.label ?? "Shopping"}
            onOpen={(id) => void resume(id)}
            onDelete={(item) => {
              setDeleteTarget(item);
              if (window.matchMedia?.("(max-width: 899px)").matches) closeHistory();
            }}
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
          {(confirmDelete || deleteTarget) && (
            <PortalDialog
              busy={busy}
              onClose={() => {
                setConfirmDelete(false);
                setDeleteTarget(null);
              }}
            >
              <h2 id="portal-dialog-title">Delete this conversation?</h2>
              <p>
                {deleteTarget
                  ? `“${deleteTarget.title || "Untitled chat"}” will be permanently deleted.`
                  : "This chat will be permanently deleted. You can then start a new conversation."}
              </p>
              <div className="chat-delete-dialog-actions">
                <button
                  disabled={busy}
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeleteTarget(null);
                  }}
                >
                  Keep conversation
                </button>
                <button
                  className="portal-danger"
                  disabled={busy}
                  onClick={() => (deleteTarget ? void removeSaved() : void reset())}
                >
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
                        {starter.label !== starter.text && (
                          <span>
                            {starter.text}
                            <ArrowRight size={14} />
                          </span>
                        )}
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
              {state.messages.map((message, index) => (
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
                    <p className="chat-user-bubble">
                      {shopperMessage(message.content, beforeTurn[index])}
                    </p>
                  ) : message.superseded ? (
                    <details className="chat-full-response">
                      <summary>Earlier response</summary>
                      <AssistantResponse
                        content={message.content}
                        commerce={message.commerce}
                        sample={false}
                        actionable={false}
                        disabled
                        onSend={() => undefined}
                      />
                    </details>
                  ) : (
                    <AssistantResponse
                      commerce={message.commerce}
                      content={message.content}
                      sample={mode === "sample"}
                      previousGroups={beforeTurn[index]}
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
                  <p className="chat-user-bubble">
                    {shopperMessage(pending.message, latestChoices)}
                  </p>
                </article>
              )}
              {pending?.following?.map((item) => (
                <article key={item.key} className="chat-turn user">
                  <div className="chat-speaker">You · Queued</div>
                  <p className="chat-user-bubble">{shopperMessage(item.message, latestChoices)}</p>
                </article>
              ))}
              {busy && !openingId && (pending || !initialized) && (
                <article className="chat-turn assistant chat-incoming">
                  <div className="chat-speaker">
                    <span className="chat-avatar">
                      <Brand light markOnly />
                    </span>{" "}
                    Querix
                  </div>
                  {streamText || streamCommerce ? (
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
                      {pending?.following?.length
                        ? "Your follow-up is queued."
                        : progress || "Connecting to your conversation…"}
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
            {mode === "live" && tasks.length > 0 && (
              <ShoppingFilters
                key={`${state.sessionId}:${state.preferences.active_task_id}:${lastResponse?.id}`}
                current={state.preferences}
                messages={state.messages}
                previous={previousPreferences}
                previousEdit={state.messages.at(-2)?.content}
                disabled={busy || Boolean(pending)}
                onSend={(text) => void send(text)}
              />
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
                  An earlier message may have completed: “
                  {shopperMessage(pending.message, latestChoices)}”
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
                  disabled={composerDisabled}
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
                {busy && pending && !draft.trim() ? (
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
                    disabled={composerDisabled || !draft.trim()}
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
