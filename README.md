# CiteIQ - Enterprise RAG Document Intelligence Platform

<p align="center">
  <strong>Secure document intelligence, PDF ingestion, grounded Q&A, citations, analytics, and admin workflows for enterprise teams.</strong>
</p>

<p align="center">
  <a href="https://cite-iq.vercel.app/">Live Frontend</a> |
  <a href="https://citeiq.onrender.com/api">Backend API</a> |
  <a href="https://citeiq.onrender.com/docs">API Docs</a> |
  <a href="https://citeiq.onrender.com/health">Health Check</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL%20%2B%20pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL pgvector" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Deployed-Vercel%20%2B%20Render-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Render" />
</p>

## Overview

CiteIQ is a production-style RAG document intelligence platform. It allows users to upload internal documents, extract text from text-based PDFs, index content, ask natural-language questions, and receive grounded answers with source citations.

The project is built as a modern full-stack application with a React + TypeScript frontend and a FastAPI backend. It includes authentication, document management, document-scoped chat, dashboard metrics, analytics, admin controls, vector index monitoring, support workflows, day/night mode, and deployment-ready configuration.

## Demo Access

Use the hosted application here:

- Frontend: [https://cite-iq.vercel.app](https://cite-iq.vercel.app)
- Backend API: [https://citeiq.onrender.com/api](https://citeiq.onrender.com/api)
- Swagger Docs: [https://citeiq.onrender.com/docs](https://citeiq.onrender.com/docs)

Demo login:

```text
Email: admin@citeiq.test
Password: password
```

## Table Of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [Deployment Guide](#deployment-guide)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Production Notes](#production-notes)
- [Roadmap](#roadmap)

## Key Features

### Authentication And Workspace Access

- Login and signup flow with a product-style authentication screen.
- Signup redirects users back to login before portal access.
- Demo workspace account for quick testing.
- Role-aware UI foundation for admin, user, and workspace-level controls.

### Enterprise Dashboard

- Executive dashboard with workspace health, document coverage, retrieval metrics, citation coverage, latency, readiness signals, and recommended actions.
- Light and dark mode support across the portal.
- Product-style search, notifications, profile menus, and sidebar profile controls.

### Document Intelligence

- Upload text documents directly from the UI.
- Upload text-based PDF files and extract readable content with `pypdf`.
- Store uploaded documents in the document library.
- Search and filter documents by title, file, status, and workspace.
- View version history, download document content, archive documents, and unarchive archived documents.
- Ingestion workbench with metadata, classification, readiness, and governance panels.

### RAG Chat

- Document-scoped conversation spaces.
- Ask questions against selected documents or workspace spaces.
- Resume/PDF summarization support for uploaded documents.
- Grounded answer behavior with citations and abstention when evidence is weak.
- Copy, thumbs up, and thumbs down actions for assistant responses.
- Session selection and contextual assistant filters.

### Analytics

- Retrieval quality indicators.
- Usage and answer-quality panels.
- Risk, governance, and evidence coverage views.
- Operational metrics designed like an enterprise product analytics surface.

### Admin

- Workspace/user administration UI.
- Invite user workflow.
- Role sync workflow.
- Access governance and operational readiness panels.

### Vector Index

- Advanced vector index monitoring page.
- Index health, collection coverage, search behavior, refresh controls, and operational signals.
- Designed to represent pgvector/HNSW-style retrieval infrastructure.

### Support

- Product-style support center.
- Open ticket workflow.
- Escalate P1 workflow.
- SLA, queue, issue, and incident-oriented support panels.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, TanStack Query, Axios, Lucide React, CSS |
| Backend | Python, FastAPI, Pydantic, Uvicorn, python-multipart, python-jose, Passlib |
| Document Processing | pypdf, PDF text extraction, text ingestion, document chunking |
| RAG And Retrieval | Deterministic local retrieval, document chunks, citation-aware answers, document-scoped Q&A |
| Database/Infra Scaffold | PostgreSQL, pgvector, Redis, SQLAlchemy, Alembic, Docker Compose |
| Testing | pytest, httpx, Vitest, TypeScript build checks |
| Deployment | Vercel frontend, Render backend |
| Developer Tools | Git, GitHub, Postman, VS Code, npm |

## Architecture

```mermaid
flowchart LR
    User["User"] --> Frontend["React + TypeScript Frontend<br/>Vercel"]
    Frontend --> API["FastAPI Backend<br/>Render"]
    API --> Auth["Auth + Workspace Access"]
    API --> Documents["Document API"]
    API --> Chat["Chat API"]
    API --> Admin["Admin + Analytics APIs"]
    Documents --> PDF["PDF Text Extraction<br/>pypdf"]
    Documents --> Chunking["Document Chunking"]
    Chunking --> Retrieval["Local Retrieval Engine"]
    Chat --> Retrieval
    Retrieval --> Citations["Grounded Answers<br/>Source Citations"]
    API -. production scaffold .-> DB["PostgreSQL + pgvector"]
    API -. production scaffold .-> Redis["Redis Worker Queue"]
```

## Project Structure

```text
.
├── backend
│   ├── app
│   │   ├── api
│   │   │   └── routers
│   │   │       ├── admin.py
│   │   │       ├── auth.py
│   │   │       ├── chat.py
│   │   │       ├── documents.py
│   │   │       ├── health.py
│   │   │       └── retrieval.py
│   │   ├── core
│   │   ├── domain
│   │   │   ├── documents
│   │   │   ├── ingestion
│   │   │   └── retrieval
│   │   ├── schemas
│   │   ├── workers
│   │   └── main.py
│   ├── tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── features
│   │   │   ├── admin
│   │   │   ├── analytics
│   │   │   ├── auth
│   │   │   ├── chat
│   │   │   ├── dashboard
│   │   │   ├── documents
│   │   │   ├── settings
│   │   │   ├── support
│   │   │   └── vector-index
│   │   ├── styles
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
├── database
│   └── migrations
├── docker-compose.yml
└── README.md
```

## Local Setup

### Prerequisites

Install the following before running locally:

- Node.js 18 or higher
- npm
- Python 3.12 or higher
- Git
- Docker Desktop, only if you want to run the Docker setup

### 1. Clone The Repository

```bash
git clone https://github.com/kamranahmad786/CiteIQ.git
cd CiteIQ
```

If your local folder has a different name, open that project folder instead.

### 2. Start The Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URLs:

- API root: [http://localhost:8000/api](http://localhost:8000/api)
- Health: [http://localhost:8000/health](http://localhost:8000/health)
- Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Start The Frontend

Open a second terminal:

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

Frontend URL:

- [http://localhost:5173](http://localhost:5173)

## Environment Variables

### Frontend

Create `frontend/.env` for local development:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

For Vercel production:

```env
VITE_API_BASE_URL=https://citeiq.onrender.com/api
```

### Backend

The backend includes configuration support through `backend/app/core/config.py`. For production, keep these values secure in Render environment variables instead of committing secrets.

Recommended production values:

```env
APP_NAME=CiteIQ
API_PREFIX=/api
CORS_ORIGINS=["https://cite-iq.vercel.app"]
JWT_SECRET=replace-with-a-secure-secret
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE
```

`DATABASE_URL` is required for production login/signup persistence. Without it, local development uses an in-memory SQLite database for easy testing.

## Docker Setup

Docker is optional. It is useful when you want to run the API, frontend, Postgres/pgvector, Redis, and worker together.

```bash
docker compose up --build
```

Docker services:

| Service | Purpose | Local URL |
| --- | --- | --- |
| frontend | React production build served through container | `http://localhost:5173` |
| api | FastAPI backend | `http://localhost:8000` |
| worker | Background ingestion worker scaffold | Internal |
| db | PostgreSQL with pgvector | `localhost:5432` |
| redis | Queue/cache scaffold | `localhost:6379` |

If Docker is not installed, you can still run the project with the local backend and frontend commands above.

## Deployment Guide

### Backend On Render

Create a new Render Web Service with these settings:

| Render Field | Value |
| --- | --- |
| Language | Python |
| Branch | `main` |
| Region | Choose the nearest region to your users |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Add environment variables:

```env
APP_NAME=CiteIQ
API_PREFIX=/api
CORS_ORIGINS=["https://cite-iq.vercel.app"]
JWT_SECRET=replace-with-a-secure-secret
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE
```

After deploy, verify:

- `https://citeiq.onrender.com/health`
- `https://citeiq.onrender.com/api`
- `https://citeiq.onrender.com/docs`

### Frontend On Vercel

Create a new Vercel project with these settings:

| Vercel Field | Value |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Add environment variable:

```env
VITE_API_BASE_URL=https://citeiq.onrender.com/api
```

After deploy, open:

- `https://cite-iq.vercel.app`

## API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Backend health check |
| GET | `/api` | API status route |
| POST | `/api/auth/login` | Login with demo or registered user credentials |
| POST | `/api/auth/signup` | Create a user account |
| GET | `/api/documents` | List indexed documents |
| POST | `/api/documents` | Upload/index text document content |
| POST | `/api/documents/upload-file` | Upload a text-based PDF and extract content |
| GET | `/api/documents/{document_id}/versions` | View document version history |
| GET | `/api/documents/{document_id}/download` | Download indexed document text |
| PATCH | `/api/documents/{document_id}/archive` | Archive a document |
| PATCH | `/api/documents/{document_id}/unarchive` | Restore an archived document |
| POST | `/api/chat/sessions/default/messages` | Ask a grounded document question |
| POST | `/api/retrieval/search` | Search indexed document chunks |
| GET | `/api/admin/audit-logs` | View audit logs |
| GET | `/api/admin/analytics/usage` | View admin and analytics usage metrics |

## Testing

Run backend tests:

```bash
backend/.venv/bin/python -m pytest backend/tests -q
```

Build frontend:

```bash
npm --prefix frontend run build
```

Expected result:

```text
Backend tests pass
Frontend production build completes successfully
```

## How The RAG Flow Works

1. A user uploads a text document or text-based PDF.
2. The backend extracts readable text from the document.
3. The ingestion logic splits the content into searchable chunks.
4. The retrieval service searches relevant chunks for the user's question.
5. The assistant creates an answer only from matching evidence.
6. The response includes citations or abstains when the information is not found.

## Important Production Notes

- The current demo repository uses an in-memory document store for simple deployment and testing.
- Uploaded documents can reset when the Render service restarts.
- For production, connect PostgreSQL/pgvector as the persistent document and vector store.
- Store original PDFs in S3, GCS, Azure Blob, MinIO, or another object storage service.
- Add OCR support for scanned/image-only PDFs.
- Keep JWT secrets and production credentials in hosting environment variables.
- Enforce workspace and role filters before retrieval in multi-tenant production environments.

## Roadmap

- Persistent PostgreSQL/pgvector storage for uploaded documents and chunks.
- OCR support for scanned PDFs.
- Pluggable embedding providers such as OpenAI, Gemini, Ollama, or Sentence Transformers.
- Object storage for original source files.
- Workspace-level billing and tenant management.
- Audit export for compliance teams.
- Advanced retrieval evaluation dashboard.

## Author

**Md Kamran Ahmad**

- GitHub: [github.com/kamranahmad786](https://github.com/kamranahmad786)
- LinkedIn: [linkedin.com/in/mdkamranahmad](https://www.linkedin.com/in/mdkamranahmad/)
- Portfolio: [kamverse.vercel.app](https://kamverse.vercel.app)

## License

This project is currently maintained as a portfolio and learning project. Add a dedicated license file before using it for commercial distribution.
