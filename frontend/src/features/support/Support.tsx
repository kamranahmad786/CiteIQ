import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  LifeBuoy,
  Mail,
  MessageCircleQuestion,
  PhoneCall,
  Rocket,
  ServerCog,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { FormEvent, useState } from "react";

const initialTickets = [
  ["CIT-1042", "Citation mismatch review", "Quality", "P2", "In progress"],
  ["CIT-1037", "Bulk ingestion validation", "Documents", "P3", "Waiting"],
  ["CIT-1029", "RBAC policy question", "Security", "P2", "Resolved"],
] as const;

const helpTopics = [
  ["Document upload and ingestion", "Chunking, metadata, supported formats", LifeBuoy],
  ["Citation quality and abstentions", "Grounding, evidence checks, answer review", MessageCircleQuestion],
  ["Deployment with Docker and Compose", "Local services, environment variables", BookOpen],
  ["Provider key configuration", "Model, embedding, and vector settings", Mail],
] as const;

export function Support() {
  const [tickets, setTickets] = useState<(readonly [string, string, string, string, string])[]>([...initialTickets]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketArea, setTicketArea] = useState("Documents");
  const [supportStatus, setSupportStatus] = useState("Support desk ready");

  function openTicket(event: FormEvent) {
    event.preventDefault();
    if (!ticketTitle.trim()) return;
    const id = `CIT-${1043 + tickets.length}`;
    setTickets((current) => [[id, ticketTitle.trim(), ticketArea, "P3", "Open"], ...current]);
    setTicketTitle("");
    setShowTicketForm(false);
    setSupportStatus(`${id} opened`);
  }

  function escalateP1() {
    setTickets((current) => [["CIT-P1", "Production escalation bridge requested", "Platform", "P1", "Escalated"], ...current]);
    setSupportStatus("P1 escalation created and response bridge requested");
  }

  return (
    <section className="content-grid support-command">
      <section className="support-hero">
        <div>
          <span className="eyebrow">Enterprise support center</span>
          <h2>CiteIQ service desk</h2>
          <p>Track support cases, monitor platform readiness, find implementation help, and escalate production issues from one support workspace.</p>
        </div>
        <div className="support-hero-actions">
          <button className="primary" type="button" onClick={() => setShowTicketForm((current) => !current)}><Ticket size={18} /> Open ticket</button>
          <button className="ghost-action" type="button" onClick={escalateP1}><PhoneCall size={17} /> Escalate P1</button>
        </div>
      </section>

      {showTicketForm && (
        <form className="table-panel inline-action-panel" onSubmit={openTicket}>
          <div>
            <span className="eyebrow">New support case</span>
            <h2>Create ticket</h2>
          </div>
          <label>Issue title<input value={ticketTitle} onChange={(event) => setTicketTitle(event.target.value)} placeholder="Describe the issue" required /></label>
          <label>Area<select value={ticketArea} onChange={(event) => setTicketArea(event.target.value)}><option>Documents</option><option>Chat</option><option>Security</option><option>Platform</option></select></label>
          <button className="primary" type="submit"><Ticket size={18} /> Submit</button>
        </form>
      )}

      <div className="metric-row compact-metrics">
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Headphones size={20} /></div><small>Live</small></div>
          <span>Open cases</span>
          <strong>{tickets.length}</strong>
          <small>{supportStatus}</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Clock3 size={20} /></div><small>SLA</small></div>
          <span>First response</span>
          <strong>18m</strong>
          <small>target under 30m</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><CheckCircle2 size={20} /></div><small>Healthy</small></div>
          <span>Resolution rate</span>
          <strong>94%</strong>
          <small>last 30 days</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><ServerCog size={20} /></div><small>Online</small></div>
          <span>Platform status</span>
          <strong>99.9%</strong>
          <small>demo environment</small>
        </article>
      </div>

      <section className="support-layout">
        <div className="support-main">
          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Case management</span>
                <h2>Support queue</h2>
              </div>
              <span className="count-pill">{tickets.length} active</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Area</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(([id, title, area, priority, status]) => (
                  <tr key={id}>
                    <td><span className="doc-title"><Ticket size={17} />{id}</span><small>{title}</small></td>
                    <td>{area}</td>
                    <td><span className={priority === "P1" || priority === "P2" ? "risk-pill warn" : "risk-pill"}>{priority}</span></td>
                    <td><span className="status">{status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="support-grid">
            <section className="table-panel">
              <span className="eyebrow">Knowledge base</span>
              <h2>Help topics</h2>
              <div className="support-topic-grid">
                {helpTopics.map(([title, detail, Icon]) => (
                  <button type="button" key={title}>
                    <Icon size={18} />
                    <span>{title}</span>
                    <small>{detail}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="table-panel">
              <span className="eyebrow">System status</span>
              <h2>Service readiness</h2>
              <div className="check-list">
                <span><CheckCircle2 size={17} /> API healthy</span>
                <span><CheckCircle2 size={17} /> Frontend build passing</span>
                <span><CheckCircle2 size={17} /> Seed corpus available</span>
                <span><CheckCircle2 size={17} /> Local RAG checks passing</span>
              </div>
            </section>
          </section>
        </div>

        <aside className="support-side">
          <section className="table-panel">
            <span className="eyebrow">Escalation path</span>
            <h2>Production response</h2>
            <div className="support-escalation">
              <span><AlertCircle size={17} /><strong>P1 outage</strong><small>Immediate incident bridge and platform owner page</small></span>
              <span><Clock3 size={17} /><strong>P2 degraded</strong><small>30 minute response, same-day mitigation plan</small></span>
              <span><Rocket size={17} /><strong>Implementation help</strong><small>Architecture, ingestion, and deployment guidance</small></span>
            </div>
          </section>

          <section className="table-panel">
            <span className="eyebrow">Channels</span>
            <h2>Contact options</h2>
            <div className="admin-actions-list">
              <button type="button"><Mail size={17} /> Email support</button>
              <button type="button"><MessageCircleQuestion size={17} /> Start workspace chat</button>
              <button type="button"><BookOpen size={17} /> Open documentation</button>
            </div>
          </section>

          <section className="table-panel">
            <span className="eyebrow">Trust</span>
            <h2>Support guardrails</h2>
            <div className="settings-list">
              <span><strong><ShieldCheck size={17} /> Secure handling</strong><small>No secrets or customer data required in tickets</small></span>
              <span><strong><FileText size={17} /> Evidence capture</strong><small>Attach request ID, document title, and citation ID</small></span>
              <span><strong><LifeBuoy size={17} /> Guided triage</strong><small>Support routes issues to ingestion, retrieval, or access owners</small></span>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
