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

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenAI to the `openai/gpt-5.3-codex` model. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

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

### Current API Endpoints
- `GET /api/health` - Health check

### Architecture Notes
- Frontend builds to `frontend/out/` via `next build`, served by FastAPI `StaticFiles(html=True)`
- `trailingSlash: true` required so Next.js generates `dir/index.html` files compatible with StaticFiles
- Auth uses `lib/auth/client.ts` abstraction — swap to real API calls when implementing real auth
- API routers must be registered before the StaticFiles mount in `backend/app/main.py`