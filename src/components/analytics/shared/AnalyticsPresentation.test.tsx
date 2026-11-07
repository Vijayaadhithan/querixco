import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PortalShell } from "./PortalShell";
import { AnalyticsLogin } from "./AnalyticsLogin";
import { DashboardFilters } from "./DashboardFilters";
import { QueryFilters } from "./QueryFilters";
import { emptyQueryFilters } from "@/features/analytics/lib/navigation";
import { QueryTable } from "./QueryTable";
import { createDashboardFilters } from "@/features/analytics/lib/dashboard";
import { endAnalyticsSession } from "@/features/analytics/auth/session";
import { login } from "@/features/analytics/api";
import type {
  CompanyQueryRecord,
  DashboardAvailableFilters,
} from "@/features/analytics/model/types";

vi.mock("@/features/analytics/auth/session", async (original) => ({
  ...(await original<object>()),
  endAnalyticsSession: vi.fn(),
}));
vi.mock("@/features/analytics/api", async (original) => ({
  ...(await original<object>()),
  login: vi.fn(),
}));
let root: Root;
let element: HTMLDivElement;
let client: QueryClient;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  element = document.createElement("div");
  document.body.append(element);
  root = createRoot(element);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(async () => {
  await act(async () => root.unmount());
  element.remove();
  client.clear();
  vi.clearAllMocks();
});
async function render(children: ReactNode) {
  await act(async () =>
    root.render(<QueryClientProvider client={client}>{children}</QueryClientProvider>),
  );
}
function button(text: string) {
  const item = [...element.querySelectorAll("button")].find((item) =>
    item.textContent?.includes(text),
  );
  if (!item) throw new Error(`Missing button: ${text}`);
  return item;
}
const available: DashboardAvailableFilters = {
  periods: ["24h", "7d", "30d"],
  request_scopes: ["all", "text_search", "browse"],
  outcomes: ["fulfilled", "zero_result"],
  categories: ["Clothing"],
  languages: ["English"],
  cities: ["Chennai"],
  city_options: [{ id: 81, label: "Chennai" }],
  ad_types: ["offer"],
  execution_paths: ["semantic"],
  providers: ["sample-provider"],
  operations: ["search"],
};

it("keeps company navigation and logout scoped to the selected company", async () => {
  await render(
    <PortalShell audience="company" company="sample" username="tester" current="queries">
      <main>Queries</main>
    </PortalShell>,
  );
  expect(element.querySelector('nav a[aria-current="page"]')?.getAttribute("href")).toBe(
    "/analytics/sample/queries",
  );
  expect(element.querySelector('nav a[href="/internal/analytics"]')).toBeNull();
  expect(element.querySelector('a[aria-label="Querix AI home"]')?.getAttribute("href")).toBe("/");
  await act(async () => button("Log out").click());
  expect(endAnalyticsSession).toHaveBeenCalledWith(client, "company", "/analytics/sample/login");
});
it("keeps internal workspace switching distinct from company access", async () => {
  await render(
    <PortalShell audience="internal" company="sample" username="tester" current="dashboard">
      <main>Dashboard</main>
    </PortalShell>,
  );
  expect(element.querySelector('nav a[href="/internal/analytics"]')?.textContent).toContain(
    "Companies",
  );
  expect(element.querySelector('nav a[aria-current="page"]')?.getAttribute("href")).toBe(
    "/internal/analytics/sample",
  );
  expect(
    element.querySelector('nav a[href="/internal/analytics/sample/queries"]')?.textContent,
  ).toContain("Requests");
});
it("preserves dashboard period and city filtering and the reset action", async () => {
  const onChange = vi.fn(),
    onReset = vi.fn();
  const value = { ...createDashboardFilters(), category: "Clothing", from: "2026-11-01" };
  await render(
    <DashboardFilters
      audience="company"
      value={value}
      available={available}
      isFetching={false}
      onChange={onChange}
      onReset={onReset}
    />,
  );
  await act(async () => button("7 days").click());
  expect(onChange).toHaveBeenLastCalledWith({ ...value, period: "7d", from: "", to: "" });
  await act(async () => button("More filters").click());
  onChange.mockClear();
  const city = element.querySelector("#company-dashboard-city") as HTMLSelectElement;
  await act(async () => {
    city.value = "81";
    city.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(onChange).not.toHaveBeenCalled();
  await act(async () => button("Apply filters").click());
  expect(onChange).toHaveBeenLastCalledWith({ ...value, period: "custom", cityId: "81" });
  expect(element.querySelector("#internal-dashboard-provider")).toBeNull();
  await act(async () => button("Clear filters").click());
  expect(onReset).toHaveBeenCalledOnce();
});
it("exposes the existing operational filters only in the internal view", async () => {
  const onChange = vi.fn();
  await render(
    <DashboardFilters
      audience="internal"
      value={createDashboardFilters()}
      available={available}
      isFetching={false}
      onChange={onChange}
      onReset={vi.fn()}
    />,
  );
  await act(async () => button("More filters").click());
  const provider = element.querySelector("#internal-dashboard-provider") as HTMLSelectElement;
  expect(provider).not.toBeNull();
  await act(async () => {
    provider.value = "sample-provider";
    provider.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(onChange).not.toHaveBeenCalled();
  await act(async () => button("Apply filters").click());
  expect(onChange).toHaveBeenCalledWith({
    ...createDashboardFilters(),
    provider: "sample-provider",
  });
});
it("retains password visibility and accessible failed-login feedback", async () => {
  vi.mocked(login).mockRejectedValueOnce(new Error("Invalid credentials"));
  await render(<AnalyticsLogin audience="company" company="sample" />);
  const password = element.querySelector("#analytics-password") as HTMLInputElement;
  expect(password.type).toBe("password");
  await act(async () =>
    (element.querySelector('button[aria-label="Show password"]') as HTMLButtonElement).click(),
  );
  expect(password.type).toBe("text");
  await act(async () =>
    element
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(login).toHaveBeenCalledWith("company", "", "", "sample");
  expect(element.querySelector('[role="alert"]')?.textContent).toContain(
    "username or password is incorrect",
  );
  expect(password.getAttribute("aria-describedby")).toBe("login-error");
});
it("keeps query results available in both desktop and mobile presentations", async () => {
  const item: CompanyQueryRecord = {
    search_id: 1,
    request_id: "sample",
    query: "Cotton shirt",
    normalized_query: "cotton shirt",
    request_kind: "text_search",
    created_at: "2026-11-06T10:00:00Z",
    word_count: 2,
    categories: ["Clothing"],
    brands: [],
    locations: ["Chennai"],
    language: "English",
    rental_duration: null,
    flags: {},
    outcome: "fulfilled",
    search: { status: "ok", result_count: 2, total_results: 2 },
  };
  await render(<QueryTable items={[item]} internal={false} />);
  expect(element.querySelector("table tbody")?.textContent).toContain("Cotton shirt");
  expect(element.querySelector("article")?.textContent).toContain("Cotton shirt");
  expect(element.querySelector("article")?.textContent).toContain("2 results");
});

it("allows canceling a filter draft without issuing a new selection", async () => {
  const onChange = vi.fn();
  await render(
    <DashboardFilters
      audience="internal"
      value={createDashboardFilters()}
      available={available}
      isFetching={false}
      onChange={onChange}
      onReset={vi.fn()}
    />,
  );
  await act(async () => button("More filters").click());
  const provider = element.querySelector("#internal-dashboard-provider") as HTMLSelectElement;
  await act(async () => {
    provider.value = "sample-provider";
    provider.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => button("Cancel").click());
  expect(onChange).not.toHaveBeenCalled();
  await act(async () => button("More filters").click());
  expect((element.querySelector("#internal-dashboard-provider") as HTMLSelectElement).value).toBe(
    "",
  );
});
it("applies history sorting and dimensions together while retaining exact report dates", async () => {
  const onChange = vi.fn();
  const value = {
    ...emptyQueryFilters,
    exactFrom: "2026-11-01T07:04:56.000Z",
    exactTo: "2026-11-07T07:04:56.000Z",
    cityId: "81",
  };
  await render(
    <QueryFilters
      audience="company"
      value={value}
      classificationOptions={["Clothing"]}
      executionPathOptions={[]}
      languageOptions={[]}
      onChange={onChange}
      onReset={vi.fn()}
    />,
  );
  expect(element.textContent).toContain("Exact dashboard range");
  await act(async () => button("More filters & sorting").click());
  const sort = element.querySelector("#query-sort-field") as HTMLSelectElement;
  expect((element.querySelector("#city-filter") as HTMLSelectElement).value).toBe("81");
  await act(async () => {
    sort.value = "results";
    sort.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(onChange).not.toHaveBeenCalled();
  await act(async () => button("Apply filters").click());
  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange).toHaveBeenCalledWith({ ...value, sortBy: "results" });
  expect(element.querySelector("#query-sort-field")).toBeNull();
});
