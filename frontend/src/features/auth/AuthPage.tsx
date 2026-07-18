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
  const [confirmPassword, setConfirmPassword] = useState("");
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
      setConfirmPassword("");
      setOrganisation("CiteIQ Workspace");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
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
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!isStrongPassword(password)) {
        setError("Password must be at least 8 characters and include a letter and a number.");
        return;
      }
      await signup({ name, email: signupEmail, password, organisation });
      setMode("login");
      setName("");
      setEmail(signupEmail);
      setPassword("");
      setConfirmPassword("");
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
          <span className="eyebrow">Enterprise Document Intelligence</span>
          <h1>Answers your teams can trust.</h1>
          <p>Upload internal documents, ask questions in simple language, and get trusted answers with clear source references and secure team access.</p>
        </div>
        <div className="auth-metrics">
          <span><strong>96%</strong><small>source accuracy</small></span>
          <span><strong>840ms</strong><small>answer speed</small></span>
          <span><strong>4</strong><small>document groups</small></span>
        </div>
        <div className="auth-points">
          <span><CheckCircle2 size={16} /> Answers from your files</span>
          <span><CheckCircle2 size={16} /> Access based on role</span>
          <span><CheckCircle2 size={16} /> Clear source references</span>
        </div>
      </section>
      <section className="auth-card">
        <div className="auth-card-head">
          <span><ShieldCheck size={18} /> Secure workspace access</span>
          <small>{mode === "login" ? "Use the demo account or your company login." : "Create a standard user account. Admin can update access later."}</small>
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
            <span className="auth-input"><LockKeyhole size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={mode === "signup" ? 8 : 6} required /></span>
          </label>
          {mode === "signup" && (
            <>
              <label>
                Confirm password
                <span className="auth-input"><LockKeyhole size={17} /><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></span>
              </label>
              <div className="password-rules">
                <span className={password.length >= 8 ? "ok" : ""}><CheckCircle2 size={14} /> 8 or more characters</span>
                <span className={/[A-Za-z]/.test(password) ? "ok" : ""}><CheckCircle2 size={14} /> Includes a letter</span>
                <span className={/\d/.test(password) ? "ok" : ""}><CheckCircle2 size={14} /> Includes a number</span>
                <span className={password && password === confirmPassword ? "ok" : ""}><CheckCircle2 size={14} /> Passwords match</span>
              </div>
            </>
          )}
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

function isStrongPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}
