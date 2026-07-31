import { AlertTriangle, LoaderCircle, LockKeyhole } from "lucide-react";

import { QuerixLogo } from "@/components/QuerixLogo";

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
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section
        className="glass-card w-full max-w-lg rounded-3xl p-8 text-center"
        aria-live={kind === "loading" ? "polite" : "assertive"}
      >
        <QuerixLogo className="mx-auto mb-7" size={34} />
        {internal && (
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
            Internal analytics
          </p>
        )}
        <Icon
          className={`mx-auto mb-4 h-7 w-7 ${
            kind === "loading" ? "animate-spin text-blue-300" : "text-amber-300"
          }`}
          aria-hidden="true"
        />
        <h1 className="text-xl font-semibold text-white">
          {title ?? (kind === "loading" ? "Checking your session" : "Analytics unavailable")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {message ??
            (kind === "loading"
              ? "Your private analytics workspace will be ready shortly."
              : "We couldn’t load this view. Please try again.")}
        </p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-6 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          >
            {action.label}
          </button>
        )}
      </section>
    </main>
  );
}
