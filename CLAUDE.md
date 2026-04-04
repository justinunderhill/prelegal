# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation has a Mutual NDA form builder with live preview and PDF download, served via a FastAPI backend in Docker with a fake login screen.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use the OpenAI SDK with the `gpt-4.1` model (chat-capable, supports Structured Outputs). You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENAI_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed (PL-2)
- CommonPaper legal document templates added to templates/ directory

### Completed (PL-4)
- Next.js 16 frontend with App Router, Tailwind CSS v4, TypeScript
- Mutual NDA form builder with live preview and PDF download
- Dynamic form rendering, signature pad, template engine
- Agreement config/registry pattern (`lib/agreements/`)

### Completed (PL-5)
- FastAPI backend (`backend/`) with SQLite connection and health endpoint
- Docker multi-stage build (Node builds static export, Python serves it)
- Next.js static export (`output: 'export'`, `trailingSlash: true`) served by FastAPI at localhost:8000
- Fake login screen (accepts any credentials, localStorage-based AuthContext/useAuth)
- Brand colors applied across all components via Tailwind CSS v4 theme tokens
- Start/stop scripts for Mac, Linux, Windows
- `.dockerignore` to prevent secrets in Docker images

### Completed (PL-6)
- AI chat mode for Mutual NDA: freeform conversation to populate NDA fields
- Chat-only UI (no manual form mode toggle) with side-by-side chat + live document preview
- `POST /api/chat` endpoint using OpenAI SDK with Structured Outputs (model: `gpt-4.1`)
- Backend service layer with agreement registry (`backend/app/agreements/`) for extensibility
- Live document preview updates as AI extracts field values from conversation
- Chat is ephemeral (no DB persistence), API key stays server-side
- Viewport-locked layout: chat and preview panels fit within screen, no page scrolling
- Dockerfile WORKDIR fix for correct uvicorn module resolution

### Completed (PL-7)
- Expanded from Mutual NDA to all 11 agreement types: CSA, DPA, PSA, SLA, Design Partner, Partnership, Pilot, BAA, Software License, AI Addendum
- Backend: `ChatConfig` + Pydantic schema per agreement type, all registered in `backend/app/agreements/registry.py`
- Frontend: `AgreementConfig` per type in `frontend/lib/agreements/`, each with fields, Zod schema, `buildFieldMap()`, and `generateCoverPage()`
- Generic cover page generator (`coverPageGenerator.ts`) for non-NDA agreements; Mutual NDA retains custom cover page logic
- Markdown templates with `<span>` placeholder substitution for all agreement types in `frontend/public/templates/`
- Intake chat component (`IntakeChat.tsx`) for guiding users to the right document type
- PDF generation supports all types: `MutualNdaCoverPagePdf` for NDA, `GenericCoverPagePdf` for all others
- Agreement catalog page showing all available document types
- Dynamic `[slug]` routing serves all agreement builders

### Current API Endpoints
- `GET /api/health` - Health check
- `POST /api/chat` - AI chat for agreement field extraction

### Architecture Notes
- Frontend builds to `frontend/out/` via `next build`, served by FastAPI `StaticFiles(html=True)`
- `trailingSlash: true` required so Next.js generates `dir/index.html` files compatible with StaticFiles
- Auth uses `lib/auth/client.ts` abstraction — swap to real API calls when implementing real auth
- API routers must be registered before the StaticFiles mount in `backend/app/main.py`
- Chat uses flat party field names on backend (`party1_name`), nested on frontend (`party1.name`) — `useChatSession` hook handles the mapping
- AppShell uses `h-screen overflow-hidden` to lock layout to viewport; panels scroll independently