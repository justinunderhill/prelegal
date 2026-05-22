"""Vercel serverless function for the AI chat endpoint.

On Vercel the Next.js frontend is served as a static export from the CDN, so
the FastAPI backend used in Docker is not running. This function exposes the
exact same `POST /api/chat` contract by reusing the existing backend chat
logic (system prompts, per-agreement schemas, and OpenAI Structured Outputs)
so behaviour is identical to running locally.
"""

import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

# Make the existing FastAPI backend package importable. The `backend/app/**`
# sources are bundled alongside this function via `includeFiles` in vercel.json.
_BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.services.chat_service import ChatRequest, process_turn  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        try:
            length = int(self.headers.get("content-length") or 0)
            body = self.rfile.read(length) if length else b"{}"
            data = json.loads(body or b"{}")
            request = ChatRequest(**data)
            result = process_turn(request)
            self._send_json(200, result.model_dump())
        except ValueError as exc:
            # Unknown agreement slug — mirror the FastAPI router's 404.
            self._send_text(404, str(exc))
        except Exception as exc:  # noqa: BLE001
            self._send_text(502, f"AI service error: {exc}")

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_text(self, status: int, message: str) -> None:
        body = message.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
