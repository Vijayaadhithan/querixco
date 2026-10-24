import { describe, expect, it } from "vitest";
import { EMPTY_CONVERSATION, latestGroups } from "./model";
import { sampleTurn } from "./sample";

describe("sample shopping journeys", () => {
  it("keeps budgets independently scoped when one task is refined", () => {
    const initial = sampleTurn(EMPTY_CONVERSATION, "Shampoo under $15 and moisturizer under $25");
    const next = sampleTurn(initial, "Moisturizer under $20 instead");
    expect(next.preferences.tasks.map((task) => task.filters.max_price)).toEqual([
      "14.99",
      "19.99",
    ]);
    expect(initial.preferences.tasks[1].filters.max_price).toBe("24.99");
    expect(
      latestGroups(next.messages)[0].products.every((product) => Number(product.price.amount) < 20),
    ).toBe(true);
  });
  it("preserves preferences when the budget currency is unsupported", () => {
    const initial = sampleTurn(EMPTY_CONVERSATION, "A moisturizer for dry skin under $30");
    const next = sampleTurn(initial, "Under ₹1000 instead");
    expect(next.preferences).toEqual(initial.preferences);
    expect(next.messages.at(-1)?.commerce?.action).toBe("clarify");
  });
  it("asks which task an ambiguous refinement belongs to", () => {
    const initial = sampleTurn(EMPTY_CONVERSATION, "Shampoo under $15 and moisturizer under $25");
    const next = sampleTurn(initial, "Under $10 instead");
    expect(next.preferences).toEqual(initial.preferences);
    expect(next.messages.at(-1)?.content).toContain("Which product");
  });
  it("does not silently relax filters when there are no matches", () => {
    const next = sampleTurn(EMPTY_CONVERSATION, "Moisturizer under $2");
    expect(latestGroups(next.messages)[0].products).toEqual([]);
    expect(next.preferences.tasks[0].filters.max_price).toBe("1.99");
  });
  it("uses original display positions and task scope for details and comparisons", () => {
    const initial = sampleTurn(EMPTY_CONVERSATION, "Shampoo under $15 and moisturizer under $25");
    const detail = sampleTurn(initial, "Details about 2 in task 2");
    expect(latestGroups(detail.messages)[0].products[0].title).toBe("Cloud-soft moisturizer");
    const comparison = sampleTurn(initial, "Compare the first two in task 1");
    expect(latestGroups(comparison.messages)[0].products.map((product) => product.title)).toEqual([
      "The daily shampoo",
      "Fresh start wash",
    ]);
  });
  it("returns unseen alternatives and honors explicit fragrance-free", () => {
    const initial = sampleTurn(EMPTY_CONVERSATION, "Moisturizer under $30");
    const next = sampleTurn(initial, "More options for task 1");
    const originalIds = latestGroups(initial.messages)[0].products.map(
      (product) => product.product_id,
    );
    expect(
      latestGroups(next.messages)[0].products.every(
        (product) => !originalIds.includes(product.product_id),
      ),
    ).toBe(true);
    const filtered = sampleTurn(initial, "Make it fragrance-free");
    expect(
      latestGroups(filtered.messages)[0].products.every(
        (product) => product.attributes.fragrance_free?.value === true,
      ),
    ).toBe(true);
  });
});
