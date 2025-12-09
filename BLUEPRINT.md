# LLM Council - Project Blueprint

## Project Overview

**LLM Council** is a web application that leverages multiple Large Language Models working collaboratively to answer questions through a 3-stage deliberation process:

1. **Stage 1: First Opinions** - All models independently respond to the query
2. **Stage 2: Peer Review** - Models evaluate each other's responses (anonymized)
3. **Stage 3: Final Synthesis** - A "Chairman" model synthesizes all input into a final answer

Originally created by Andrej Karpathy as a weekend hack project.

---

## Current State (December 2025)

**Local-only installation** (Render deployment removed)

**Completed:**
- [x] Collapsible Stage 1 & Stage 2 (collapsed by default)
- [x] Prominent Stage 3 display with green checkmark
- [x] Browser-based conversation isolation (localStorage)

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                   (React + Vite, Port 5173)                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐│
│  │ Sidebar │  │  Chat   │  │ Stage   │  │  Stage 2/3      ││
│  │         │  │Interface│  │   1     │  │  Components     ││
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │ SSE/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI, Port 8001)             │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │  main.py │  │ council.py│  │openrouter │  │ storage.py│ │
│  │   API    │  │   Logic   │  │   Client  │  │   JSON    │ │
│  └──────────┘  └───────────┘  └───────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      OpenRouter API                          │
│         (GPT-5.1, Gemini, Claude Sonnet, Grok)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/config.py` | Model list, API key config |
| `backend/council.py` | Core 3-stage orchestration logic |
| `backend/openrouter.py` | Async OpenRouter API client |
| `backend/storage.py` | JSON conversation persistence |
| `backend/main.py` | FastAPI server (port 8001) |
| `frontend/src/App.jsx` | Main React app, streaming handler |
| `frontend/src/api.js` | API client with SSE support |
| `frontend/src/components/` | Stage1, Stage2, Stage3, Chat, Sidebar |

---

## Tech Stack

**Backend:**
- Python 3.10+
- FastAPI + Uvicorn
- httpx (async HTTP)
- python-dotenv

**Frontend:**
- React 19
- Vite 7
- React Markdown

**Package Management:**
- Backend: `uv` (modern Python package manager)
- Frontend: `npm`

---

## Setup Requirements

1. **Environment Variable:**
   ```
   OPENROUTER_API_KEY=sk-or-v1-...
   ```

2. **Backend:**
   ```bash
   uv sync
   uv run python -m backend.main
   ```

3. **Frontend:**
   ```bash
   cd frontend && npm install && npm run dev
   ```

---

## Project Phases

### Phase 0: Initial Setup ✅
- [x] Fork repository from karpathy/llm-council
- [x] Clone to local Projects directory
- [x] Explore and document codebase structure
- [x] Create .env file with OpenRouter API key
- [x] Install dependencies (backend + frontend)
- [x] Verify application runs locally

### Phase 1: Public Demo Deployment ✅
- [x] Deploy backend to Render Web Service
- [x] Deploy frontend to Render Static Site
- [x] Add collapsible stages UI (Stage 1 & 2 collapsed, Stage 3 prominent)
- [x] Add browser-based conversation isolation (localStorage)
- [x] Configure CORS for production

### Phase 2: Revert to Local + Multiple Councils

**Goal:** Remove Render deployment, add council type selection and personas

#### 2.1 Revert to Local Installation ✅
- [x] Remove Render-specific environment variables
- [x] Revert CORS to localhost only
- [x] Update documentation for local-only setup
- [ ] Delete Render services (manual step in Render dashboard)

#### 2.2 Council Modes with Deep Research Integration

**Goal:** Implement three distinct council modes that change how the deliberation process works.

---

##### Mode Overview

| Mode | Flow | Best For | Key Feature |
|------|------|----------|-------------|
| **Standard** | Stage 1 → Stage 2 → Stage 3 | General questions | Current behavior |
| **Research** | Deep Research → Stage 1 → Stage 2 → Stage 3 | Fact-finding, comparisons | Pre-research context |
| **Creative** | Stage 1 (high temp) → Stage 2 → Deep Research Chairman | Brainstorming, ideation | Creative exploration + grounded synthesis |

---

##### Architecture Changes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Frontend                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Sidebar                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  LLM Council                                             │    │   │
│  │  ├─────────────────────────────────────────────────────────┤    │   │
│  │  │  Mode: [Standard ▼]                                      │    │   │
│  │  │        ┌────────────────────────┐                        │    │   │
│  │  │        │ ○ Standard             │                        │    │   │
│  │  │        │ ○ Research             │                        │    │   │
│  │  │        │ ○ Creative             │                        │    │   │
│  │  │        └────────────────────────┘                        │    │   │
│  │  ├─────────────────────────────────────────────────────────┤    │   │
│  │  │  [+ New Conversation]                                    │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

##### Backend Implementation

**New file: `backend/modes.py`**
```python
MODES = {
    "standard": {
        "id": "standard",
        "name": "Standard",
        "description": "Balanced deliberation for general questions",
        "icon": "⚖️",
        "flow": "council",  # standard 3-stage
        "temperature": 0.7,
        "chairman_model": "google/gemini-3-pro-preview",
        "deep_research_model": None,
    },
    "research": {
        "id": "research",
        "name": "Research",
        "description": "Deep research before council deliberation",
        "icon": "🔬",
        "flow": "research_first",  # deep research → 3-stage
        "temperature": 0.7,
        "chairman_model": "google/gemini-3-pro-preview",
        "deep_research_model": "openai/o3-deep-research",
    },
    "creative": {
        "id": "creative",
        "name": "Creative",
        "description": "High-creativity brainstorming with grounded synthesis",
        "icon": "🎨",
        "flow": "creative_chairman",  # 3-stage with high temp + deep research chairman
        "temperature": 1.0,
        "chairman_model": "openai/o3-deep-research",
        "deep_research_model": None,
    },
}
```

**Modify `backend/openrouter.py`:**
- Add `temperature` parameter to `query_model()` and `query_models_parallel()`

**Modify `backend/council.py`:**
- Add `run_research_mode()` - calls deep research first, then council with context
- Add `run_creative_mode()` - council with high temperature, deep research chairman
- Modify existing functions to accept temperature parameter

**New file: `backend/deep_research.py`**
```python
async def run_deep_research(query: str, model: str = "openai/o3-deep-research") -> dict:
    """
    Run deep research on a query.
    Returns structured research results with sources.
    """
    # Deep research models have web search built-in
    # Longer timeout needed (up to 5 minutes)
    pass

async def format_research_context(research_result: dict) -> str:
    """
    Format research results as context for the council.
    """
    pass
```

**Modify `backend/main.py`:**
- Add `GET /api/modes` endpoint to list available modes
- Modify `POST /api/conversations` to accept `mode` parameter
- Modify message endpoints to use mode-specific flow

---

##### Frontend Implementation

**Modify `frontend/src/components/Sidebar.jsx`:**
- Add mode selector dropdown above "New Conversation" button
- Store selected mode in localStorage
- Pass selected mode to conversation creation

**Modify `frontend/src/api.js`:**
- Add `listModes()` function
- Modify `createConversation()` to accept mode parameter

**Modify `frontend/src/App.jsx`:**
- Track selected mode in state
- Pass mode to conversation creation
- Display mode indicator in chat

**New component: `frontend/src/components/ResearchStage.jsx`:**
- Display deep research results (for Research mode)
- Show sources and citations
- Collapsible like Stage 1/2

**Modify `frontend/src/components/ChatInterface.jsx`:**
- Handle new SSE events: `research_start`, `research_complete`
- Display ResearchStage component when applicable

---

##### SSE Event Flow by Mode

**Standard Mode (unchanged):**
```
stage1_start → stage1_complete → stage2_start → stage2_complete → stage3_start → stage3_complete → complete
```

**Research Mode:**
```
research_start → research_complete → stage1_start → stage1_complete → stage2_start → stage2_complete → stage3_start → stage3_complete → complete
```

**Creative Mode:**
```
stage1_start → stage1_complete → stage2_start → stage2_complete → research_start → research_complete → complete
```
(Note: In Creative mode, "research" phase IS the chairman synthesis via deep research model)

---

##### Implementation Checklist

**Backend:** ✅
- [x] Create `backend/modes.py` with mode definitions
- [x] Add `GET /api/modes` endpoint
- [x] Add temperature parameter to `query_model()` and `query_models_parallel()`
- [x] Create `backend/deep_research.py` with `run_deep_research()`
- [x] Modify `run_full_council()` to accept mode parameter
- [x] Add `run_research_mode()` function
- [x] Add `run_creative_mode()` function
- [x] Update streaming endpoint to handle new events
- [x] Store mode in conversation JSON

**Frontend:** ✅
- [x] Add mode selector to Sidebar
- [x] Store selected mode in localStorage
- [x] Pass mode to `createConversation()` API call
- [x] Create `ResearchStage.jsx` component
- [x] Handle `research_start` and `research_complete` SSE events
- [x] Display mode indicator in conversation list
- [x] Update loading states for research phase

**Testing:**
- [ ] Test Standard mode (should work as before)
- [ ] Test Research mode with fact-based query
- [ ] Test Creative mode with brainstorming query
- [ ] Verify mode persists across page refreshes
- [ ] Test error handling for deep research failures

---

##### Cost Considerations

| Mode | Estimated Cost per Query |
|------|--------------------------|
| Standard | ~$0.10-0.30 (4 models × 2 stages + chairman) |
| Research | ~$10-15 (deep research) + ~$0.10-0.30 (council) |
| Creative | ~$0.10-0.20 (council) + ~$10-15 (deep research chairman) |

**Note:** Deep research models (o3-deep-research) are expensive due to web search. Consider:
- Adding cost warning in UI before Research/Creative mode
- Using cheaper alternatives like `alibaba/tongyi-deepresearch-30b-a3b` ($0.09/M input)
- Making deep research model configurable in settings

#### 2.3 Conversation Continuation (Requires Analysis)

**Current Limitation:** Each user query runs the full 3-stage process independently. There's no way to ask follow-up questions that build on previous context.

**Complexity Analysis:**

| Approach | Description | Complexity | Pros | Cons |
|----------|-------------|------------|------|------|
| **A: Simple Context Window** | Include previous Q&A in prompt | Low | Easy to implement | Token limits, expensive |
| **B: Summary Injection** | Summarize previous exchange, inject as context | Medium | Manages token usage | May lose nuance |
| **C: Selective Memory** | Only Stage 3 final answer becomes context | Low-Medium | Clean, focused | Loses Stage 1/2 insights |
| **D: Full State Tracking** | Each model remembers its own previous responses | High | Most authentic continuation | Complex, expensive |

**Recommended: Approach C (Selective Memory)**
- When continuing a conversation, inject the previous Stage 3 response as context
- New user message becomes a follow-up question
- All 3 stages run again, but with awareness of previous answer

**Implementation Steps:**
- [ ] Modify conversation storage to track "conversation threads"
- [ ] Add "Continue" mode vs "New Query" mode
- [ ] Inject previous Stage 3 into Stage 1 prompts as context
- [ ] Update chairman prompt to acknowledge this is a follow-up
- [ ] UI: Add visual indicator that this is a continuation

**Open Questions:**
- Should the same models be used for continuations, or could the council change?
- How many turns of history should be included?
- Should continuation be automatic (same conversation) or explicit (user chooses)?

---

### Phase 3: Persona Councils (Future)

**Goal:** Add themed council configurations with distinct personalities.

Once the mode system is in place, persona councils can be layered on top:

| Persona Council | Description | Example Members |
|-----------------|-------------|-----------------|
| Shark Tank | Investment pitch evaluation | Mark Cuban, Barbara Corcoran, Kevin O'Leary, Lori Greiner |
| Technical Review | Code/architecture review | Senior Engineer, Security Expert, DevOps Lead, QA |
| Legal Advisory | Legal analysis panel | Corporate Lawyer, IP Attorney, Compliance Officer |
| Creative Workshop | Writing/creative feedback | Editor, Novelist, Poet, Critic |

**Implementation:** Each persona adds a system prompt to the council members. Compatible with all three modes (Standard/Research/Creative).

---

### Phase 4: Future Enhancements (Ideas)

- [ ] Custom council builder (create personas in UI)
- [ ] Export conversation as markdown/PDF
- [ ] Cost tracking per query with running total
- [ ] Model selection UI (choose which models to include)
- [ ] Conversation continuation (follow-up questions)
- [ ] A/B testing different council configurations

---

## Notes

- Original repo: https://github.com/karpathy/llm-council
- Fork: https://github.com/MatthewSnow2/llm-council
- Described as "99% vibe coded" - experimental/educational project
- Data stored as JSON files in `data/conversations/`

---

## Render Deployment (Archived)

Render services to be deleted manually:
- `llm-council-api` (Web Service)
- `llm-council` (Static Site)
