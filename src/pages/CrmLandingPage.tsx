import { Link } from "react-router-dom";

export default function CrmLandingPage() {
  return (
    <main className="crm-landing">
      <header className="crm-public-header">
        <Link className="crm-brand" to="/" aria-label="Syndra home"><span className="crm-brand-mark">s</span>Syndra</Link>
        <nav aria-label="Main navigation"><Link to="/login">Sign in</Link><Link className="button button-dark" to="/signup">Create your workspace</Link></nav>
      </header>
      <section className="crm-hero">
        <div className="crm-hero-copy">
          <p className="eyebrow">A CALMER WAY TO RUN YOUR CLIENT BUSINESS</p>
          <h1>Never lose a client because you forgot to follow up.</h1>
          <p>Keep client details, opportunities, and next steps together, so the important conversations do not slip through the cracks.</p>
          <div className="hero-actions"><Link className="button button-dark" to="/signup">Start with Syndra</Link><Link className="quiet-link" to="/login">I already have an account <span aria-hidden="true">→</span></Link></div>
        </div>
        <div className="crm-preview" aria-label="Syndra workspace preview">
          <div className="preview-topline"><span>YOUR WORKSPACE</span><span className="preview-live"><i />READY WHEN YOU ARE</span></div>
          <div className="preview-welcome"><span className="preview-index">01</span><div><strong>Good work starts with a clear next step.</strong><p>Your people, opportunities, and follow-ups belong in one place.</p></div></div>
          <div className="preview-lines"><span /><span /><span /></div>
          <div className="preview-foot">CONTACTS <b>·</b> DEALS <b>·</b> FOLLOW-UPS</div>
        </div>
      </section>
      <section className="crm-value-row">
        <div><span>01</span><h2>Know who needs you</h2><p>Keep a clear record of every person and where the conversation stands.</p></div>
        <div><span>02</span><h2>See work move forward</h2><p>Track opportunities from first conversation to decision.</p></div>
        <div><span>03</span><h2>Follow through</h2><p>Keep your next client commitment visible and easy to act on.</p></div>
      </section>
      <footer className="crm-public-footer"><span>SYNDRA · CLIENT WORK, KEPT IN VIEW</span><span>syndrahub.com</span></footer>
    </main>
  );
}