import { FormEvent, useState } from "react";
import axios from "axios";
import { ArrowRight, CheckCircle2, FileText, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { login, signup } from "../../api/auth";
import type { AuthResponse } from "../../api/types";

type Mode = "login" | "signup";

export function AuthPage({ onAuthenticated }: { onAuthenticated: (auth: AuthResponse) => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@citeiq.test");
  const [password, setPassword] = useState("password");
  const [organisation, setOrganisation] = useState("CiteIQ Workspace");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
    if (nextMode === "login") {
      setName("");
      setEmail("admin@citeiq.test");
      setPassword("password");
      setOrganisation("CiteIQ Workspace");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setOrganisation("CiteIQ Workspace");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "login") {
        const auth = await login({ email, password });
        onAuthenticated(auth);
        return;
      }
      const signupEmail = email.trim();
      await signup({ name, email: signupEmail, password, organisation });
      setMode("login");
      setName("");
      setEmail(signupEmail);
      setPassword("");
      setOrganisation("CiteIQ Workspace");
      setSuccess("Account created successfully. Please login to continue.");
    } catch (caught) {
      if (axios.isAxiosError(caught)) {
        const detail = caught.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Authentication request failed.");
      } else {
        setError(mode === "login" ? "Invalid email or password." : "Could not create this workspace user.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="auth-brand-top">
          <div className="brand-mark auth-logo">
            <FileText className="brand-doc" size={30} />
            <span>IQ</span>
          </div>
          <div>
            <strong>CiteIQ</strong>
            <small>Document Intelligence Cloud</small>
          </div>
        </div>
        <div className="auth-copy">
          <span className="eyebrow">Enterprise RAG Intelligence</span>
          <h1>Answers your teams can trust.</h1>
          <p>Upload internal documents, ask natural-language questions, and get grounded answers with source citations, access controls, and audit-ready workflows.</p>
        </div>
        <div className="auth-metrics">
          <span><strong>96%</strong><small>citation coverage</small></span>
          <span><strong>840ms</strong><small>p95 answer latency</small></span>
          <span><strong>4</strong><small>spaces indexed</small></span>
        </div>
        <div className="auth-points">
          <span><CheckCircle2 size={16} /> Evidence-only answers</span>
          <span><CheckCircle2 size={16} /> Role-aware access</span>
          <span><CheckCircle2 size={16} /> Audit-ready citations</span>
        </div>
      </section>
      <section className="auth-card">
        <div className="auth-card-head">
          <span><ShieldCheck size={18} /> Secure workspace access</span>
          <small>{mode === "login" ? "Use the demo account or your workspace login." : "Create a local demo workspace user."}</small>
        </div>
        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Login</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>Sign up</button>
        </div>
        <form onSubmit={submit}>
          <div>
            <span className="eyebrow">{mode === "login" ? "Welcome back" : "Create account"}</span>
            <h2>{mode === "login" ? "Login to CiteIQ" : "Start your workspace"}</h2>
          </div>
          {mode === "signup" && (
            <>
              <label>
                Name
                <span className="auth-input"><UserRound size={17} /><input value={name} onChange={(event) => setName(event.target.value)} required /></span>
              </label>
              <label>
                Organisation
                <span className="auth-input"><FileText size={17} /><input value={organisation} onChange={(event) => setOrganisation(event.target.value)} required /></span>
              </label>
            </>
          )}
          <label>
            Email
            <span className="auth-input"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></span>
          </label>
          <label>
            Password
            <span className="auth-input"><LockKeyhole size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></span>
          </label>
          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}
          <button className="primary" disabled={loading}>
            {loading ? "Please wait" : mode === "login" ? "Login" : "Create account"}
            <ArrowRight size={18} />
          </button>
          <p className="auth-hint"><Sparkles size={15} /> Demo login: admin@citeiq.test / password</p>
        </form>
      </section>
    </main>
  );
}
