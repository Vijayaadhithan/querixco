import { useCallback, useEffect, useRef, useState } from "react";
import { listLive, type SavedConversation } from "@/features/commerce/client";
import type { StorefrontID } from "@/features/commerce/storefronts";

// Offset counts server rows, including any repeated rows between pages.
const PAGE_SIZE = 50;
export function useConversationHistory(
  storefront: StorefrontID | undefined,
  enabled: boolean,
  revision: string,
) {
  const [items, setItems] = useState<SavedConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const offset = useRef(0);
  const requestId = useRef(0);
  const inFlight = useRef(false);
  const failedAppend = useRef(false);

  const load = useCallback(
    async (append = false) => {
      if (!storefront || !enabled || inFlight.current) return;
      inFlight.current = true;
      const id = ++requestId.current;
      setLoading(true);
      setError("");
      try {
        const start = append ? offset.current : 0;
        // Keep already loaded older chats visible when the active chat changes.
        const count = append ? PAGE_SIZE : Math.max(PAGE_SIZE, offset.current);
        const conversations: SavedConversation[] = [];
        let nextOffset = start;
        let more = false;
        do {
          const result = await listLive(storefront, nextOffset);
          if (id !== requestId.current) return;
          conversations.push(...result.conversations);
          nextOffset += result.conversations.length;
          more = result.conversations.length === PAGE_SIZE;
        } while (more && nextOffset - start < count);
        offset.current = nextOffset;
        setItems((current) => {
          const unique = new Map((append ? current : []).map((item) => [item.id, item]));
          for (const item of conversations) unique.set(item.id, item);
          return [...unique.values()];
        });
        setHasMore(more);
      } catch (cause) {
        if (id === requestId.current) {
          failedAppend.current = append;
          setError(cause instanceof Error ? cause.message : "Could not load your conversations.");
        }
      } finally {
        if (id === requestId.current) {
          inFlight.current = false;
          setLoading(false);
        }
      }
    },
    [storefront, enabled],
  );

  const invalidate = useCallback(() => {
    // Switching chats, categories, or unmounting invalidates earlier responses.
    ++requestId.current;
    inFlight.current = false;
  }, []);
  useEffect(() => {
    let disposed = false;
    // Let Strict Mode discard its first effect before issuing a request.
    queueMicrotask(() => {
      if (!disposed) void load();
    });
    return () => {
      disposed = true;
      invalidate();
    };
  }, [load, revision, invalidate]);

  return {
    items,
    loading,
    error,
    hasMore,
    refresh: () => load(),
    loadMore: () => load(true),
    retry: () => load(failedAppend.current),
  };
}
