import { useState } from "react";
// A failed filter request can retain a prior successful view, scoped to one workspace.
export function useRetainedResult<T>(data: T | undefined, placeholder: boolean, scope: string) {
  const [saved, setSaved] = useState<{ scope: string; data: T } | null>(null);
  if (saved && saved.scope !== scope) setSaved(null);
  else if (data && !placeholder && data !== saved?.data) setSaved({ scope, data });
  return data ?? (saved?.scope === scope ? saved.data : undefined);
}
