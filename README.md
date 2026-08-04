# TourGenie

**Tourism Recommendation & Itinerary Planner for Varanasi**

TourGenie is a full-stack, RAG-based conversational AI system that helps travelers plan personalized trips to Varanasi. It combines structured tourism datasets, official government PDF reports, and a large language model to deliver grounded, explainable recommendations — while also giving city administrators visibility into system usage and citizen-reported civic issues.

---

## Overview

TourGenie is built around a single design principle: **every answer must be grounded in verified data — never invented.** The system retrieves from a curated knowledge base (structured CSV datasets + digitized official government PDFs) before generating any response, and explicitly refuses to answer when no relevant data exists for a query (e.g. cities outside Varanasi).

The project has three layers:

1. **RAG Pipeline** (LangGraph) — parses user intent, retrieves and ranks relevant documents, builds itineraries, and generates grounded responses.
2. **FastAPI Backend** — exposes the pipeline through authenticated REST APIs, with session-based conversational memory, analytics, and civic engagement features.
3. **React Frontend** — a multi-page, role-based (user/admin) interface for chatting, exploring, and managing the platform.

---

## Key Features

### For Travelers
- **Conversational AI chat** — natural language trip planning with follow-up question support (conversational memory persists across sessions)
- **Grounded recommendations** — attractions, restaurants, hotels, festivals, restrictions, and travel tips, all sourced from verified datasets
- **Official tourism statistics** — factual answers (e.g. "How many foreign tourists visit Varanasi?") sourced from digitized government reports
- **Interactive maps** — location and accessibility maps surfaced automatically for relevant queries
- **Personalization** — budget, trip duration, traveller type (solo/family/couple), accessibility needs, and interests all shape recommendations
- **Favorites** — save places for later
- **Community tips** — real traveler experiences shared per place (public, browsable without login)
- **Civic issue reporting** — report local issues (garbage, road damage, safety concerns) with photo evidence, routed to the appropriate department
- **Multilingual support** — query and respond in the user's preferred language
- **Voice queries** — speech-to-text and text-to-speech support

### For Administrators
- **Usage analytics dashboard** — total/answered/unanswered queries, token usage, average response time
- **User management** — view all registered users
- **Civic report review** — view and update the status of citizen-submitted issue reports
- **System health monitoring** — liveness and vector database connectivity checks

---

## Architecture
```
User Query
↓
Preference Parser → extracts city, budget, days, interests, traveller type
↓
Rule Engine → decides which knowledge categories are relevant
↓
Retriever → semantic search over ChromaDB (with per-category filtering)
↓
Ranking Engine → scores results by relevance, popularity, and personalization fit
↓
Itinerary Engine → builds a day-wise structured itinerary
↓
Prompt Builder → assembles grounded context + conversation history
↓
LLM (Groq) → generates the final natural-language response
```

---
## City resolution is layered for reliability:
1. Direct city-name match
2. Explicit mention of an unsupported city → refuse gracefully, no data substitution
3. Place-name index match (built dynamically from indexed data)
4. Semantic similarity fallback
5. Session's last-known city (for natural follow-up questions)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Orchestration | LangGraph |
| LLM | Groq (Llama 3.3) |
| Vector Database | ChromaDB |
| Embeddings | BAAI/bge-m3 |
| Document Digitization | Sarvam AI (Document Intelligence, Saaras, Bulbul, Translate) |
| Backend API | FastAPI |
| Auth | JWT (python-jose) + bcrypt |
| Relational Storage | SQLite (sessions, users, reports, favorites, tips) |
| Frontend | React (Vite) + Tailwind CSS + React Router |
| Icons/Charts | lucide-react, Recharts |

---
---

## Setup & Installation

### Backend

```bash
cd AI-Tourism-Recommendation-System
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

---

## Environment Variables

Create a `.env` file in the backend root:

```dotenv
GROQ_API_KEY=your_groq_api_key
SARVAM_API_KEY=your_sarvam_api_key

ADMIN_EMAIL=admin@yourapp.com
ADMIN_PASSWORD=ChooseAStrongPassword

JWT_SECRET_KEY=a_long_random_secret_string

LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_BASE_URL=your_langfuse_base_url
```

A fixed administrator account is created automatically on first server startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

## Running the System

### 1. Build the vector index (first-time setup)

```bash
python -m backend.rag.create_index          # CSV datasets
python -m backend.rag.create_pdf_index       # tourism statistics PDF
python -m backend.rag.create_maps_index      # map/location PDFs
```

### 2. Start the backend

```bash
uvicorn backend.api.main:app --reload
```

API docs available at `http://127.0.0.1:8000/docs`

### 3. Start the frontend

```bash
cd frontend
npm install tailwindcss @tailwindcss/vite react-router-dom axios lucide-react recharts date-fns
npm run dev
```

App available at `http://localhost:5173`

---

## API Reference

| Group | Endpoints |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login` |
| **Chat** | `POST /chat/query`, `POST /chat/new`, `GET /chat/history`, `GET /chat/history/{id}`, `DELETE /chat/history/{id}` |
| **Explore** (public) | `GET /explore/attractions`, `GET /explore/festivals` |
| **Maps** | `GET /maps/{filename}` |
| **Voice** | `POST /voice/query`, `GET /voice/audio/{filename}` |
| **Favorites** | `GET /favorites/`, `POST /favorites/`, `DELETE /favorites/{id}` |
| **Local Tips** | `POST /tips/`, `GET /tips/place/{place_name}`, `GET /tips/my`, `DELETE /tips/{id}` |
| **Civic Reports** | `POST /reports/`, `GET /reports/my`, `GET /reports/all` (admin), `PATCH /reports/{id}/status` (admin) |
| **Admin** | `GET /admin/stats`, `GET /admin/users` |
| **Health** | `GET /health/`, `GET /health/detailed` |

Full interactive documentation is available via Swagger UI at `/docs`.

---

## Data Sources

- **Structured CSV datasets** — attractions, restaurants, hotels, festivals, restrictions, travel tips, emergency services, distance matrix, FAQs
- **Official government reports** — digitized via Sarvam AI Document Digitization:
  - Tourism statistics (foreign/domestic tourist arrivals, cultural events)
  - City overview and location maps
  - Site accessibility maps

Every retrieved document is classified into a category (`attractions`, `restaurants`, `tourism_stats`, `policy`, `city_maps`, etc.) at ingestion time, allowing the rule engine to selectively surface only relevant data per query — without deleting or discarding any indexed content.

---

## Roadmap

- [ ] Multi-city support (currently Varanasi only)
- [ ] Cross-encoder re-ranking for improved retrieval precision
- [ ] Multi-admin roles (state-level admins + super admin)
- [ ] Knowledge base management UI (PDF/CSV upload, index rebuild)
- [ ] Production-grade observability (LangSmith/Langfuse integration)

---
