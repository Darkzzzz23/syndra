import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { firebaseConfigured } from "../firebase/config";

export default function CrmLoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
      navigate("/app", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-aside"><Link className="crm-brand" to="/"><span className="crm-brand-mark">s</span>Syndra</Link><div><p className="eyebrow">A CLEARER VIEW OF YOUR CLIENT WORK</p><h1>Pick up right where the conversation left off.</h1></div><Link className="auth-back" to="/">Back to Syndra</Link></section>
      <section className="auth-main"><div className="auth-form">
        <p className="eyebrow">WELCOME BACK</p><h2>Sign in</h2><p className="form-intro">Open your client workspace.</p>
        {!firebaseConfigured && <div className="notice" role="status">Firebase is not configured. Add the VITE_FIREBASE_* settings to a private .env.local file to enable accounts.</div>}
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <div className="form-meta"><Link to="/reset-password">Forgot password?</Link></div>
          <button className="button button-dark button-full" type="submit" disabled={busy || !firebaseConfigured}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="auth-switch">New to Syndra? <Link to="/signup">Create an account</Link></p>
      </div></section>
    </main>
  );
}