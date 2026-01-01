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

LLM Council is a multi-stage deliberation system where multiple LLMs collaboratively answer user questions. Supports three modes:

**Standard Mode** (default):
```
User Query → Stage 1 (parallel) → Stage 2 (rankings) → Stage 3 (synthesis)
```

**Research Mode** (deep research first):
```
User Query → Deep Research → Stage 1 (with context) → Stage 2 → Stage 3
```

**Creative Mode** (high temperature + deep research chairman):
```
User Query → Stage 1 (temp=1.0) → Stage 2 → Stage 3 (o3-deep-research chairman)
```

### Stage Details

- **Stage 1:** Parallel queries to all `COUNCIL_MODELS` → individual responses
- **Stage 2:** Anonymize as "Response A/B/C" → parallel peer ranking → parsed rankings + aggregate scores
- **Stage 3:** Chairman synthesizes final answer from all context

### Backend (`backend/`)

FastAPI on port 8001:
- `config.py` - `COUNCIL_MODELS` list, `CHAIRMAN_MODEL`, API settings
- `modes.py` - Mode definitions (standard/research/creative) with flow types and temperatures
- `deep_research.py` - Deep research integration using `openai/o3-deep-research` (5-min timeout)
- `openrouter.py` - Async model queries with graceful degradation (returns None on failure)
- `council.py` - Core 3-stage logic, mode runners (`run_standard_mode`, `run_research_mode`, `run_creative_mode`), ranking parser, aggregate calculation
- `storage.py` - JSON persistence in `data/conversations/`
- `main.py` - FastAPI routes with SSE streaming support

### Frontend (`frontend/src/`)

React + Vite on port 5173:
- `api.js` - Backend API calls with streaming support (`sendMessageStream`)
- `components/ChatInterface.jsx` - Main chat UI with collapsible stages
- `components/ResearchStage.jsx` - Deep research results display
- `components/Stage1.jsx`, `Stage2.jsx`, `Stage3.jsx` - Individual stage displays
- `components/Sidebar.jsx` - Conversation list management

## Environment Variables

Create a `.env` file in the project root:
```bash
OPENROUTER_API_KEY=sk-or-v1-...  # Get from openrouter.ai
```

## Key Implementation Details

**Module imports:** Backend uses relative imports (`from .config import ...`). Always run as `python -m backend.main` from project root.

**Mode system:** Conversations have a `mode` field. Mode config in `modes.py` controls `flow` type, `temperature`, `chairman_model`, and `deep_research_model`. Frontend passes mode on conversation creation.

**Stage 2 anonymization:** Models receive "Response A, B, C" labels. Backend creates `label_to_model` mapping returned in API response. Frontend displays model names for readability.

**Ranking parser:** Extracts "FINAL RANKING:" section from model output. Fallback regex captures any "Response X" patterns.

**Streaming API:** `/api/conversations/{id}/message/stream` returns SSE events:
- `mode_info` - Mode configuration at start
- `research_start`, `research_complete` - Research mode only
- `stage1_start`, `stage1_complete`
- `stage2_start`, `stage2_complete` - Includes `label_to_model` and `aggregate_rankings` in metadata
- `stage3_start`, `stage3_complete`
- `title_complete` - First message only
- `complete`, `error`

**Title generation:** Uses `gemini-2.5-flash` for fast, cheap title generation on first message.

**Timeouts:** Standard models use 120s. Deep research models use 300s (`DEEP_RESEARCH_TIMEOUT`).

**Metadata ephemeral:** `label_to_model` and `aggregate_rankings` are returned via API but NOT persisted to JSON storage.

**Markdown rendering:** Wrap ReactMarkdown in `<div className="markdown-content">` for proper spacing (defined in `index.css`).

## Common Gotchas

1. **Import errors:** Must run backend from project root as module (`python -m backend.main`)
2. **Port 8001:** Backend uses 8001 (not default 8000). Update `main.py` and `api.js` if changing.
3. **Deep research timeouts:** Research mode and creative mode chairman use 5-minute timeouts - requests may appear slow.
4. **Mode persistence:** Mode is set on conversation creation and stored in JSON. Cannot change mode mid-conversation.
