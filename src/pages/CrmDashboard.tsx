import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CrmDashboard() {
  const { profile, signOut } = useAuth();
  return (
    <div className="crm-app-shell">
      <aside className="crm-sidebar">
        <Link className="crm-brand" to="/app"><span className="crm-brand-mark">s</span>Syndra</Link>
        <span className="sidebar-caption">WORKSPACE</span>
        <nav aria-label="Workspace navigation"><Link className="sidebar-link sidebar-link-active" to="/app">Overview</Link><span className="sidebar-link sidebar-link-disabled">Contacts · coming next</span><span className="sidebar-link sidebar-link-disabled">Pipeline · coming next</span><span className="sidebar-link sidebar-link-disabled">Follow-ups · coming next</span></nav>
        <div className="sidebar-user"><span className="user-avatar">{profile?.displayName.slice(0, 1).toUpperCase() || "S"}</span><div><strong>{profile?.displayName}</strong><small>{profile?.workspaceName}</small></div></div>
      </aside>
      <main className="crm-main">
        <header className="crm-topbar"><div><p className="eyebrow">{profile?.workspaceName}</p><h1>Overview</h1></div><div className="topbar-actions"><Link className="button button-light" to="/app/settings">Workspace settings</Link><button className="button button-quiet" onClick={() => void signOut()}>Sign out</button></div></header>
        <section className="workspace-welcome"><p className="eyebrow">YOUR WORKSPACE IS READY</p><h2>Make room for the next good conversation.</h2><p>Your CRM is set up. Contacts, opportunities, and follow-ups will appear here as you add them.</p><div className="welcome-rule"><span>PHASE 1</span><i />ACCOUNT AND WORKSPACE</div></section>
        <section className="workspace-start"><div><span className="start-number">01</span><div><h3>Start with your people</h3><p>Contact management is the first core CRM milestone. Your client data will be private to your account.</p></div></div><span className="coming-label">CONTACTS COMING NEXT</span></section>
      </main>
    </div>
  );
}