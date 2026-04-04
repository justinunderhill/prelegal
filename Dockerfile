# Stage 1: Build frontend static export
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Python backend serving static files
FROM python:3.12-slim
RUN pip install uv

WORKDIR /app
COPY backend/ /app/backend/
RUN cd /app/backend && uv sync --no-dev

COPY --from=frontend-builder /app/frontend/out /app/frontend/out
COPY templates/ /app/templates/

ENV STATIC_DIR=/app/frontend/out
ENV DB_PATH=/app/data/prelegal.db
RUN mkdir -p /app/data

WORKDIR /app/backend

EXPOSE 8000
CMD ["uv", "run", "--project", "/app/backend", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
