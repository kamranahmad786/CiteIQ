import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  LineChart,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const qualityMetrics = [
  ["Answer speed", 72, "840ms average target"],
  ["Answer quality", 88, "human-reviewed score"],
  ["Source coverage", 96, "answers with source links"],
  ["Upload success", 91, "last 7 days"],
] as const;

const citedDocuments = [
  ["Leave Policy 2026", "HR Policies", 42, 96],
  ["Expense Reimbursement Guide", "Finance", 31, 92],
  ["Vendor Contract Template", "Legal", 24, 89],
  ["Engineering Incident Runbook", "Engineering", 18, 87],
] as const;

const dailyUsage = [
  ["Mon", 42],
  ["Tue", 56],
  ["Wed", 49],
  ["Thu", 74],
  ["Fri", 68],
  ["Sat", 38],
  ["Sun", 44],
] as const;

export function Analytics() {
  return (
    <section className="content-grid analytics-command">
      <section className="analytics-hero">
        <div>
          <span className="eyebrow">Reports</span>
          <h2>Answer and usage overview</h2>
          <p>Track answer quality, source accuracy, user activity, response speed, and launch readiness across CiteIQ.</p>
        </div>
        <div className="analytics-hero-card">
          <span><ShieldCheck size={16} /> Executive health</span>
          <strong>96%</strong>
          <small>answers with source links across document groups</small>
        </div>
      </section>

      <div className="metric-row compact-metrics">
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Sparkles size={20} /></div><small>Trusted</small></div>
          <span>Trusted answer rate</span>
          <strong>93%</strong>
          <small>+4.8% vs last week</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Clock3 size={20} /></div><small>Target</small></div>
          <span>Answer speed</span>
          <strong>840ms</strong>
          <small>within target</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Users size={20} /></div><small>Adoption</small></div>
          <span>Active users</span>
          <strong>128</strong>
          <small>34 power users</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><FileText size={20} /></div><small>Documents</small></div>
          <span>Ready documents</span>
          <strong>4</strong>
          <small>4 document groups</small>
        </article>
      </div>

      <section className="analytics-layout">
        <div className="analytics-main">
          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Quality</span>
                <h2>Quality metrics</h2>
              </div>
              <span className="count-pill">weekly view</span>
            </div>
            <div className="analytics-bars">
              {qualityMetrics.map(([label, value, detail]) => (
                <div className="analytics-bar-row" key={label}>
                  <div>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </div>
                  <div className="analytics-meter"><i style={{ width: `${value}%` }} /></div>
                  <span>{value}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Adoption</span>
                <h2>Question volume trend</h2>
              </div>
              <span className="risk-pill">+18% WoW</span>
            </div>
            <div className="usage-chart" aria-label="Daily question volume">
              {dailyUsage.map(([day, value]) => (
                <div className="usage-column" key={day}>
                  <span style={{ height: `${value}%` }} />
                  <small>{day}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Source usage</span>
                <h2>Most referenced documents</h2>
              </div>
              <span className="count-pill">4 indexed</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Group</th>
                  <th>Sources</th>
                  <th>Coverage</th>
                </tr>
              </thead>
              <tbody>
                {citedDocuments.map(([title, space, citations, coverage]) => (
                  <tr key={title}>
                    <td><span className="doc-title"><FileText size={17} />{title}</span></td>
                    <td>{space}</td>
                    <td>{citations}</td>
                    <td><span className="risk-pill">{coverage}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="analytics-side">
          <section className="table-panel">
            <span className="eyebrow">Review</span>
            <h2>Risk signals</h2>
            <div className="risk-list">
              <div className="risk-row"><CheckCircle2 size={18} /><div><strong>Source accuracy</strong><small>No major source issue found</small></div><span className="risk-pill">Low</span></div>
              <div className="risk-row"><AlertTriangle size={18} /><div><strong>Old documents</strong><small>1 document review due soon</small></div><span className="risk-pill warn">Watch</span></div>
              <div className="risk-row"><CheckCircle2 size={18} /><div><strong>Safe no-answer rate</strong><small>Working as expected</small></div><span className="risk-pill">Good</span></div>
            </div>
          </section>

          <section className="table-panel">
            <span className="eyebrow">Usage mix</span>
            <h2>Team activity</h2>
            <div className="analytics-donut">
              <div><PieChart size={38} /></div>
              <strong>HR 34%</strong>
              <small>Finance 26% · Legal 22% · Engineering 18%</small>
            </div>
          </section>

          <section className="table-panel">
            <span className="eyebrow">Readiness</span>
            <h2>Executive checks</h2>
            <div className="check-list">
              <span><Gauge size={17} /> Response target tracking active</span>
              <span><BarChart3 size={17} /> Quality scoring enabled</span>
              <span><LineChart size={17} /> Trend monitoring ready</span>
              <span><TrendingUp size={17} /> Adoption growth positive</span>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
