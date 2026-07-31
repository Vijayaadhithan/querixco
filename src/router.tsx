import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();

    try {
      const recoveryKey = "querix:preload-recovery";
      const lastRecovery = Number(window.sessionStorage.getItem(recoveryKey) ?? 0);
      if (Date.now() - lastRecovery < 10_000) return;
      window.sessionStorage.setItem(recoveryKey, String(Date.now()));
    } catch {
      // Avoid a reload loop when storage is unavailable in a hardened browser.
      return;
    }

    window.location.reload();
  });
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
