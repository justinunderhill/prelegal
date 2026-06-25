import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routers import chat, health

load_dotenv()

STATIC_DIR = os.getenv(
    "STATIC_DIR",
    str(Path(__file__).resolve().parent.parent.parent / "frontend" / "out"),
)
LOCAL_FRONTEND_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]


def _allowed_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "")
    extra_origins = [
        origin.strip() for origin in configured.split(",") if origin.strip()
    ]
    return [*LOCAL_FRONTEND_ORIGINS, *extra_origins]


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="PreLegal API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router)

if Path(STATIC_DIR).is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
