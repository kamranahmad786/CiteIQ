import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  FileCheck2,
  Gauge,
  Layers3,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";

export function Dashboard({ onOpenChat }: { onOpenChat: () => void }) {
  const metrics = [
    { label: "Documents ready", value: "4", detail: "+1 this week", trend: "25% growth", icon: FileCheck2 },
    { label: "Questions answered", value: "128", detail: "93% with sources", trend: "18 open chats", icon: MessageSquareText },
    { label: "Answer speed", value: "840ms", detail: "within target", trend: "target 1.2s", icon: Timer },
    { label: "Answer trust", value: "96%", detail: "source accuracy", trend: "7% no-answer rate", icon: Gauge },
  ];

  const pipeline = [
    ["Document uploads", "Healthy", "4 ready groups", 100],
    ["Text extraction", "Healthy", "PDF / DOCX / TXT", 92],
    ["Search preparation", "Healthy", "text sections ready", 88],
    ["Answer safety", "Watch", "7% no-answer rate", 78],
  ] as const;

  const quality = [
    ["Source accuracy", 96],
    ["Answer acceptance", 88],
    ["Conflicting rule checks", 82],
    ["Access protection", 100],
  ] as const;

  const incidents = [
    { level: "P2", label: "Questions need better sources", detail: "9 unanswered questions need review", icon: AlertTriangle },
    { level: "P3", label: "Stale policy source", detail: "Leave policy has not been refreshed in 42 days", icon: Clock3 },
    { level: "OK", label: "Access rules", detail: "Users only search documents they can access", icon: ShieldCheck },
  ];

  return (
    <section className="content-grid dashboard-command">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Business dashboard</span>
          <h2>Document answer overview</h2>
          <p>Track document uploads, answer quality, source trust, and team readiness from one simple view.</p>
        </div>
        <div className="hero-actions">
          <button className="primary" onClick={onOpenChat}>
            Ask a question
            <ArrowRight size={18} />
          </button>
          <span><Sparkles size={16} /> Answers use company documents only</span>
        </div>
      </section>

      <div className="metric-row">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="metric-card command-metric" key={metric.label}>
              <div className="metric-card-top">
                <div className="metric-icon"><Icon size={20} /></div>
                <small><TrendingUp size={14} /> {metric.trend}</small>
              </div>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          );
        })}
      </div>

      <section className="dashboard-main-grid">
        <div className="table-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Processing</span>
              <h2>Upload and search health</h2>
            </div>
            <span className="count-pill">Live</span>
          </div>
          <div className="pipeline-list">
            {pipeline.map(([name, status, detail, value]) => (
              <div className="pipeline-row" key={name}>
                <div>
                  <strong>{name}</strong>
                  <small>{detail}</small>
                </div>
                <span className={status === "Watch" ? "risk-pill warn" : "risk-pill"}>{status}</span>
                <div className="mini-meter"><i style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Trust</span>
              <h2>Answer quality scorecard</h2>
            </div>
            <span className="count-pill">A-</span>
          </div>
          <div className="bars">
            {quality.map(([label, value]) => (
              <div className="bar-row" key={label}>
                <span>{label}</span>
                <div><i style={{ width: `${value}%` }} /></div>
                <strong>{value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-lower">
        <div className="table-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Attention needed</span>
              <h2>Items to review</h2>
            </div>
            <span className="count-pill">3 signals</span>
          </div>
          <div className="risk-list">
            {incidents.map((item) => {
              const Icon = item.icon;
              return (
                <div className="risk-row" key={item.label}>
                  <Icon size={18} />
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </div>
                  <span className={item.level === "OK" ? "risk-pill" : "risk-pill warn"}>{item.level}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="table-panel readiness-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Readiness</span>
              <h2>Launch checklist</h2>
            </div>
          </div>
          <div className="check-list">
            <span><CheckCircle2 size={17} /> Sample uploads ready</span>
            <span><CheckCircle2 size={17} /> Source links cleaned</span>
            <span><CheckCircle2 size={17} /> Safe no-answer behavior tested</span>
            <span><CheckCircle2 size={17} /> Build checks ready</span>
          </div>
        </div>
      </section>

      <section className="dashboard-main-grid">
        <div className="table-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Document groups</span>
              <h2>Coverage by team</h2>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Group</th>
                <th>Documents</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>HR Policies</td><td>1</td><td>People Ops</td><td><span className="status">ready</span></td></tr>
              <tr><td>Finance</td><td>1</td><td>Finance Ops</td><td><span className="status">ready</span></td></tr>
              <tr><td>Legal</td><td>1</td><td>Legal</td><td><span className="status">ready</span></td></tr>
              <tr><td>Engineering</td><td>1</td><td>Platform</td><td><span className="status">ready</span></td></tr>
            </tbody>
          </table>
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Recommended actions</span>
              <h2>Next best moves</h2>
            </div>
          </div>
          <div className="question-list dashboard-actions-list">
            <span><Database size={17} /> Test search accuracy with common policy questions</span>
            <span><Layers3 size={17} /> Improve exact matches for important clauses</span>
            <span><ShieldCheck size={17} /> Review auditor access before demo</span>
            <span><MessageSquareText size={17} /> Run sample questions to confirm answer quality</span>
          </div>
        </div>
      </section>
    </section>
  );
}
