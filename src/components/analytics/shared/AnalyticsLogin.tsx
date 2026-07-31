import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";

import { QuerixLogo } from "@/components/QuerixLogo";
import { login, logout } from "@/lib/analytics-api";
import {
  analyticsSessionKey,
  safeCompanyReturnPath,
  safeInternalReturnPath,
} from "@/lib/analytics-auth";
import { formatCompanyName } from "@/lib/analytics-format";

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
      const session = await login(username, password);
      const authorized = internal
        ? session.user.role === "internal_admin"
        : session.user.role === "company_user" && session.user.company_id === props.company;

      if (!authorized) {
        await logout().catch(() => undefined);
        queryClient.removeQueries({ queryKey: ["analytics"] });
        setDenied(true);
        return;
      }

      queryClient.setQueryData(analyticsSessionKey, session);
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
    <main
      className={`relative grid min-h-screen place-items-center overflow-hidden px-5 py-12 ${
        internal ? "bg-[#090f1b]" : ""
      }`}
    >
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <section className="glass-card relative z-10 w-full max-w-md rounded-3xl p-7 sm:p-9">
        <QuerixLogo size={36} />
        <div className="mt-8">
          <div
            className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
              internal ? "bg-violet-400/12 text-violet-300" : "bg-blue-400/12 text-blue-300"
            }`}
          >
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.22em] ${
              internal ? "text-violet-300" : "text-blue-300"
            }`}
          >
            {internal ? "Querix Internal" : `${formatCompanyName(props.company)} portal`}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Sign in to analytics
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {internal
              ? "Authorized Querix team members can review one company workspace at a time."
              : `Use the credentials supplied for the ${formatCompanyName(props.company)} analytics workspace.`}
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="analytics-username" className="text-sm font-medium text-slate-100">
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
              className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-3 focus:ring-blue-400/10"
            />
          </div>
          <div>
            <label htmlFor="analytics-password" className="text-sm font-medium text-slate-100">
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
                className="w-full rounded-xl border border-white/12 bg-white/5 py-3 pr-12 pl-3.5 text-sm text-white outline-none transition focus:border-blue-400/70 focus:ring-3 focus:ring-blue-400/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-slate-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-300"
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
              className="rounded-xl border border-red-400/20 bg-red-400/8 px-3.5 py-3 text-sm text-red-200"
            >
              {denied ? "This account does not have access to this portal." : error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70 ${
              internal
                ? "bg-violet-500 hover:bg-violet-400 focus-visible:outline-violet-300"
                : "bg-blue-500 hover:bg-blue-400 focus-visible:outline-blue-300"
            }`}
          >
            {submitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
