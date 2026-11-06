import { AlertTriangle, LoaderCircle, LockKeyhole } from "lucide-react";

import { Brand } from "@/components/marketing/Brand";
import "@/components/workspace/workspace.css";

type PortalStateProps = {
  kind: "loading" | "error" | "forbidden" | "empty";
  title?: string;
  message?: string;
  internal?: boolean;
  action?: { label: string; onClick: () => void };
};

export function PortalState({ kind, title, message, internal = false, action }: PortalStateProps) {
  const Icon =
    kind === "loading" ? LoaderCircle : kind === "forbidden" ? LockKeyhole : AlertTriangle;

  return (
    <div className="qx-workspace qx-state">
      <section
        className="qx-surface w-full max-w-lg rounded-xl p-8 text-center"
        aria-live={kind === "loading" ? "polite" : "assertive"}
      >
        <div className="qx-state-brand">
          <Brand />
        </div>
        {internal && (
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-workspace-blue">
            Internal analytics
          </p>
        )}
        <Icon
          className={`mx-auto mb-4 h-7 w-7 ${
            kind === "loading" ? "animate-spin text-workspace-blue" : "text-workspace-warning"
          }`}
          aria-hidden="true"
        />
        <h1 className="text-xl font-semibold text-workspace-ink">
          {title ?? (kind === "loading" ? "Checking your session" : "Analytics unavailable")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-workspace-body">
          {message ??
            (kind === "loading"
              ? "Your private analytics workspace will be ready shortly."
              : "We couldn’t load this view. Please try again.")}
        </p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-6 rounded-md qx-action bg-workspace-ink px-4 py-2.5 text-sm font-semibold text-workspace-ink transition hover:bg-workspace-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          >
            {action.label}
          </button>
        )}
      </section>
    </div>
  );
}
