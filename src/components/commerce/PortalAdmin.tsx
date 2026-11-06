import { PortalDialog } from "./PortalDialog";
import { usePortalUser } from "@/features/commerce/portal-context";
import { useEffect, useState, type FormEvent } from "react";
import { Plus, Search, ShieldCheck, X, Copy, Check } from "lucide-react";
import { portalRequest, type PortalUser } from "@/features/commerce/portal-client";
import { STOREFRONTS, type StorefrontID } from "@/features/commerce/storefronts";
import { PortalAccountBar, PortalFrame } from "./Portal";

type Draft = {
  id?: string;
  username: string;
  role: "admin" | "user";
  enabled: boolean;
  storefronts: StorefrontID[];
};
type Audit = { id: number; actor: string; action: string; subject: string; created_at: number };
const blank = (): Draft => ({ username: "", role: "user", enabled: true, storefronts: [] });
function date(value: number | null) {
  return value ? new Date(value * 1000).toLocaleString() : "Not yet";
}
export function PortalAdmin() {
  const me = usePortalUser()!;
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [events, setEvents] = useState<Audit[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [secret, setSecret] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<PortalUser | null>(null);
  const [purge, setPurge] = useState(false);
  const [resetting, setResetting] = useState<PortalUser | null>(null);
  async function reload() {
    const [a, b] = await Promise.all([
      portalRequest<{ users: PortalUser[] }>("admin/users"),
      portalRequest<{ events: Audit[] }>("admin/audit"),
    ]);
    setUsers(a.users);
    setEvents(b.events);
    setLoaded(true);
  }
  useEffect(() => {
    let active = true;
    Promise.all([
      portalRequest<{ users: PortalUser[] }>("admin/users"),
      portalRequest<{ events: Audit[] }>("admin/audit"),
    ])
      .then(([a, b]) => {
        if (active) {
          setUsers(a.users);
          setEvents(b.events);
          setLoaded(true);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    setError("");
    try {
      const result = await portalRequest<{ temporary_password?: string }>(
        draft.id ? `admin/users/${draft.id}` : "admin/users",
        "POST",
        {
          ...(draft.id ? {} : { username: draft.username }),
          role: draft.role,
          enabled: draft.enabled,
          storefronts: draft.storefronts,
        },
      );
      if (result.temporary_password) {
        setCopied(false);
        setSecret({ username: draft.username, password: result.temporary_password });
      }
      const selfChanged = draft.id === me.id && (!draft.enabled || draft.role !== "admin");
      setDraft(null);
      if (selfChanged) {
        window.location.assign("/commerce/login");
        return;
      }
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save user");
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    if (!resetting) return;
    setBusy(true);
    setError("");
    try {
      const result = await portalRequest<{ temporary_password: string }>(
        `admin/users/${resetting.id}/password`,
        "POST",
      );
      setCopied(false);
      setSecret({ username: resetting.name, password: result.temporary_password });
      setResetting(null);
      if (resetting.id !== me.id) await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reset password");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    setError("");
    try {
      await portalRequest(`admin/users/${deleting.id}?purge_history=${purge}`, "DELETE");
      setDeleting(null);
      if (deleting.id === me.id) {
        window.location.assign("/commerce/login");
        return;
      }
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete user");
    } finally {
      setBusy(false);
    }
  }
  const filtered = users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));
  const modal = draft || secret || deleting || resetting;
  return (
    <PortalFrame>
      <PortalAccountBar user={me} />
      <section className="portal-heading portal-admin-heading">
        <div>
          <span className="portal-eyebrow">ADMINISTRATION</span>
          <h1>People & access</h1>
          <p>A private workspace, with access you control.</p>
        </div>
        <button
          className="portal-primary"
          onClick={() => {
            setError("");
            setDraft(blank());
          }}
        >
          <Plus size={17} />
          Create user
        </button>
      </section>
      <div className="portal-stats">
        <div>
          <strong>{users.length}</strong>
          <span>Total users</span>
        </div>
        <div>
          <strong>{users.filter((u) => u.enabled).length}</strong>
          <span>Active accounts</span>
        </div>
        <div>
          <strong>{users.filter((u) => u.role === "admin").length}</strong>
          <span>Administrators</span>
        </div>
      </div>
      {error && !modal && (
        <p className="portal-error" role="alert">
          {error}
        </p>
      )}
      <section className="portal-card portal-users">
        <div className="portal-table-heading">
          <h2>Users</h2>
          <label className="portal-search">
            <Search size={16} />
            <input
              aria-label="Search users"
              placeholder="Search by username"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="portal-table-scroll">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Category access</th>
                <th>Last login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    <small>
                      {u.role === "admin" ? "Administrator" : "Tester"}
                      {u.id === me.id ? " · You" : ""}
                    </small>
                  </td>
                  <td>
                    <span className={`portal-badge ${u.enabled ? "is-active" : ""}`}>
                      {u.enabled ? "Active" : "Disabled"}
                    </span>
                    {u.must_change_password ? <small>Password change required</small> : null}
                  </td>
                  <td>
                    <div className="portal-grants">
                      {u.storefronts.length ? (
                        u.storefronts.map((s) => <span key={s}>{STOREFRONTS[s].label}</span>)
                      ) : (
                        <span>No categories assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="portal-date">{date(u.last_login)}</td>
                  <td>
                    <div className="portal-row-actions">
                      <button
                        onClick={() => {
                          setError("");
                          setDraft({
                            id: u.id,
                            username: u.name,
                            role: u.role,
                            enabled: Boolean(u.enabled),
                            storefronts: u.storefronts,
                          });
                        }}
                      >
                        Edit access
                      </button>
                      <button
                        onClick={() => {
                          setError("");
                          setResetting(u);
                        }}
                      >
                        Reset password
                      </button>
                      <button
                        className="portal-danger-text"
                        onClick={() => {
                          setError("");
                          setPurge(false);
                          setDeleting(u);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="portal-empty">
              {loaded ? "No users match your search." : "Loading accounts…"}
            </p>
          )}
        </div>
      </section>
      <section className="portal-card portal-audit">
        <h2>Recent account activity</h2>
        <p>Account and access changes are recorded without passwords or chat contents.</p>
        <ul>
          {events.slice(0, 20).map((e) => (
            <li key={e.id}>
              <span>
                <strong>{e.actor}</strong> · {e.action.replaceAll("_", " ")} · {e.subject}
              </span>
              <time>{date(e.created_at)}</time>
            </li>
          ))}
        </ul>
      </section>
      {modal && (
        <PortalDialog
          busy={busy}
          onClose={() => {
            setDraft(null);
            setSecret(null);
            setDeleting(null);
            setResetting(null);
            setError("");
          }}
        >
          <button
            className="portal-close"
            aria-label="Close dialog"
            disabled={busy}
            onClick={() => {
              setDraft(null);
              setSecret(null);
              setDeleting(null);
              setResetting(null);
              setError("");
            }}
          >
            <X size={21} />
          </button>
          {secret ? (
            <>
              <span className="portal-icon">
                <ShieldCheck size={24} />
              </span>
              <h2 id="portal-dialog-title">Account credentials</h2>
              <p>
                Share these privately with <strong>{secret.username}</strong>. This temporary
                password is shown only now.
              </p>
              <label>
                Username
                <input readOnly value={secret.username} />
              </label>
              <label>
                Temporary password
                <input readOnly value={secret.password} autoComplete="off" />
              </label>
              <button
                className="portal-primary"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(
                      `Username: ${secret.username}\nTemporary password: ${secret.password}\nSign in: ${window.location.origin}/commerce/login`,
                    )
                    .then(() => setCopied(true))
                    .catch(() =>
                      setError("Copy unavailable. Select the fields above to copy manually."),
                    );
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy login details"}
              </button>
              <small>
                The user must change this password at first login. You can generate a new one later.
              </small>
            </>
          ) : draft ? (
            <form onSubmit={(e) => void save(e)}>
              <h2 id="portal-dialog-title">{draft.id ? "Edit access" : "Create user"}</h2>
              <p>{draft.id ? draft.username : "Set up a tester and choose their categories."}</p>
              {!draft.id && (
                <label>
                  Username
                  <input
                    autoFocus
                    required
                    minLength={3}
                    maxLength={64}
                    pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}"
                    value={draft.username}
                    autoCapitalize="none"
                    onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                  />
                </label>
              )}
              <label>
                Role
                <select
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value as Draft["role"] })}
                >
                  <option value="user">Tester</option>
                  <option value="admin">Administrator</option>
                </select>
              </label>
              {draft.role === "admin" && (
                <small>Administrators can manage all users and category permissions.</small>
              )}
              <fieldset>
                <legend>Category access</legend>
                {(Object.keys(STOREFRONTS) as StorefrontID[]).map((s) => (
                  <label className="portal-check" key={s}>
                    <input
                      type="checkbox"
                      checked={draft.storefronts.includes(s)}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          storefronts: e.target.checked
                            ? [...draft.storefronts, s]
                            : draft.storefronts.filter((v) => v !== s),
                        })
                      }
                    />
                    {STOREFRONTS[s].label}
                  </label>
                ))}
              </fieldset>
              {draft.id && (
                <label className="portal-check">
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                  />
                  Account enabled
                </label>
              )}
              <button className="portal-primary" disabled={busy}>
                {busy ? "Saving…" : draft.id ? "Save changes" : "Create & generate password"}
              </button>
            </form>
          ) : deleting ? (
            <>
              <h2 id="portal-dialog-title">Delete {deleting.name}?</h2>
              <p>
                This removes their access and signs them out on all devices. The username remains
                reserved for audit records.
              </p>
              <label className="portal-check">
                <input
                  type="checkbox"
                  checked={purge}
                  onChange={(e) => setPurge(e.target.checked)}
                />
                Also delete this user’s saved conversations
              </label>
              <button
                className="portal-primary portal-danger"
                disabled={busy}
                onClick={() => void remove()}
              >
                {busy ? "Deleting…" : "Delete user"}
              </button>
            </>
          ) : resetting ? (
            <>
              <h2 id="portal-dialog-title">Reset {resetting.name}’s password?</h2>
              <p>This signs them out on all devices and generates a new temporary password.</p>
              <button className="portal-primary" disabled={busy} onClick={() => void reset()}>
                {busy ? "Resetting…" : "Generate temporary password"}
              </button>
            </>
          ) : null}
          {error && (
            <p className="portal-error" role="alert">
              {error}
            </p>
          )}
        </PortalDialog>
      )}
    </PortalFrame>
  );
}
