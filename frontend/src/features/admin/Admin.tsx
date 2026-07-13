import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  RotateCw,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { FormEvent, useState } from "react";

const initialUsers = [
  ["admin@citeiq.test", "Organisation admin", "CiteIQ Workspace", "Active"],
  ["legal@citeiq.test", "Knowledge editor", "Legal", "Active"],
  ["auditor@citeiq.test", "Auditor", "All spaces", "Review"],
  ["finance@citeiq.test", "Finance reviewer", "Finance", "Active"],
] as const;

const auditEvents = [
  ["admin@citeiq.test", "document.uploaded", "Leave Policy 2026", "2m ago"],
  ["legal@citeiq.test", "document.archived", "Vendor Contract Template", "18m ago"],
  ["auditor@citeiq.test", "chat.evidence.reviewed", "SOC 2 session", "41m ago"],
  ["admin@citeiq.test", "role.updated", "finance@citeiq.test", "1h ago"],
] as const;

export function Admin() {
  const [users, setUsers] = useState<(readonly [string, string, string, string])[]>([...initialUsers]);
  const [auditItems, setAuditItems] = useState<(readonly [string, string, string, string])[]>([...auditEvents]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Knowledge editor");
  const [syncStatus, setSyncStatus] = useState("Ready to sync workspace roles");

  function inviteUser(event: FormEvent) {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    setUsers((current) => [[inviteEmail.trim(), inviteRole, "CiteIQ Workspace", "Invited"], ...current]);
    setAuditItems((current) => [["admin@citeiq.test", "user.invited", inviteEmail.trim(), "now"], ...current]);
    setInviteEmail("");
    setShowInvite(false);
  }

  function syncRoles() {
    setSyncStatus("Roles synced just now");
    setAuditItems((current) => [["admin@citeiq.test", "roles.synced", "CiteIQ Workspace", "now"], ...current]);
  }

  return (
    <section className="content-grid admin-command">
      <section className="admin-hero">
        <div>
          <span className="eyebrow">Workspace administration</span>
          <h2>Enterprise control plane</h2>
          <p>Manage users, roles, security posture, audit trails, and retrieval governance from one production-ready admin surface.</p>
        </div>
        <div className="admin-hero-actions">
          <button className="primary" type="button" onClick={() => setShowInvite((current) => !current)}><UserPlus size={18} /> Invite user</button>
          <button className="ghost-action" type="button" onClick={syncRoles}><RotateCw size={17} /> Sync roles</button>
        </div>
      </section>

      {showInvite && (
        <form className="table-panel inline-action-panel" onSubmit={inviteUser}>
          <div>
            <span className="eyebrow">Invite user</span>
            <h2>Add workspace member</h2>
          </div>
          <label>Email<input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="user@company.com" required /></label>
          <label>Role<select value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}><option>Knowledge editor</option><option>Auditor</option><option>Finance reviewer</option><option>Organisation admin</option></select></label>
          <button className="primary" type="submit"><UserPlus size={18} /> Send invite</button>
        </form>
      )}

      <div className="metric-row compact-metrics">
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Users size={20} /></div><small>Active</small></div>
          <span>Workspace users</span>
          <strong>24</strong>
          <small>4 privileged roles</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><ShieldCheck size={20} /></div><small>Protected</small></div>
          <span>Security posture</span>
          <strong>98%</strong>
          <small>MFA and RBAC healthy</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Activity size={20} /></div><small>Logged</small></div>
          <span>Audit events</span>
          <strong>1.2k</strong>
          <small>last 30 days</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Database size={20} /></div><small>Scoped</small></div>
          <span>Data spaces</span>
          <strong>4</strong>
          <small>RLS-ready boundaries</small>
        </article>
      </div>

      <section className="admin-layout">
        <div className="admin-main">
          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Access management</span>
                <h2>Users and roles</h2>
              </div>
              <span className="count-pill">{users.length} visible</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Scope</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(([email, role, scope, status]) => (
                  <tr key={email}>
                    <td><span className="doc-title"><UserCog size={17} />{email}</span></td>
                    <td>{role}</td>
                    <td>{scope}</td>
                    <td><span className={status === "Review" ? "risk-pill warn" : "risk-pill"}>{status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-grid">
            <section className="table-panel">
              <span className="eyebrow">Audit trail</span>
              <h2>Recent admin activity</h2>
              <div className="admin-timeline">
                {auditItems.map(([actor, action, entity, time]) => (
                  <div className="timeline-row" key={`${actor}-${action}-${time}`}>
                    <Clock3 size={17} />
                    <div><strong>{action}</strong><small>{actor} · {entity}</small></div>
                    <span>{time}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="table-panel">
              <span className="eyebrow">Policy engine</span>
              <h2>Security controls</h2>
              <div className="check-list">
                <span><CheckCircle2 size={17} /> Short-lived JWT access tokens</span>
                <span><CheckCircle2 size={17} /> Rotating refresh-token lineage</span>
                <span><CheckCircle2 size={17} /> Application RBAC boundaries</span>
                <span><CheckCircle2 size={17} /> Retrieval audit logging enabled</span>
              </div>
            </section>
          </section>
        </div>

        <aside className="admin-side">
          <section className="table-panel">
            <span className="eyebrow">Security posture</span>
            <h2>Control readiness</h2>
            <div className="settings-list">
              <span><strong><LockKeyhole size={17} /> Authentication</strong><small>MFA policy ready, session timeout enforced</small></span>
              <span><strong><KeyRound size={17} /> Key rotation</strong><small>JWT secret rotation window configured</small></span>
              <span><strong><Fingerprint size={17} /> Audit identity</strong><small>Actor attribution recorded for admin actions</small></span>
            </div>
          </section>

          <section className="table-panel">
              <span className="eyebrow">Workspace guardrails</span>
              <h2>Operational controls</h2>
              <p className="empty">{syncStatus}</p>
            <div className="admin-actions-list">
              <button type="button"><SlidersHorizontal size={17} /> Configure RBAC</button>
              <button type="button"><Database size={17} /> Manage data spaces</button>
              <button type="button"><ShieldCheck size={17} /> Review security baseline</button>
            </div>
          </section>

          <section className="table-panel">
            <span className="eyebrow">Attention</span>
            <h2>Admin queue</h2>
            <div className="risk-list">
              <div className="risk-row"><AlertTriangle size={18} /><div><strong>Auditor access review</strong><small>Review all-space access before demo</small></div><span className="risk-pill warn">Open</span></div>
              <div className="risk-row"><CheckCircle2 size={18} /><div><strong>Production workspace</strong><small>Core controls are ready</small></div><span className="risk-pill">Ready</span></div>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
