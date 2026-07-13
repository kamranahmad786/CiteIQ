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

export function VectorIndex() {
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
    setStatus("Rebuild completed just now");
    setLastAction("Corpus rebuilt");
    setPartitions((current) => current.map((partition) => ({ ...partition, recall: Math.min(99, partition.recall + 2), status: "ready" })));
  }

  function syncMetadata() {
    setStatus("Metadata synced with document library");
    setLastAction("Metadata sync");
  }

  function flushCache() {
    setStatus("Query cache flushed");
    setLastAction("Cache cleared");
    setTestResults([]);
  }

  function runRetrievalTest(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setLastAction("Retrieval test");
    setStatus(`Test query completed for ${selectedSpace}`);
    setTestResults([
      `${selectedSpace === "All spaces" ? "Legal" : selectedSpace}: matched "${query.trim()}" with cosine score 0.91`,
      "Top chunk has authorised version metadata and citation payload",
      "Hybrid reranker confirmed keyword overlap",
    ]);
  }

  return (
    <section className="content-grid vector-command">
      <section className="vector-hero">
        <div>
          <span className="eyebrow">Vector operations</span>
          <h2>Retrieval index control plane</h2>
          <p>Monitor pgvector health, rebuild embeddings, validate recall, and manage authorised retrieval partitions across document spaces.</p>
        </div>
        <div className="vector-hero-actions">
          <button className="primary" type="button" onClick={rebuildCorpus}><RefreshCw size={18} /> Rebuild corpus</button>
          <button className="ghost-action" type="button" onClick={syncMetadata}><RotateCw size={17} /> Sync metadata</button>
        </div>
      </section>

      <div className="metric-row compact-metrics">
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Layers3 size={20} /></div><small>Indexed</small></div>
          <span>Indexed chunks</span>
          <strong>{totalChunks}</strong>
          <small>Across {partitions.length} spaces</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Database size={20} /></div><small>Schema</small></div>
          <span>Embedding dims</span>
          <strong>1536</strong>
          <small>Provider-ready schema</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Gauge size={20} /></div><small>Recall</small></div>
          <span>Average recall</span>
          <strong>{averageRecall}%</strong>
          <small>hybrid retrieval checks</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Zap size={20} /></div><small>Mode</small></div>
          <span>Index type</span>
          <strong>HNSW</strong>
          <small>cosine distance</small>
        </article>
      </div>

      <section className="vector-layout">
        <div className="vector-main">
          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Partitions</span>
                <h2>Index space health</h2>
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
                  <th>Space</th>
                  <th>Documents</th>
                  <th>Chunks</th>
                  <th>Recall</th>
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
            <span className="eyebrow">Retrieval lab</span>
            <h2>Test query path</h2>
            <form className="vector-test-form" onSubmit={runRetrievalTest}>
              <label className="global-search document-search">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Run a retrieval test query" />
              </label>
              <button className="primary" type="submit"><PlayCircle size={18} /> Run test</button>
            </form>
            <div className="settings-list">
              {testResults.length > 0 ? testResults.map((result) => <span key={result}><strong>{result}</strong></span>) : <span><strong>No retrieval test run yet</strong><small>Submit a query to validate embeddings, metadata filters, and reranking.</small></span>}
            </div>
          </section>
        </div>

        <aside className="vector-side">
          <section className="table-panel">
            <span className="eyebrow">Operations</span>
            <h2>Index controls</h2>
            <div className="admin-actions-list">
              <button type="button" onClick={rebuildCorpus}><RefreshCw size={17} /> Rebuild corpus</button>
              <button type="button" onClick={syncMetadata}><RotateCw size={17} /> Sync metadata</button>
              <button type="button" onClick={flushCache}><Eraser size={17} /> Flush query cache</button>
            </div>
            <p className="action-note">{status}</p>
          </section>

          <section className="table-panel">
            <span className="eyebrow">pgvector</span>
            <h2>Configuration</h2>
            <div className="settings-list">
              <span><strong><SlidersHorizontal size={17} /> Distance metric</strong><small>Cosine similarity</small></span>
              <span><strong><ServerCog size={17} /> Index type</strong><small>HNSW vector_cosine_ops</small></span>
              <span><strong><Activity size={17} /> Hybrid retrieval</strong><small>Vector ranking with keyword overlap</small></span>
              <span><strong><ShieldCheck size={17} /> Filtering</strong><small>Authorised document versions only</small></span>
            </div>
          </section>

          <section className="table-panel">
            <span className="eyebrow">Runbook</span>
            <h2>Readiness checks</h2>
            <div className="check-list">
              <span><CheckCircle2 size={17} /> Local deterministic provider active</span>
              <span><CheckCircle2 size={17} /> Version filters attached</span>
              <span><CheckCircle2 size={17} /> Metadata sync available</span>
              <span><Clock3 size={17} /> Last action: {lastAction}</span>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
