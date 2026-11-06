import { createContext, useContext } from "react";
import type { PortalUser } from "./portal-client";
export const PortalContext = createContext<PortalUser | null>(null);
export function usePortalUser() {
  return useContext(PortalContext);
}
