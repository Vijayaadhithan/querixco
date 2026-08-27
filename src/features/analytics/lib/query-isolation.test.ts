import { describe, expect, it } from "vitest";

import {
  AnalyticsCompanyMismatchError,
  queryPagesMatchCompany,
  retainMatchingCompanyData,
} from "./query-isolation";

describe("analytics query isolation", () => {
  it("rejects pages from a different company", () => {
    const previous = { pages: [{ company_id: "gainr" }] };

    expect(queryPagesMatchCompany(previous, "gainr")).toBe(true);
    expect(queryPagesMatchCompany(previous, "acme")).toBe(false);
    expect(retainMatchingCompanyData("acme")(previous)).toBeUndefined();
    expect(retainMatchingCompanyData("gainr")(previous)).toBe(previous);
    expect(new AnalyticsCompanyMismatchError().message).toContain("different company");
  });
});
