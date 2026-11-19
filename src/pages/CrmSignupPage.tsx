import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { firebaseConfigured } from "../firebase/config";

export default function CrmSignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signUp(email, password, displayName, workspaceName);
      navigate("/app", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-aside"><Link className="crm-brand" to="/"><span className="crm-brand-mark">s</span>Syndra</Link><div><p className="eyebrow">A GOOD FIRST STEP</p><h1>Bring your client work into focus.</h1></div><Link className="auth-back" to="/">Back to Syndra</Link></section>
      <section className="auth-main"><div className="auth-form">
        <p className="eyebrow">GET STARTED</p><h2>Create your workspace</h2><p className="form-intro">Start with the people and business you already know.</p>
        {!firebaseConfigured && <div className="notice" role="status">Firebase is not configured. Add the VITE_FIREBASE_* settings to a private .env.local file to enable accounts.</div>}
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <label>Your name<input autoComplete="name" required maxLength={100} value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
          <label>Business or workspace<input required maxLength={120} value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} /></label>
          <label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <p className="field-note">Use 12 to 128 characters.</p>
          <button className="button button-dark button-full" type="submit" disabled={busy || !firebaseConfigured}>{busy ? "Creating workspace…" : "Create workspace"}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div></section>
    </main>
  );
}