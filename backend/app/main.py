import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routers import health

load_dotenv()

STATIC_DIR = os.getenv("STATIC_DIR", str(Path(__file__).resolve().parent.parent.parent / "frontend" / "out"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="PreLegal API", lifespan=lifespan)

app.include_router(health.router)

if Path(STATIC_DIR).is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
