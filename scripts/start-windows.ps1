$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."
docker compose up --build -d
Write-Host "PreLegal is running at http://localhost:8000"
