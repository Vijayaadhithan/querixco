import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useAnalyticsLocation } from "./use-analytics-location";
import { useRetainedResult } from "./use-retained-result";

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});
it("restores selections on real router navigation, reload and browser back", async () => {
  function Probe() {
    const state = useAnalyticsLocation("company");
    return (
      <>
        <output>
          {state.dashboardFilters.period}|{state.dashboardFilters.category}|{state.view}
        </output>
        <button
          onClick={() =>
            state.update({ ...state.dashboardFilters, period: "7d", category: "Bikes & cars" })
          }
        >
          Filter
        </button>
        <button onClick={() => state.setView("activity")}>Activity</button>
      </>
    );
  }
  const rootRoute = createRootRoute();
  const route = createRoute({
    getParentRoute: () => rootRoute,
    path: "/analytics/$company",
    component: Probe,
  });
  const history = createMemoryHistory({
    initialEntries: ["/analytics/sample?f.period=90d&view=overview"],
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([route]),
    history,
    defaultPendingMinMs: 0,
  });
  await act(async () => {
    await router.load();
    root.render(<RouterProvider router={router} />);
  });
  expect(host.querySelector("output")?.textContent).toBe("90d||overview");
  await act(async () => host.querySelectorAll("button")[0].click());
  expect(host.querySelector("output")?.textContent).toBe("7d|Bikes & cars|overview");
  await act(async () => host.querySelectorAll("button")[1].click());
  expect(host.querySelector("output")?.textContent).toBe("7d|Bikes & cars|activity");
  await act(async () => history.back());
  expect(host.querySelector("output")?.textContent).toBe("7d|Bikes & cars|overview");
  await act(async () => history.back());
  expect(host.querySelector("output")?.textContent).toBe("90d||overview");
  await act(async () => {
    history.forward();
    await router.load();
  });
  expect(host.querySelector("output")?.textContent).toBe("7d|Bikes & cars|overview");
});
it("retains a successful response after failure but never across workspace or audience changes", async () => {
  function Probe({
    scope,
    data,
    placeholder = false,
  }: {
    scope: string;
    data?: string;
    placeholder?: boolean;
  }) {
    return <output>{useRetainedResult(data, placeholder, scope) ?? "empty"}</output>;
  }
  await act(async () => root.render(<Probe scope="company:sample" data="previous selection" />));
  await act(async () => root.render(<Probe scope="company:sample" />));
  expect(host.textContent).toBe("previous selection");
  await act(async () => root.render(<Probe scope="company:other" />));
  expect(host.textContent).toBe("empty");
  await act(async () => root.render(<Probe scope="company:sample" />));
  expect(host.textContent).toBe("empty");
  await act(async () => root.render(<Probe scope="internal:sample" data="internal records" />));
  await act(async () => root.render(<Probe scope="company:sample" />));
  expect(host.textContent).toBe("empty");
});
