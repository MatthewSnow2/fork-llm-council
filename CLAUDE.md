# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
uv sync                         # Install backend dependencies
cd frontend && npm install      # Install frontend dependencies
./start.sh                      # Run both servers together
uv run python -m backend.main   # Backend only (port 8001)
cd frontend && npm run dev      # Frontend only (port 5173)
cd frontend && npm run lint     # Lint frontend
uv run python test_openrouter.py  # Test OpenRouter connectivity
```

## Architecture

LLM Council is a 3-stage deliberation system where multiple LLMs collaboratively answer user questions:

```
User Query
    ↓
Stage 1: Parallel queries to all council models → [individual responses]
    ↓
Stage 2: Anonymize as "Response A/B/C" → Parallel peer ranking → [evaluations + parsed rankings]
    ↓
Stage 3: Chairman synthesizes final answer from all context
    ↓
Frontend: Tab-based display with de-anonymization for readability
```

**Backend (`backend/`):** FastAPI on port 8001
- `config.py` - `COUNCIL_MODELS` list and `CHAIRMAN_MODEL`
- `openrouter.py` - Async model queries with graceful degradation (returns None on failure)
- `council.py` - Core 3-stage logic, ranking parser, aggregate calculation, title generation
- `storage.py` - JSON persistence in `data/conversations/`
- `main.py` - FastAPI routes with SSE streaming support

**Frontend (`frontend/src/`):** React + Vite on port 5173
- `api.js` - Backend API calls with streaming support (`sendMessageStream`)
- `components/ChatInterface.jsx` - Main chat UI with collapsible stages
- `components/Sidebar.jsx` - Conversation list management

## Environment Variables

Create a `.env` file in the project root:
```bash
OPENROUTER_API_KEY=sk-or-v1-...  # Get from openrouter.ai
```

## Key Implementation Details

**Module imports:** Backend uses relative imports (`from .config import ...`). Always run as `python -m backend.main` from project root.

**Stage 2 anonymization:** Models receive "Response A, B, C" labels. Backend creates `label_to_model` mapping returned in API response. Frontend displays model names for readability.

**Ranking parser:** Extracts "FINAL RANKING:" section from model output. Fallback regex captures any "Response X" patterns.

**Streaming API:** `/api/conversations/{id}/message/stream` returns SSE events: `stage1_start`, `stage1_complete`, `stage2_start`, `stage2_complete`, `stage3_start`, `stage3_complete`, `title_complete`, `complete`, `error`.

**Title generation:** Uses `gemini-2.5-flash` for fast, cheap title generation on first message.

**Metadata ephemeral:** `label_to_model` and `aggregate_rankings` are returned via API but NOT persisted to JSON storage.

**Markdown rendering:** Wrap ReactMarkdown in `<div className="markdown-content">` for proper spacing (defined in `index.css`).

## Common Gotchas

1. **Import errors:** Must run backend from project root as module (`python -m backend.main`)
2. **Port 8001:** Backend uses 8001 (not default 8000). Update `main.py` and `api.js` if changing.
