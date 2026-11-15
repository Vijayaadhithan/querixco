// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { connectLive, startLive, sendLive } from "./client";
const encode = new TextEncoder();
function stream(source: string, size = 7) {
  const bytes = encode.encode(source);
  return new Response(
    new ReadableStream({
      start(controller) {
        for (let i = 0; i < bytes.length; i += size) controller.enqueue(bytes.slice(i, i + size));
        controller.close();
      },
    }),
    { headers: { "content-type": "text/event-stream" } },
  );
}
afterEach(() => vi.unstubAllGlobals());
describe("live chat stream", () => {
  it("parses fragmented UTF-8, progress, products and the committed response", async () => {
    const commerce = { action: "recommend", products: [], preferences: { tasks: [] } };
    const result = { reply: "Here’s your option", message_id: 2, commerce };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        stream(
          [
            'event: status\ndata: {"text":"Searching…"}\n\n',
            ": keep-alive\n\n",
            'event: delta\ndata: {"text":"Here’s your option"}\n\n',
            `event: commerce\ndata: ${JSON.stringify(commerce)}\n\n`,
            `event: done\ndata: ${JSON.stringify(result)}\n\n`,
          ].join(""),
          1,
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const onEvent = vi.fn();
    expect(await sendLive("shampoo", "same-key", onEvent)).toEqual(result);
    expect(onEvent.mock.calls.map(([value]) => value.type)).toEqual([
      "status",
      "delta",
      "commerce",
    ]);
    expect(onEvent.mock.calls[1][0].text).toBe("Here’s your option");
    expect(fetchMock.mock.calls[0][1].headers["idempotency-key"]).toBe("same-key");
    expect(fetchMock.mock.calls[0][1].headers.accept).toBe("text/event-stream");
  });
  it("requires a final committed response before declaring success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(stream('event: delta\ndata: {"text":"partial"}\n\n')),
    );
    await expect(sendLive("shampoo", "same-key", vi.fn())).rejects.toMatchObject({ status: 503 });
  });
  it("preserves retry guidance from stream errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          stream('event: error\ndata: {"status":429,"retry_after":8,"error":"Busy"}\n\n'),
        ),
    );
    await expect(sendLive("shampoo", "same-key", vi.fn())).rejects.toMatchObject({
      status: 429,
      retryAfter: 8,
    });
  });
  it("supports an older backend returning JSON", async () => {
    const result = { reply: "saved", message_id: 2 };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(result)));
    expect(await sendLive("shampoo", "same-key", vi.fn())).toEqual(result);
  });
});

describe("draft and saved conversation identity", () => {
  it("connects an empty browser session without creating or requesting message history", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ available: true }))
      .mockResolvedValueOnce(Response.json({ session_id: "browser-1", conversation_id: null }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await connectLive("clothing")).toEqual({
      sessionId: "browser-1",
      conversationId: undefined,
      messages: [],
      preferences: { tasks: [] },
    });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/commerce/status?storefront=clothing",
      "/api/commerce/session?storefront=clothing",
    ]);
  });
  it("restores messages with a distinct browser ID and saved conversation ID", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ available: true }))
      .mockResolvedValueOnce(Response.json({ session_id: "browser-1", conversation_id: "saved-1" }))
      .mockResolvedValueOnce(
        Response.json({ messages: [{ id: 1, role: "user", content: "shirt" }], next_after: 1 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    expect(await connectLive("clothing")).toMatchObject({
      sessionId: "browser-1",
      conversationId: "saved-1",
      messages: [{ content: "shirt" }],
    });
    expect(fetchMock.mock.calls[2][0]).toBe("/api/commerce/history?after=0&storefront=clothing");
  });
  it("starts persistence using the first message and keeps cancellation available", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ session_id: "browser-1", conversation_id: "saved-1" }));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;
    await startLive("cotton shirt", "clothing", signal);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/commerce/session/start?storefront=clothing",
      expect.objectContaining({
        method: "POST",
        signal,
        body: JSON.stringify({ message: "cotton shirt" }),
      }),
    );
  });
});
