import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { firebaseConfigured } from "../firebase/config";

export default function CrmResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSent(false);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send the reset email.");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-aside"><Link className="crm-brand" to="/"><span className="crm-brand-mark">s</span>Syndra</Link><div><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Get back to the work that matters.</h1></div><Link className="auth-back" to="/login">Back to sign in</Link></section>
      <section className="auth-main"><div className="auth-form">
        <p className="eyebrow">PASSWORD RESET</p><h2>Reset your password</h2><p className="form-intro">We’ll send a reset link to the email on your account.</p>
        {!firebaseConfigured && <div className="notice" role="status">Firebase is not configured. Add the VITE_FIREBASE_* settings to a private .env.local file.</div>}
        {sent && <div className="notice notice-success" role="status">If an account exists for that address, a reset email is on its way.</div>}
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <form onSubmit={submit}><label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className="button button-dark button-full" disabled={!firebaseConfigured}>Send reset link</button></form>
        <p className="auth-switch"><Link to="/login">Return to sign in</Link></p>
      </div></section>
    </main>
  );
}