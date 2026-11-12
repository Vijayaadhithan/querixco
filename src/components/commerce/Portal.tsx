import { PortalContext, usePortalUser } from "@/features/commerce/portal-context";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  UserRound,
  ShoppingBag,
  Sparkles,
  Footprints,
  Watch,
} from "lucide-react";
import { CommerceHeader } from "./CommerceChrome";
import { STOREFRONTS, type StorefrontID } from "@/features/commerce/storefronts";
import {
  clearPrivateBrowserState,
  portalRequest,
  PortalError,
  type PortalUser,
} from "@/features/commerce/portal-client";
import "./commerce.css";
import "./portal.css";

function Feedback({ error }: { error: string }) {
  return error ? (
    <p className="portal-error" role="alert">
      {error}
    </p>
  ) : null;
}
export function PortalFrame({ children }: { children: ReactNode }) {
  return (
    <div className="commerce-app portal-page">
      <CommerceHeader demo />
      <main className="portal-main">{children}</main>
    </div>
  );
}
export function PortalAccountBar({ user }: { user: PortalUser }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await portalRequest("auth/logout", "POST");
      clearPrivateBrowserState();
      window.location.assign("/commerce/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign out");
      setBusy(false);
    }
  }
  return (
    <>
      <div className="portal-account-bar">
        <a href="/demo/commerce">Workspace</a>
        <span className="portal-account-name">
          <UserRound size={15} />
          {user.name}
        </span>
        {user.role === "admin" && (
          <a href="/commerce/admin">
            <ShieldCheck size={15} />
            Admin panel
          </a>
        )}
        <a href="/commerce/account">Password</a>
        <button onClick={() => void logout()} disabled={busy}>
          <LogOut size={15} />
          Sign out
        </button>
      </div>
      <Feedback error={error} />
    </>
  );
}
export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await portalRequest("auth/login", "POST", { username, password });
      setPassword("");
      clearPrivateBrowserState();
      window.location.assign("/demo/commerce");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in");
      setBusy(false);
    }
  }
  return (
    <PortalFrame>
      <div className="portal-login-layout">
        <section className="portal-intro">
          <span className="portal-eyebrow">QUERIX / PRIVATE PREVIEW</span>
          <h1>
            A little access.
            <br />A world to explore.
          </h1>
          <p>
            Your space to try conversational shopping. Sign in with the account provided by your
            administrator.
          </p>
          <div className="portal-trust">
            <LockKeyhole size={18} />
            <span>Private accounts. Personal conversations.</span>
          </div>
        </section>
        <form className="portal-card portal-login" onSubmit={(e) => void submit(e)}>
          <span className="portal-icon">
            <LockKeyhole size={23} />
          </span>
          <h2>Welcome back</h2>
          <p>Sign in to your testing workspace.</p>
          <label>
            Username
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={64}
              autoCapitalize="none"
              spellCheck={false}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={128}
            />
          </label>
          <Feedback error={error} />
          <button className="portal-primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
            <ArrowRight size={17} />
          </button>
          <small>Need an account or password reset? Contact your administrator.</small>
        </form>
      </div>
    </PortalFrame>
  );
}
function PasswordForm({ forced = false }: { forced?: boolean }) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The new passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await portalRequest("auth/password", "POST", {
        current_password: current,
        new_password: password,
      });
      setCurrent("");
      setPassword("");
      setConfirm("");
      clearPrivateBrowserState();
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change password");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="portal-card portal-password">
      <span className="portal-icon">
        <ShieldCheck size={24} />
      </span>
      <h1>{done ? "Password updated" : forced ? "Make this account yours" : "Change password"}</h1>
      {done ? (
        <>
          <p>All previous sessions have been signed out. Sign in with your new password.</p>
          <a className="portal-primary" href="/commerce/login">
            Return to sign in
            <ArrowRight size={17} />
          </a>
        </>
      ) : (
        <>
          <p>
            {forced
              ? "Replace your temporary password before opening your workspace."
              : "Updating your password signs you out on all devices."}
          </p>
          <form onSubmit={(e) => void submit(e)}>
            <label>
              {forced ? "Temporary password" : "Current password"}
              <input
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </label>
            <label>
              New password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <small>Use 12–128 characters. A memorable passphrase works well.</small>
            <label>
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
            <Feedback error={error} />
            <button className="portal-primary" disabled={busy}>
              {busy ? "Saving…" : "Save new password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
export function PortalGate({
  children,
  storefront,
  admin = false,
}: {
  children: ReactNode;
  storefront?: StorefrontID;
  admin?: boolean;
}) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const data = await portalRequest<{ user: PortalUser }>("auth/me");
        if (active) {
          setUser(data.user);
          setError("");
        }
      } catch (e) {
        if (!active) return;
        setUser(null);
        if (e instanceof PortalError && e.status === 401) {
          clearPrivateBrowserState();
          window.location.replace("/commerce/login");
        } else setError(e instanceof Error ? e.message : "Unable to check access");
      }
    }
    void check();
    const timer = window.setInterval(() => void check(), 30_000);
    const focus = () => void check();
    window.addEventListener("focus", focus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, []);
  if (!user)
    return (
      <PortalFrame>
        <div className="portal-empty" role="status">
          {error || "Opening your workspace…"}
          {error && (
            <p>
              <a href="/commerce/login">Return to sign in</a>
            </p>
          )}
        </div>
      </PortalFrame>
    );
  if (user.must_change_password)
    return (
      <PortalFrame>
        <PortalAccountBar user={user} />
        <PasswordForm forced />
      </PortalFrame>
    );
  if ((admin && user.role !== "admin") || (storefront && !user.storefronts.includes(storefront)))
    return (
      <PortalFrame>
        <PortalAccountBar user={user} />
        <div className="portal-empty">
          <LockKeyhole size={32} />
          <h1>Access hasn’t been assigned</h1>
          <p>Your administrator controls which categories you can use.</p>
          <a href="/demo/commerce">Return to your workspace</a>
        </div>
      </PortalFrame>
    );
  return (
    <PortalContext.Provider key={user.id} value={user}>
      {children}
    </PortalContext.Provider>
  );
}
const ICONS = { clothing: ShoppingBag, beauty: Sparkles, footwear: Footprints, fashion: Watch };
const DESCRIPTIONS = {
  clothing: "Everyday pieces, chosen around you.",
  beauty: "Care for your skin, hair and everyday rituals.",
  footwear: "Find the right pair for your next step.",
  fashion: "The small details that make it yours.",
};
export function Workspace() {
  const user = usePortalUser()!;
  return (
    <PortalFrame>
      <PortalAccountBar user={user} />
      <section className="portal-heading">
        <span className="portal-eyebrow">YOUR TESTING WORKSPACE</span>
        <h1>Hello, {user.name}.</h1>
        <p>Choose a category and tell us what you’re looking for.</p>
      </section>
      {user.storefronts.length ? (
        <div className="portal-category-grid">
          {(Object.keys(STOREFRONTS) as StorefrontID[])
            .filter((id) => user.storefronts.includes(id))
            .map((id) => {
              const Icon = ICONS[id];
              return (
                <a className="portal-category" href={`/${id}`} key={id}>
                  <div className="portal-category-top">
                    <span className="portal-icon">
                      <Icon size={24} />
                    </span>
                    <span className="portal-category-number">
                      0{(Object.keys(STOREFRONTS) as StorefrontID[]).indexOf(id) + 1} / COLLECTION
                    </span>
                  </div>
                  <h2>{STOREFRONTS[id].label}</h2>
                  <p>{DESCRIPTIONS[id]}</p>
                  <span className="portal-category-link">
                    Start exploring
                    <ArrowRight size={18} />
                  </span>
                </a>
              );
            })}
        </div>
      ) : (
        <div className="portal-card portal-empty">
          <LockKeyhole size={28} />
          <h2>No categories assigned yet</h2>
          <p>Contact your administrator to enable access. Your account is ready.</p>
        </div>
      )}
      <p className="portal-footnote">
        Your conversations are saved to your account. Category access is managed by your
        administrator.
      </p>
    </PortalFrame>
  );
}
export function AccountPage() {
  const user = usePortalUser()!;
  return (
    <PortalFrame>
      <PortalAccountBar user={user} />
      <PasswordForm />
    </PortalFrame>
  );
}
