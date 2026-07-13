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
    { label: "Documents indexed", value: "4", detail: "+1 this week", trend: "25% growth", icon: FileCheck2 },
    { label: "Questions answered", value: "128", detail: "93% cited", trend: "18 open sessions", icon: MessageSquareText },
    { label: "P95 answer latency", value: "840ms", detail: "within target", trend: "SLA 1.2s", icon: Timer },
    { label: "Retrieval quality", value: "96%", detail: "citation coverage", trend: "7% abstention", icon: Gauge },
  ];

  const pipeline = [
    ["Upload intake", "Healthy", "4 ready spaces", 100],
    ["Text extraction", "Healthy", "PDF / DOCX / TXT", 92],
    ["Chunk + embed", "Healthy", "HNSW cosine", 88],
    ["Answer grounding", "Watch", "7% abstentions", 78],
  ] as const;

  const quality = [
    ["Citation precision", 96],
    ["Answer acceptance", 88],
    ["Policy conflict detection", 82],
    ["Access-scope filtering", 100],
  ] as const;

  const incidents = [
    { level: "P2", label: "Low evidence questions", detail: "9 unanswered prompts need review", icon: AlertTriangle },
    { level: "P3", label: "Stale policy source", detail: "Leave policy has not been refreshed in 42 days", icon: Clock3 },
    { level: "OK", label: "RBAC filters", detail: "All retrieval queries scoped to authorised spaces", icon: ShieldCheck },
  ];

  return (
    <section className="content-grid dashboard-command">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Enterprise command center</span>
          <h2>Document intelligence operations</h2>
          <p>Monitor ingestion health, retrieval quality, answer trust, and compliance posture from one operational view.</p>
        </div>
        <div className="hero-actions">
          <button className="primary" onClick={onOpenChat}>
            Ask a question
            <ArrowRight size={18} />
          </button>
          <span><Sparkles size={16} /> Evidence-only mode active</span>
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
              <span className="eyebrow">Pipeline</span>
              <h2>Ingestion and retrieval health</h2>
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
              <span className="eyebrow">Risk queue</span>
              <h2>Items needing attention</h2>
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
              <span className="eyebrow">Controls</span>
              <h2>Production readiness</h2>
            </div>
          </div>
          <div className="check-list">
            <span><CheckCircle2 size={17} /> Upload pipeline seeded</span>
            <span><CheckCircle2 size={17} /> Citations normalized</span>
            <span><CheckCircle2 size={17} /> Abstention behavior tested</span>
            <span><CheckCircle2 size={17} /> Docker and CI scaffolded</span>
          </div>
        </div>
      </section>

      <section className="dashboard-main-grid">
        <div className="table-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Knowledge spaces</span>
              <h2>Corpus coverage</h2>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Space</th>
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
            <span><Database size={17} /> Benchmark HNSW recall against top policy queries</span>
            <span><Layers3 size={17} /> Add hybrid lexical retrieval for exact clause lookups</span>
            <span><ShieldCheck size={17} /> Review auditor role access before production demo</span>
            <span><MessageSquareText size={17} /> Run golden RAG questions for answer quality</span>
          </div>
        </div>
      </section>
    </section>
  );
}
