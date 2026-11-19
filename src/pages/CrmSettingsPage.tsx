import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CrmSettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [workspaceName, setWorkspaceName] = useState(profile?.workspaceName ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setError("");
    setMessage("");
    try {
      await updateProfile(user.uid, { displayName, workspaceName });
      setMessage("Workspace profile saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your profile.");
    }
  }

  return (
    <div className="crm-app-shell">
      <aside className="crm-sidebar"><Link className="crm-brand" to="/app"><span className="crm-brand-mark">s</span>Syndra</Link><span className="sidebar-caption">WORKSPACE</span><nav aria-label="Workspace navigation"><Link className="sidebar-link" to="/app">Overview</Link></nav></aside>
      <main className="crm-main">
        <header className="crm-topbar"><div><p className="eyebrow">ACCOUNT</p><h1>Workspace settings</h1></div><div className="topbar-actions"><Link className="button button-light" to="/app">Back to overview</Link><button className="button button-quiet" onClick={() => void signOut().then(() => navigate("/login"))}>Sign out</button></div></header>
        <section className="settings-panel"><h2>Profile</h2><p>Your profile and workspace details.</p>{message && <div className="notice notice-success" role="status">{message}</div>}{error && <div className="notice notice-error" role="alert">{error}</div>}
          <form onSubmit={submit}><label>Name<input required maxLength={100} value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label><label>Workspace name<input required maxLength={120} value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} /></label><label>Email<input value={user?.email ?? ""} readOnly /></label><button className="button button-dark" type="submit">Save profile</button></form>
        </section>
        <section className="settings-panel"><h2>Security</h2><p>Use password reset to update your sign-in credentials. Session controls will be added with the account security milestone.</p><Link to="/reset-password">Send a password reset email</Link></section>
      </main>
    </div>
  );
}