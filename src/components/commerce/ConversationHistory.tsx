import { useEffect, useRef, useState } from "react";
import {
  LoaderCircle,
  MessageSquare,
  PanelLeftClose,
  RotateCcw,
  Ellipsis,
  Trash2,
} from "lucide-react";
import type { SavedConversation } from "@/features/commerce/client";

function groupDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const week = new Date(today);
  week.setDate(today.getDate() - 7);
  const month = new Date(today);
  month.setDate(today.getDate() - 30);
  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";
  if (date >= week) return "Previous 7 days";
  if (date >= month) return "Previous 30 days";
  return "Older";
}

export function ConversationHistory({
  items,
  loading,
  error,
  hasMore,
  activeId,
  openingId,
  disabled,
  category,
  onOpen,
  onDelete,
  onClose,
  onRefresh,
  onRetry,
  onLoadMore,
}: {
  items: SavedConversation[];
  loading: boolean;
  error: string;
  hasMore: boolean;
  activeId?: string;
  openingId: string | null;
  disabled: boolean;
  category: string;
  onOpen: (id: string) => void;
  onDelete: (item: SavedConversation) => void;
  onClose: () => void;
  onRefresh: () => void;
  onRetry: () => void;
  onLoadMore: () => void;
}) {
  const [mobile, setMobile] = useState(
    () => window.matchMedia?.("(max-width: 899px)").matches ?? false,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const query = window.matchMedia?.("(max-width: 899px)");
    if (!query) return;
    const update = () => setMobile(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const element = dialog.current;
    if (mobile) element?.showModal();
    return () => element?.close();
  }, [mobile]);

  const groups = new Map<string, SavedConversation[]>();
  const [manage, setManage] = useState(false);
  const emptyChats = items.filter((item) => item.is_empty);
  const conversations = items.filter((item) => !item.is_empty);
  for (const item of conversations) {
    const label = groupDate(item.updated_at);
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }
  const renderRow = (item: SavedConversation) => (
    <li className="chat-history-row" key={item.id}>
      <button
        className="chat-history-item"
        aria-current={activeId === item.id ? "true" : undefined}
        aria-label={`Open chat: ${item.title || "Untitled conversation"}`}
        title={item.title || "Untitled conversation"}
        disabled={disabled}
        onClick={() => onOpen(item.id)}
      >
        {openingId === item.id ? (
          <LoaderCircle size={15} className="commerce-spin" />
        ) : (
          <MessageSquare size={15} />
        )}
        <span className="chat-history-label">
          <span>
            {item.is_empty
              ? "Empty chat"
              : item.title === "Querix shopping demo"
                ? "Untitled chat"
                : item.title || "Untitled chat"}
          </span>
          <time dateTime={item.updated_at}>
            {new Date(item.updated_at).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
        </span>
      </button>
      <details className="chat-history-menu">
        <summary aria-label={`Chat options: ${item.title || "Untitled chat"}`}>
          <Ellipsis size={17} />
        </summary>
        <button
          disabled={disabled}
          aria-label={`Delete chat: ${item.title || "Untitled chat"}`}
          onClick={(event) => {
            event.currentTarget.closest("details")!.open = false;
            onDelete(item);
          }}
        >
          <Trash2 size={14} /> Delete chat
        </button>
      </details>
    </li>
  );
  const content = (
    <>
      <div className="chat-history-heading">
        <div>
          <h2 id="chat-history-title">Your chats</h2>
          <p>{category}</p>
        </div>
        <button className="chat-icon-button" aria-label="Close history" onClick={onClose}>
          <PanelLeftClose size={18} />
        </button>
      </div>

      <div className="chat-history-list" aria-busy={loading}>
        {items.length === 0 && loading && (
          <p className="chat-history-status" role="status">
            <LoaderCircle size={16} className="commerce-spin" /> Loading conversations…
          </p>
        )}
        {conversations.length === 0 && !loading && !error && (
          <div className="chat-history-empty">
            <MessageSquare size={24} />
            <strong>A place for your finds</strong>
            <p>Your conversations in {category.toLowerCase()} will appear here.</p>
          </div>
        )}
        {[...groups].map(([label, conversations]) => (
          <section className="chat-history-group" key={label} aria-label={label}>
            <h3>{label}</h3>
            <ul>{conversations.map(renderRow)}</ul>
          </section>
        ))}
        {manage && emptyChats.length > 0 && (
          <details className="chat-empty-conversations" open>
            <summary>Empty chats ({emptyChats.length})</summary>
            <p>No saved messages. You can delete these chats from their menu.</p>
            <ul>{emptyChats.map(renderRow)}</ul>
          </details>
        )}
        {error && (
          <div className="chat-history-error" role="alert">
            <p>{error}</p>
            <button disabled={loading || disabled} onClick={onRetry}>
              <RotateCcw size={14} /> Try again
            </button>
          </div>
        )}
        {hasMore && !error && (
          <button className="chat-history-more" disabled={loading || disabled} onClick={onLoadMore}>
            {loading ? (
              <>
                <LoaderCircle size={15} className="commerce-spin" /> Loading…
              </>
            ) : (
              "Load older conversations"
            )}
          </button>
        )}
      </div>
      <div className="chat-history-footer">
        {emptyChats.length > 0 ? (
          <button
            className="chat-manage-history"
            aria-pressed={manage}
            onClick={() => setManage(!manage)}
          >
            {manage ? "Done" : "Manage history"}
          </button>
        ) : (
          <span>Saved to your account</span>
        )}
        <button
          className="chat-icon-button"
          aria-label="Refresh history"
          disabled={loading || disabled}
          onClick={onRefresh}
        >
          <RotateCcw size={15} className={loading ? "commerce-spin" : undefined} />
        </button>
      </div>
    </>
  );
  return mobile ? (
    <dialog
      ref={dialog}
      className="chat-history-sidebar chat-history-drawer"
      id="conversation-history"
      aria-labelledby="chat-history-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="chat-history-drawer-content">{content}</div>
    </dialog>
  ) : (
    <aside
      className="chat-history-sidebar"
      id="conversation-history"
      aria-labelledby="chat-history-title"
    >
      {content}
    </aside>
  );
}
