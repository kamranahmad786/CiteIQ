CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

CREATE TABLE organisations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'active',
    settings_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name text NOT NULL,
    code text NOT NULL,
    UNIQUE (organisation_id, code)
);

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    email text NOT NULL,
    password_hash text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    last_login_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organisation_id, email)
);

CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    description text NOT NULL
);

CREATE TABLE user_roles (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope_type text NOT NULL DEFAULT 'organisation',
    scope_id uuid,
    PRIMARY KEY (user_id, role_id, scope_type, scope_id)
);

CREATE TABLE document_spaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
    name text NOT NULL,
    visibility text NOT NULL DEFAULT 'org',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    space_id uuid NOT NULL REFERENCES document_spaces(id) ON DELETE CASCADE,
    uploaded_by uuid NOT NULL REFERENCES users(id),
    title text NOT NULL,
    source_filename text NOT NULL,
    mime_type text NOT NULL,
    storage_key text NOT NULL,
    checksum_sha256 text NOT NULL,
    access_policy_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
    current_version_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    archived_at timestamptz,
    UNIQUE (organisation_id, checksum_sha256)
);

CREATE TABLE document_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_no integer NOT NULL,
    processing_status text NOT NULL,
    parsing_strategy text NOT NULL,
    page_count integer,
    token_count integer,
    language text,
    summary text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (document_id, version_no)
);

ALTER TABLE documents
    ADD CONSTRAINT fk_documents_current_version
    FOREIGN KEY (current_version_id) REFERENCES document_versions(id);

CREATE TABLE document_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_version_id uuid NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    chunk_no integer NOT NULL,
    page_start integer,
    page_end integer,
    char_start integer,
    char_end integer,
    token_count integer NOT NULL,
    content text NOT NULL,
    content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(content, ''))) STORED,
    embedding vector(1536) NOT NULL,
    metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (document_version_id, chunk_no)
);

CREATE TABLE chat_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    archived_at timestamptz
);

CREATE TABLE chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    question_text text,
    answer_text text,
    model_name text,
    prompt_version text,
    latency_ms integer,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE answer_citations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    chunk_id uuid NOT NULL REFERENCES document_chunks(id) ON DELETE RESTRICT,
    rank_no integer NOT NULL,
    relevance_score numeric(6, 4),
    quoted_span_start integer,
    quoted_span_end integer
);

CREATE TABLE feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating smallint NOT NULL CHECK (rating IN (-1, 1)),
    reason_code text,
    comments text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    replaced_by_token_id uuid REFERENCES refresh_tokens(id)
);

CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    before_jsonb jsonb,
    after_jsonb jsonb,
    ip_addr inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_spaces_org ON document_spaces (organisation_id);
CREATE INDEX idx_document_spaces_department ON document_spaces (department_id);
CREATE INDEX idx_documents_space ON documents (space_id);
CREATE INDEX idx_documents_uploaded_by ON documents (uploaded_by);
CREATE INDEX idx_documents_created_at ON documents (created_at);
CREATE INDEX idx_document_versions_status ON document_versions (processing_status);
CREATE INDEX idx_document_chunks_version_page ON document_chunks (document_version_id, page_start);
CREATE INDEX idx_document_chunks_tsv ON document_chunks USING gin (content_tsv);
CREATE INDEX idx_document_chunks_embedding_hnsw ON document_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_chat_sessions_user_created ON chat_sessions (user_id, created_at);
CREATE INDEX idx_chat_messages_session_created ON chat_messages (session_id, created_at);
CREATE INDEX idx_answer_citations_message ON answer_citations (message_id);
CREATE INDEX idx_answer_citations_chunk ON answer_citations (chunk_id);
CREATE INDEX idx_feedback_message ON feedback (message_id);
CREATE INDEX idx_feedback_user ON feedback (user_id);
CREATE INDEX idx_refresh_tokens_user_expiry ON refresh_tokens (user_id, expires_at);
CREATE INDEX idx_audit_logs_org_created ON audit_logs (organisation_id, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

