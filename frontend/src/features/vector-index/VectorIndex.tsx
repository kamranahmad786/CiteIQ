import { FormEvent, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Database,
  Eraser,
  Filter,
  Gauge,
  Layers3,
  PlayCircle,
  RefreshCw,
  RotateCw,
  Search,
  ServerCog,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

const spaces = ["All spaces", "HR Policies", "Finance", "Legal", "Engineering"];

const initialPartitions = [
  { space: "HR Policies", documents: 1, chunks: 14, recall: 96, status: "ready" },
  { space: "Finance", documents: 1, chunks: 11, recall: 93, status: "ready" },
  { space: "Legal", documents: 1, chunks: 9, recall: 89, status: "watch" },
  { space: "Engineering", documents: 1, chunks: 8, recall: 91, status: "ready" },
];

export function VectorIndex({ canManageSearch = true }: { canManageSearch?: boolean }) {
  const [selectedSpace, setSelectedSpace] = useState("All spaces");
  const [query, setQuery] = useState("vendor contract approval");
  const [status, setStatus] = useState("Last refresh completed successfully");
  const [lastAction, setLastAction] = useState("Ready");
  const [partitions, setPartitions] = useState(initialPartitions);
  const [testResults, setTestResults] = useState<string[]>([]);
  const visiblePartitions = useMemo(() => {
    return selectedSpace === "All spaces" ? partitions : partitions.filter((partition) => partition.space === selectedSpace);
  }, [partitions, selectedSpace]);
  const totalChunks = partitions.reduce((total, partition) => total + partition.chunks, 0);
  const averageRecall = Math.round(partitions.reduce((total, partition) => total + partition.recall, 0) / partitions.length);

  function rebuildCorpus() {
    setStatus("Search data refreshed just now");
    setLastAction("Search refreshed");
    setPartitions((current) => current.map((partition) => ({ ...partition, recall: Math.min(99, partition.recall + 2), status: "ready" })));
  }

  function syncMetadata() {
    setStatus("Document details synced with library");
    setLastAction("Details synced");
  }

  function flushCache() {
    setStatus("Saved search results cleared");
    setLastAction("Search cache cleared");
    setTestResults([]);
  }

  function runRetrievalTest(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setLastAction("Search test");
    setStatus(`Test search completed for ${selectedSpace}`);
    setTestResults([
      `${selectedSpace === "All spaces" ? "Legal" : selectedSpace}: found a strong match for "${query.trim()}"`,
      "Best document section includes source details",
      "Keyword match confirmed important terms",
    ]);
  }

  return (
    <section className="content-grid vector-command">
      <section className="vector-hero">
        <div>
          <span className="eyebrow">Search operations</span>
          <h2>Search health center</h2>
          <p>Check document search health, refresh searchable data, test search accuracy, and manage document groups.</p>
        </div>
        <div className="vector-hero-actions">
          {canManageSearch && <button className="primary" type="button" onClick={rebuildCorpus}><RefreshCw size={18} /> Refresh search</button>}
          {canManageSearch && <button className="ghost-action" type="button" onClick={syncMetadata}><RotateCw size={17} /> Sync details</button>}
        </div>
      </section>

      <div className="metric-row compact-metrics">
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Layers3 size={20} /></div><small>Ready</small></div>
          <span>Searchable sections</span>
          <strong>{totalChunks}</strong>
          <small>Across {partitions.length} document groups</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Database size={20} /></div><small>Setup</small></div>
          <span>Search model</span>
          <strong>Ready</strong>
          <small>prepared for AI search</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Gauge size={20} /></div><small>Accuracy</small></div>
          <span>Search accuracy</span>
          <strong>{averageRecall}%</strong>
          <small>test checks</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Zap size={20} /></div><small>Mode</small></div>
          <span>Search mode</span>
          <strong>Fast</strong>
          <small>best-match search</small>
        </article>
      </div>

      <section className="vector-layout">
        <div className="vector-main">
          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Document groups</span>
                <h2>Search group health</h2>
              </div>
              <span className="count-pill">{visiblePartitions.length} visible</span>
            </div>
            <label className="filter-select vector-filter">
              <Filter size={17} />
              <select value={selectedSpace} onChange={(event) => setSelectedSpace(event.target.value)}>
                {spaces.map((space) => <option key={space}>{space}</option>)}
              </select>
            </label>
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Documents</th>
                  <th>Sections</th>
                  <th>Accuracy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visiblePartitions.map((partition) => (
                  <tr key={partition.space}>
                    <td><span className="doc-title"><Database size={17} />{partition.space}</span></td>
                    <td>{partition.documents}</td>
                    <td>{partition.chunks}</td>
                    <td><span className="risk-pill">{partition.recall}%</span></td>
                    <td><span className={partition.status === "watch" ? "risk-pill warn" : "status"}>{partition.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="table-panel">
            <span className="eyebrow">Search test</span>
            <h2>Try a test question</h2>
            <form className="vector-test-form" onSubmit={runRetrievalTest}>
              <label className="global-search document-search">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Run a search test question" />
              </label>
              <button className="primary" type="submit"><PlayCircle size={18} /> Run test</button>
            </form>
            <div className="settings-list">
              {testResults.length > 0 ? testResults.map((result) => <span key={result}><strong>{result}</strong></span>) : <span><strong>No search test run yet</strong><small>Submit a question to check source matching, document details, and ranking.</small></span>}
            </div>
          </section>
        </div>

        <aside className="vector-side">
          <section className="table-panel">
            <span className="eyebrow">Operations</span>
            <h2>Search controls</h2>
            <div className="admin-actions-list">
              <button type="button" onClick={rebuildCorpus} disabled={!canManageSearch}><RefreshCw size={17} /> Refresh search</button>
              <button type="button" onClick={syncMetadata} disabled={!canManageSearch}><RotateCw size={17} /> Sync document details</button>
              <button type="button" onClick={flushCache} disabled={!canManageSearch}><Eraser size={17} /> Clear saved results</button>
            </div>
            <p className="action-note">{status}</p>
          </section>

          <section className="table-panel">
            <span className="eyebrow">Setup</span>
            <h2>Search configuration</h2>
            <div className="settings-list">
              <span><strong><SlidersHorizontal size={17} /> Match method</strong><small>Best meaning match</small></span>
              <span><strong><ServerCog size={17} /> Search type</strong><small>Fast document search</small></span>
              <span><strong><Activity size={17} /> Keyword support</strong><small>Meaning match plus keyword match</small></span>
              <span><strong><ShieldCheck size={17} /> Access filter</strong><small>Allowed documents only</small></span>
            </div>
          </section>

          <section className="table-panel">
            <span className="eyebrow">Checklist</span>
            <h2>Readiness checks</h2>
            <div className="check-list">
              <span><CheckCircle2 size={17} /> Local demo search active</span>
              <span><CheckCircle2 size={17} /> Version checks attached</span>
              <span><CheckCircle2 size={17} /> Document detail sync available</span>
              <span><Clock3 size={17} /> Last action: {lastAction}</span>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
