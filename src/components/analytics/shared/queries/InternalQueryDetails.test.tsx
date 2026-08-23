import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { InternalQueryDetails } from "./InternalQueryDetails";
import type { InternalQueryRecord } from "@/features/analytics/model/types";

describe("InternalQueryDetails", () => {
  it("explains which structured filter recovered zero-result candidates", () => {
    const item = {
      search_id: 1,
      request_id: "req-filter-diagnostic",
      query: "bike",
      normalized_query: "bike",
      request_kind: "text_search",
      created_at: "2026-08-23T12:00:00Z",
      word_count: 1,
      categories: ["Bikes"],
      brands: [],
      locations: ["Chennai"],
      language: "English",
      rental_duration: null,
      flags: {},
      outcome: "zero_result",
      filters: { city_id: 81, subcategory_id: 313, target_ad_type: "offer" },
      performance: null,
      token_usage: null,
      api: null,
      attempts: [],
      diagnostics: {
        code: "no_results_for_applied_filters",
        explanation: "Removing location recovered eligible candidates.",
        route_reason: null,
        explicit_filters: { city_id: 81, subcategory_id: 313 },
        inferred_filters: {},
        ignored_filter_names: [],
        candidate_funnel: { retrieved_candidates: 25, eligible_candidates: 0 },
        filter_attribution: {
          evidence_complete: true,
          diagnosis: "filter_blocked_candidates",
          counterfactual_counts: { without_location: 7, without_category: 0 },
          blocking_filters: ["location"],
        },
        evidence_complete: true,
      },
    } as InternalQueryRecord;

    const html = renderToStaticMarkup(<InternalQueryDetails item={item} />);

    expect(html).toContain("Why filters returned no results");
    expect(html).toContain("Removing these filter groups recovered candidates");
    expect(html).toContain("Location");
    expect(html).toContain("Without Location");
    expect(html).toContain(">7<");
  });
});
