#!/bin/bash
set -e
cd "$(dirname "$0")/.."
docker compose up --build -d
echo "PreLegal is running at http://localhost:8000"
