import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Brand } from "@/components/marketing/Brand";
import "@/components/workspace/workspace.css";
import { login, logout } from "@/features/analytics/api";
import {
  analyticsSessionKey,
  safeCompanyReturnPath,
  safeInternalReturnPath,
} from "@/features/analytics/auth/session";
import { formatCompanyName } from "@/features/analytics/lib/format";

type AnalyticsLoginProps =
  { audience: "company"; company: string } | { audience: "internal"; company?: never };

export function AnalyticsLogin(props: AnalyticsLoginProps) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [denied, setDenied] = useState(false);
  const internal = props.audience === "internal";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");
    setDenied(false);

    try {
      const session = await login(
        props.audience,
        username,
        password,
        internal ? undefined : props.company,
      );
      const authorized = internal
        ? session.user.role === "internal_admin"
        : session.user.role === "company_user" && session.user.company_id === props.company;

      if (!authorized) {
        await logout(props.audience).catch(() => undefined);
        queryClient.removeQueries({ queryKey: ["analytics", props.audience] });
        setDenied(true);
        return;
      }

      queryClient.setQueryData(analyticsSessionKey(props.audience), session);
      const requested =
        typeof window === "undefined"
          ? null
          : new URLSearchParams(window.location.search).get("returnTo");
      const destination = internal
        ? safeInternalReturnPath(requested)
        : safeCompanyReturnPath(requested, props.company);
      window.location.assign(destination);
    } catch {
      setError("The username or password is incorrect. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="qx-workspace qx-auth">
      <aside className="qx-auth-story">
        <a href="/" aria-label="Querix AI home">
          <Brand />
        </a>
        <div>
          <p className="qx-auth-caption">QUERIX ANALYTICS</p>
          <h2>
            Understand
            <br />
            the search.
            <br />
            <em>See what’s next.</em>
          </h2>
          <p>
            Explore customer demand, search activity, and the opportunities inside your catalog.
          </p>
        </div>
        <p className="qx-auth-caption">YOUR WORKSPACE. A CLEARER PICTURE.</p>
      </aside>
      <div className="qx-auth-form">
        <section>
          <a className="qx-auth-brand-mobile" href="/" aria-label="Querix AI home">
            <Brand />
          </a>
          <div className="mt-8">
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-workspace-tint text-workspace-blue">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-workspace-blue">
              {internal ? "Querix Internal" : `${formatCompanyName(props.company)} portal`}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-workspace-ink">
              Sign in to analytics
            </h1>
            <p className="mt-2 text-sm leading-6 text-workspace-body">
              {internal
                ? "Authorized Querix team members can review one company workspace at a time."
                : `Use the credentials supplied for the ${formatCompanyName(props.company)} analytics workspace.`}
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="analytics-username"
                className="text-sm font-medium text-workspace-ink"
              >
                Username
              </label>
              <input
                id="analytics-username"
                name="username"
                autoComplete="username"
                required
                maxLength={191}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                aria-describedby={error || denied ? "login-error" : undefined}
                className="mt-2 w-full rounded-md border border-workspace-line bg-workspace-wash px-3.5 py-3 text-sm text-workspace-ink outline-none transition placeholder:text-workspace-muted focus:border-workspace-blue focus:ring-3 focus:ring-blue-400/10"
              />
            </div>
            <div>
              <label
                htmlFor="analytics-password"
                className="text-sm font-medium text-workspace-ink"
              >
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="analytics-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-describedby={error || denied ? "login-error" : undefined}
                  className="w-full rounded-md border border-workspace-line bg-workspace-wash py-3 pr-12 pl-3.5 text-sm text-workspace-ink outline-none transition focus:border-workspace-blue focus:ring-3 focus:ring-blue-400/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-workspace-muted hover:text-workspace-blue focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {(error || denied) && (
              <p
                id="login-error"
                role="alert"
                className="rounded-md border border-workspace-danger-line bg-workspace-danger-tint px-3.5 py-3 text-sm text-workspace-danger"
              >
                {denied ? "This account does not have access to this portal." : error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="qx-action flex w-full items-center justify-center gap-2 rounded-md bg-workspace-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-workspace-blue focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="qx-auth-footer">
            Private access · Use the account provided for this workspace.
          </p>
        </section>
      </div>
    </main>
  );
}
