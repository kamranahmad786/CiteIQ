import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Clock3,
  Download,
  FileSearch,
  FileText,
  FileUp,
  Filter,
  FolderKanban,
  History,
  LockKeyhole,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Tags,
} from "lucide-react";
import { archiveDocument, downloadDocument, listDocuments, listDocumentVersions, unarchiveDocument, uploadDocument, uploadDocumentFile } from "../../api/documents";
import type { DocumentRecord } from "../../api/types";

const spaces = ["All spaces", "General", "HR Policies", "Finance", "Legal", "Engineering"];
type IngestionMode = "text" | "pdf";

export function Documents() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["documents"], queryFn: listDocuments });
  const ingestionPanelRef = useRef<HTMLElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [showIngestion, setShowIngestion] = useState(false);
  const [title, setTitle] = useState("");
  const [space, setSpace] = useState("General");
  const [content, setContent] = useState("");
  const [ingestionMode, setIngestionMode] = useState<IngestionMode>("text");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [spaceFilter, setSpaceFilter] = useState("All spaces");
  const [historyDocument, setHistoryDocument] = useState<DocumentRecord | null>(null);
  const { data: versionHistory = [], isFetching: isHistoryLoading } = useQuery({
    queryKey: ["document-versions", historyDocument?.id],
    queryFn: () => listDocumentVersions(historyDocument?.id ?? ""),
    enabled: Boolean(historyDocument),
  });
  const mutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      setTitle("");
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const fileMutation = useMutation({
    mutationFn: uploadDocumentFile,
    onSuccess: () => {
      setTitle("");
      setContent("");
      setPdfFile(null);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const archiveMutation = useMutation({
    mutationFn: archiveDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const unarchiveMutation = useMutation({
    mutationFn: unarchiveDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const downloadMutation = useMutation({ mutationFn: downloadDocument });

  const filteredDocuments = useMemo(() => {
    return data.filter((document) => {
      const matchesQuery = [document.title, document.source_filename, document.space]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesSpace = spaceFilter === "All spaces" || document.space === spaceFilter;
      return matchesQuery && matchesSpace;
    });
  }, [data, query, spaceFilter]);

  const indexedSpaces = new Set(data.map((document) => document.space)).size;
  const pdfError = fileMutation.error instanceof Error
    ? fileMutation.error.message
    : "Could not extract text from this PDF. Please try a text-based PDF.";

  function submit(event: FormEvent) {
    event.preventDefault();
    if (ingestionMode === "pdf") {
      if (!pdfFile) {
        return;
      }
      fileMutation.mutate({ title, file: pdfFile, space });
      return;
    }
    mutation.mutate({ title, source_filename: `${title || "document"}.txt`, content, space });
  }

  function selectPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPdfFile(file);
    if (file && !title.trim()) {
      setTitle(file.name.replace(/\.pdf$/i, ""));
    }
  }

  function openIngestionWorkbench() {
    setShowIngestion(true);
    window.setTimeout(() => {
      ingestionPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      titleInputRef.current?.focus({ preventScroll: true });
    }, 80);
  }

  return (
    <section className="content-grid documents-command">
      <section className="document-hero">
        <div>
          <span className="eyebrow">Document control plane</span>
          <h2>Governed enterprise knowledge base</h2>
          <p>Upload, classify, index, audit, and monitor internal knowledge assets before they are used in grounded answers.</p>
        </div>
        <div className="hero-actions">
          <button className="primary" type="button" onClick={openIngestionWorkbench} aria-expanded={showIngestion} aria-controls="ingestion-workbench">
            <FileUp size={18} />
            {showIngestion ? "Continue ingestion" : "New ingestion"}
          </button>
          <span><ShieldCheck size={16} /> RBAC-aware retrieval enabled</span>
        </div>
      </section>

      <div className="metric-row compact-metrics">
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><FileText size={20} /></div><small>Ready</small></div>
          <span>Total documents</span>
          <strong>{data.length}</strong>
          <small>{indexedSpaces} indexed spaces</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><FolderKanban size={20} /></div><small>Governed</small></div>
          <span>Document spaces</span>
          <strong>4</strong>
          <small>HR, Finance, Legal, Engineering</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><FileSearch size={20} /></div><small>Indexed</small></div>
          <span>Retrievable chunks</span>
          <strong>42</strong>
          <small>Local vector provider</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><LockKeyhole size={20} /></div><small>Scoped</small></div>
          <span>Access policies</span>
          <strong>100%</strong>
          <small>Authorised versions only</small>
        </article>
      </div>

      <section className="document-layout">
        <div className="document-main">
          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Knowledge base</span>
                <h2>Document library</h2>
              </div>
              <span className="count-pill">{filteredDocuments.length} visible</span>
            </div>
            <div className="document-toolbar">
              <label className="global-search document-search">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, file, or space" />
              </label>
              <label className="filter-select">
                <Filter size={17} />
                <select value={spaceFilter} onChange={(event) => setSpaceFilter(event.target.value)}>
                  {spaces.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
            {isLoading ? (
              <p>Loading documents...</p>
            ) : (
              <div className="document-table-wrap">
                <table className="document-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Space</th>
                      <th>Version</th>
                      <th>Security</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((document, index) => (
                      <tr key={document.id}>
                        <td>
                          <span className="doc-title"><FileText size={17} />{document.title}</span>
                          <small>{document.source_filename}</small>
                        </td>
                        <td>{document.space}</td>
                        <td>v{index + 1}.0</td>
                        <td><span className="risk-pill">RBAC</span></td>
                        <td><span className="status">{document.status}</span></td>
                        <td>
                        <div className="row-actions">
                            <button type="button" title="Version history" onClick={() => setHistoryDocument(document)}>
                              <History size={16} />
                            </button>
                            <button type="button" title="Download" onClick={() => downloadMutation.mutate(document)}>
                              <Download size={16} />
                            </button>
                            {document.status === "archived" ? (
                              <button
                                type="button"
                                title="Unarchive"
                                disabled={unarchiveMutation.isPending}
                                onClick={() => unarchiveMutation.mutate(document.id)}
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                title="Archive"
                                disabled={archiveMutation.isPending}
                                onClick={() => archiveMutation.mutate(document.id)}
                              >
                                <Archive size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {historyDocument && (
            <section className="table-panel document-history-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Version history</span>
                  <h2>{historyDocument.title}</h2>
                </div>
                <button className="ghost-action" type="button" onClick={() => setHistoryDocument(null)}>Close</button>
              </div>
              {isHistoryLoading ? (
                <p>Loading version history...</p>
              ) : (
                <div className="version-list">
                  {versionHistory.map((version) => (
                    <span key={version.version_id}>
                      <strong>Version {version.version_id.slice(0, 8)}</strong>
                      <small>{version.source_filename} · {version.status} · {new Date(version.created_at).toLocaleString()}</small>
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="document-insights-grid">
            <div className="table-panel">
              <span className="eyebrow">Processing queue</span>
              <h2>Ingestion pipeline</h2>
              <div className="pipeline-list">
                <div className="pipeline-row">
                  <div><strong>Leave Policy 2026</strong><small>Text extraction and chunking complete</small></div>
                  <span className="risk-pill">Ready</span>
                  <div className="mini-meter"><i style={{ width: "100%" }} /></div>
                </div>
                <div className="pipeline-row">
                  <div><strong>Expense Reimbursement SOP</strong><small>Embedding vectors available</small></div>
                  <span className="risk-pill">Ready</span>
                  <div className="mini-meter"><i style={{ width: "100%" }} /></div>
                </div>
                <div className="pipeline-row">
                  <div><strong>Vendor Contract Template</strong><small>Legal metadata reviewed</small></div>
                  <span className="risk-pill">Ready</span>
                  <div className="mini-meter"><i style={{ width: "96%" }} /></div>
                </div>
              </div>
            </div>

            <div className="table-panel">
              <span className="eyebrow">Governance</span>
              <h2>Policy checks</h2>
              <div className="check-list">
                <span><CheckCircle2 size={17} /> File type allow-list active</span>
                <span><CheckCircle2 size={17} /> Page citations preserved</span>
                <span><CheckCircle2 size={17} /> Version lineage tracked</span>
                <span><Clock3 size={17} /> Retention review pending</span>
              </div>
            </div>
          </section>
        </div>

        <aside ref={ingestionPanelRef} className={showIngestion ? "document-side" : "document-side is-collapsed"}>
          <form id="ingestion-workbench" className="work-panel upload-form" onSubmit={submit}>
            <div>
              <span className="eyebrow">Ingestion workbench</span>
              <h2>Upload text document</h2>
              <p>Index text or PDF sources immediately with extraction, chunking, embeddings, retrieval metadata, and document-space governance.</p>
            </div>
            <div className="mode-switch" role="tablist" aria-label="Ingestion source type">
              <button
                type="button"
                className={ingestionMode === "text" ? "active" : ""}
                onClick={() => setIngestionMode("text")}
              >
                <FileText size={16} />
                Text
              </button>
              <button
                type="button"
                className={ingestionMode === "pdf" ? "active" : ""}
                onClick={() => setIngestionMode("pdf")}
              >
                <FileUp size={16} />
                PDF
              </button>
            </div>
            <label>
              Title
              <input ref={titleInputRef} value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label>
              Space
              <select value={space} onChange={(event) => setSpace(event.target.value)}>
                <option>General</option>
                <option>HR Policies</option>
                <option>Finance</option>
                <option>Legal</option>
                <option>Engineering</option>
              </select>
            </label>
            {ingestionMode === "text" ? (
              <label>
                Content
                <textarea value={content} onChange={(event) => setContent(event.target.value)} required rows={9} />
              </label>
            ) : (
              <label className="file-drop">
                <FileUp size={22} />
                <strong>{pdfFile ? pdfFile.name : "Choose a PDF file"}</strong>
                <small>{pdfFile ? "Text will be extracted and indexed for chat." : "Readable PDF text will be stored as searchable content."}</small>
                <input type="file" accept="application/pdf,.pdf" onChange={selectPdf} required={ingestionMode === "pdf"} />
              </label>
            )}
            <button className="primary" disabled={mutation.isPending || fileMutation.isPending}>
              {mutation.isPending || fileMutation.isPending ? <RefreshCw size={18} /> : <FileUp size={18} />}
              {ingestionMode === "pdf" ? "Extract and index PDF" : "Index document"}
            </button>
            {fileMutation.isError && <p className="form-status error">{pdfError}</p>}
            {fileMutation.isSuccess && <p className="form-status">PDF text extracted and indexed. You can ask questions in Chat now.</p>}
            {mutation.isSuccess && <p className="form-status">Document indexed. You can ask questions in Chat now.</p>}
          </form>

          <section className="table-panel">
            <span className="eyebrow">Classification</span>
            <h2>Metadata standards</h2>
            <div className="settings-list">
              <span><strong><Tags size={17} /> Required tags</strong><small>space, owner, source type, sensitivity</small></span>
              <span><strong><ShieldCheck size={17} /> Access policy</strong><small>organisation, department, document space</small></span>
              <span><strong><Clock3 size={17} /> Retention</strong><small>review every 90 days for policy sources</small></span>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
