# CiteIQ

CiteIQ is a production-oriented enterprise RAG document intelligence platform based on the supplied specification. The repo is structured as a React + TypeScript + Vite frontend and a FastAPI backend with PostgreSQL + pgvector DDL, document ingestion, retrieval, grounded answers with citations, auth/RBAC scaffolding, audit hooks, Docker, CI, and sample data.

## What is included

- React/Vite frontend with dashboard, document upload/listing, chat, citations, analytics, and admin screens.
- FastAPI backend module layout for auth, documents, ingestion, retrieval, chat, audit, and health.
- Local deterministic RAG engine for demos and tests without external AI keys.
- PostgreSQL + pgvector migration with HNSW cosine indexes and normalized citation tables.
- Seed data for HR, reimbursement, contracts, and engineering SOP use cases.
- Docker Compose baseline for API, worker, frontend, Postgres/pgvector, and Redis.
- GitHub Actions CI for backend tests and frontend build/test.

## Quick start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API starts at `http://localhost:8000`. OpenAPI is available at `http://localhost:8000/docs`.

Demo login:

- Email: `admin@citeiq.test`
- Password: `password`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_BASE_URL=http://localhost:8000` if your frontend environment does not default to it.

### Full stack with Docker

```bash
docker compose up --build
```

Frontend: `http://localhost:5173`  
API: `http://localhost:8000`

## Core RAG behavior

The default local mode is intentionally deterministic:

1. Upload or seed text-based documents.
2. The ingestion service chunks text by headings and paragraphs.
3. The local embedding provider hashes terms into normalized vectors.
4. Retrieval ranks chunks with cosine similarity and keyword overlap.
5. The answer service only answers from retrieved evidence and returns citations.
6. If evidence is weak, the assistant abstains.

Swap in OpenAI, Gemini, Ollama, or Sentence Transformers by implementing the `EmbeddingProvider` and `GenerationProvider` protocols in `backend/app/domain/retrieval/providers.py`.

## Production notes

- Use PostgreSQL 15+ with `pgvector` enabled.
- Store raw originals in S3, GCS, Azure Blob, MinIO, or another object store.
- Run ingestion in workers for PDF/DOCX/TXT extraction and embedding.
- Keep JWT access tokens short-lived and refresh tokens rotated in the database.
- Enforce permissions before retrieval by filtering allowed document versions/spaces.
- Keep citations normalized in `answer_citations`.
- Add optional PostgreSQL RLS for regulated tenants.

## Useful commands

```bash
python -m pytest backend/tests
npm --prefix frontend run build
docker compose up --build
```
