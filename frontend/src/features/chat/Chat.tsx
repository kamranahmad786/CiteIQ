import { useQuery } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Clock3,
  Copy,
  FileSearch,
  Filter,
  LockKeyhole,
  MessageSquareText,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { askQuestion } from "../../api/chat";
import { listDocuments } from "../../api/documents";
import type { ChatAnswer, DocumentRecord } from "../../api/types";

type ChatSession = {
  id: string;
  documentId?: string;
  title: string;
  detail: string;
  scope: string;
  mode: string;
  starters: string[];
};

const demoSessions: ChatSession[] = [
  {
    id: "policy",
    title: "Policy Q&A",
    detail: "HR Policies · 3 citations",
    scope: "HR Policies",
    mode: "Employee policy guidance",
    starters: [
      "How many casual leave days do employees receive?",
      "What leave rules apply to probation employees?",
      "Which HR policy mentions manager approval?",
      "Summarise employee leave entitlements.",
    ],
  },
  {
    id: "contracts",
    title: "Contract review",
    detail: "Legal space · vendor terms",
    scope: "Legal",
    mode: "Vendor contract review",
    starters: [
      "Can interns approve vendor contracts?",
      "What does the vendor template say about approval authority?",
      "Which contract clause covers liability?",
      "Summarise the vendor contract approval workflow.",
    ],
  },
  {
    id: "audit",
    title: "Audit evidence",
    detail: "SOC 2 controls · ready",
    scope: "Engineering",
    mode: "Control evidence discovery",
    starters: [
      "Which document mentions SOC 2 controls?",
      "What incident controls are documented?",
      "Summarise audit-ready engineering evidence.",
      "Which runbook sections support control review?",
    ],
  },
  {
    id: "finance",
    title: "Finance SOP",
    detail: "Expense policy · reimbursements",
    scope: "Finance",
    mode: "Expense policy support",
    starters: [
      "Summarise reimbursement rules for domestic travel.",
      "What travel expenses can employees claim?",
      "What is the hotel reimbursement rule?",
      "Which finance SOP covers economy air travel?",
    ],
  },
];

const answerFilters = ["All spaces", "Current session", "High confidence", "Needs review"] as const;
type Feedback = "up" | "down";

export function Chat() {
  const { data: documents = [] } = useQuery({ queryKey: ["documents"], queryFn: listDocuments });
  const sessions = useMemo(() => buildConversationSpaces(documents), [documents]);
  const [activeSessionId, setActiveSessionId] = useState(demoSessions[0].id);
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0] ?? demoSessions[0];
  const [question, setQuestion] = useState(demoSessions[0].starters[0]);
  const [sessionQuery, setSessionQuery] = useState("");
  const [messagesBySession, setMessagesBySession] = useState<Record<string, { question: string; answer: ChatAnswer }[]>>({});
  const [assistantFilter, setAssistantFilter] = useState<(typeof answerFilters)[number]>("Current session");
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [feedbackByMessage, setFeedbackByMessage] = useState<Record<string, Feedback>>({});
  const [loading, setLoading] = useState(false);
  const messages = messagesBySession[activeSessionId] ?? [];
  const latestAnswer = messages.at(-1)?.answer;
  const citationCount = messages.reduce((total, message) => total + message.answer.citations.length, 0);
  const totalQuestions = Object.values(messagesBySession).reduce((total, sessionMessages) => total + sessionMessages.length, 0);
  const visibleSessions = useMemo(() => {
    return sessions.filter((session) =>
      [session.title, session.detail, session.scope, session.mode].join(" ").toLowerCase().includes(sessionQuery.toLowerCase()),
    );
  }, [sessionQuery]);

  useEffect(() => {
    if (!sessions.some((session) => session.id === activeSessionId)) {
      setActiveSessionId(sessions[0]?.id ?? demoSessions[0].id);
      setQuestion(sessions[0]?.starters[0] ?? demoSessions[0].starters[0]);
    }
  }, [activeSessionId, sessions]);

  function selectSession(sessionId: string) {
    const nextSession = sessions.find((session) => session.id === sessionId) ?? sessions[0] ?? demoSessions[0];
    setActiveSessionId(sessionId);
    setQuestion(nextSession.starters[0]);
  }

  async function copyAnswer(key: string, answer: string) {
    await navigator.clipboard.writeText(answer);
    setCopiedMessage(key);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    const asked = question.trim();
    setLoading(true);
  try {
      const answer = await askQuestion(asked, activeSession.documentId);
      setMessagesBySession((current) => ({
        ...current,
        [activeSessionId]: [...(current[activeSessionId] ?? []), { question: asked, answer }],
      }));
      setQuestion("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="content-grid chat-command">
      <section className="chat-hero">
        <div>
          <span className="eyebrow">Grounded AI workspace</span>
          <h2>Enterprise answer console</h2>
          <p>Ask governed questions across authorised document spaces, inspect citations, and keep every answer audit-ready.</p>
        </div>
          <div className="chat-hero-stats">
            <span><ShieldCheck size={16} /> Evidence-only mode</span>
            <strong>{citationCount}</strong>
          <small>citations returned in {activeSession.title}</small>
        </div>
      </section>

      <div className="chat-metric-row">
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><MessageSquareText size={20} /></div><small>Live</small></div>
          <span>Questions asked</span>
          <strong>{totalQuestions}</strong>
          <small>Across conversation spaces</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><FileSearch size={20} /></div><small>Cited</small></div>
          <span>Evidence snippets</span>
          <strong>{citationCount}</strong>
          <small>Source chunks attached</small>
        </article>
        <article className="metric-card command-metric">
          <div className="metric-card-top"><div className="metric-icon"><Clock3 size={20} /></div><small>Target</small></div>
          <span>Answer latency</span>
          <strong>840ms</strong>
          <small>P95 demo target</small>
        </article>
      </div>

      <section className="chat-inspector chat-inspector-strip">
        <section className="table-panel chat-mode-card">
          <div className="inspector-card-head">
            <span className="eyebrow">Assistant command</span>
            <span className="live-pill"><span /> Live</span>
          </div>
          <h2>{activeSession.title}</h2>
          <p>{activeSession.mode}</p>
          <div className="chat-controls side-chat-controls">
            <label className="chat-filter-select">
              <Filter size={15} />
              <select value={assistantFilter} onChange={(event) => setAssistantFilter(event.target.value as (typeof answerFilters)[number])}>
                {answerFilters.map((filter) => <option key={filter}>{filter}</option>)}
              </select>
            </label>
            <span><CheckCircle2 size={15} /> Citations required</span>
          </div>
          <div className="assistant-scope-card">
            <small>Active filter</small>
            <strong>{assistantFilter}</strong>
            <span>Scope: {activeSession.scope}</span>
          </div>
        </section>

        <section className="table-panel inspector-quality-card">
          <div className="inspector-card-head">
            <span className="eyebrow">Answer quality</span>
            <span className="score-pill">98%</span>
          </div>
          <h2>Retrieval checks</h2>
          <div className="check-list compact-check-list">
            <span><CheckCircle2 size={17} /> Citation policy enforced</span>
            <span><CheckCircle2 size={17} /> Authorised spaces only</span>
            <span><CheckCircle2 size={17} /> Abstention fallback active</span>
            <span><Clock3 size={17} /> Human review queue ready</span>
          </div>
        </section>

        <section className="table-panel inspector-evidence-card">
          <div className="inspector-card-head">
            <span className="eyebrow">Latest evidence</span>
            <span className="count-pill">{latestAnswer?.citations.length ?? 0} sources</span>
          </div>
          <h2>Source snapshot</h2>
          {latestAnswer && latestAnswer.citations.length > 0 ? (
            <div className="settings-list compact-evidence-list">
              {latestAnswer.citations.slice(0, 3).map((citation) => (
                <span key={citation.chunk_id}>
                  <strong>{citation.document_title}</strong>
                  <small>Page {citation.page_start} · score {citation.score}</small>
                </span>
              ))}
            </div>
          ) : (
            <p className="empty">No answer evidence yet.</p>
          )}
        </section>
      </section>

      <section className="chat-layout advanced-chat-layout">
        <aside className="session-panel advanced-session-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Sessions</span>
              <h2>Conversation spaces</h2>
            </div>
          </div>
          <label className="global-search session-search">
            <Search size={16} />
            <input value={sessionQuery} onChange={(event) => setSessionQuery(event.target.value)} placeholder="Search sessions" />
          </label>
          <div className="session-list">
            {visibleSessions.map((session) => (
              <button
                className={session.id === activeSessionId ? "active" : ""}
                key={session.title}
                type="button"
                onClick={() => selectSession(session.id)}
              >
                <span>{session.title}</span>
                <small>{session.detail}</small>
              </button>
            ))}
          </div>
          <div className="chat-guardrail-card session-summary-card">
            <MessageSquareText size={18} />
            <strong>{activeSession.title}</strong>
            <small>{activeSession.mode}</small>
            <span className="risk-pill">{activeSession.scope}</span>
          </div>
          <div className="chat-guardrail-card">
            <LockKeyhole size={18} />
            <strong>Role-aware retrieval</strong>
            <small>Only authorised document spaces are searched for each answer.</small>
          </div>
        </aside>

        <section className="chat-panel advanced-chat-panel">
          <div className="starter-row advanced-starters">
            {activeSession.starters.map((starter) => (
              <button key={starter} type="button" onClick={() => setQuestion(starter)}>
                <Sparkles size={15} />
                {starter}
              </button>
            ))}
          </div>

          <div className="messages advanced-messages">
            {messages.length === 0 && (
              <div className="empty-state chat-empty-state">
                <FileSearch size={34} />
                <h2>{activeSession.title}</h2>
                <p>{activeSession.mode} in the {activeSession.scope} document space. Responses cite exact source chunks and abstain when evidence is missing.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <article className="message advanced-message" key={`${message.question}-${index}`}>
                <div className="bubble user">{message.question}</div>
                <div className="bubble assistant">
                  <div className="assistant-label"><Bot size={17} /> Grounded assistant</div>
                  <p>{message.answer.answer}</p>
                  <div className="answer-meta">
                    <span><ShieldCheck size={15} /> grounded</span>
                    <span>{message.answer.citations.length} citations</span>
                    <span>top-k 5</span>
                  </div>
                  {message.answer.citations.length > 0 && (
                    <div className="citations citation-grid">
                      {message.answer.citations.map((citation) => (
                        <details key={citation.chunk_id}>
                          <summary>{citation.document_title}, p.{citation.page_start} · score {citation.score}</summary>
                          <p>{citation.content}</p>
                        </details>
                      ))}
                    </div>
                  )}
                  <div className="feedback">
                    <button
                      type="button"
                      title="Copy answer"
                      onClick={() => copyAnswer(`${activeSessionId}-${index}`, message.answer.answer)}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className={feedbackByMessage[`${activeSessionId}-${index}`] === "up" ? "active" : ""}
                      type="button"
                      title="Helpful"
                      onClick={() => setFeedbackByMessage((current) => ({ ...current, [`${activeSessionId}-${index}`]: "up" }))}
                    >
                      <ThumbsUp size={16} />
                    </button>
                    <button
                      className={feedbackByMessage[`${activeSessionId}-${index}`] === "down" ? "active" : ""}
                      type="button"
                      title="Not helpful"
                      onClick={() => setFeedbackByMessage((current) => ({ ...current, [`${activeSessionId}-${index}`]: "down" }))}
                    >
                      <ThumbsDown size={16} />
                    </button>
                  </div>
                  {copiedMessage === `${activeSessionId}-${index}` && <small className="action-note">Answer copied</small>}
                </div>
              </article>
            ))}
          </div>

          <form className="composer advanced-composer" onSubmit={submit}>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about policies, contracts, SOPs, controls, or operational procedures"
              rows={2}
            />
            <button className="primary" disabled={loading}>
              <Send size={18} />
              {loading ? "Searching" : "Send"}
            </button>
          </form>
        </section>
      </section>
    </section>
  );
}

function buildConversationSpaces(documents: DocumentRecord[]): ChatSession[] {
  const readyDocuments = documents.filter((document) => document.status !== "archived");
  const documentSessions = readyDocuments.map((document) => ({
    id: `document-${document.id}`,
    documentId: document.id,
    title: document.title,
    detail: `${document.space} · ${document.source_filename}`,
    scope: document.space,
    mode: "Uploaded document Q&A",
    starters: [
      `Summarise ${document.title}.`,
      `What are the key points in ${document.title}?`,
      `Which source mentions the main details in ${document.title}?`,
      `Create an action summary from ${document.title}.`,
    ],
  }));

  const existingTitles = new Set(documentSessions.map((session) => session.title.toLowerCase()));
  const filteredDemoSessions = demoSessions.filter((session) => !existingTitles.has(session.title.toLowerCase()));
  return [...documentSessions, ...filteredDemoSessions];
}
