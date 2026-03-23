# SecuScan — AI Security Scanner

## Commands
cd backend && uvicorn main:app --reload          # Start FastAPI backend
cd frontend && npm run dev                        # Start React dev server
cd backend && python cli.py scan --file test.py   # Run CLI scanner
cd backend && python -m pytest tests/             # Run backend tests

## Architecture
- Python FastAPI backend in backend/
- React + TypeScript + Vite frontend in frontend/
- SQLite via SQLAlchemy for scan persistence
- Google Gemini API (gemini-2.0-flash) for code analysis
- Rich library for CLI color output

## Project Structure
- backend/main.py — FastAPI routes (POST /api/scan, GET /api/history, GET /api/scan/{id})
- backend/scanner.py — Core scanning logic, Gemini API integration
- backend/database.py — SQLAlchemy models, SQLite setup, dedup via SHA-256 hashing
- backend/models.py — Pydantic request/response schemas
- backend/cli.py — Rich-based CLI interface
- frontend/src/ — React app with Terminal Noir design system

## Conventions
- All API responses follow shape: { data, error } or Pydantic models
- Vulnerability severities are strictly: CRITICAL, HIGH, MEDIUM, LOW
- Code hashing uses SHA-256 for deduplication before calling Gemini
- Never log or store raw API keys — load from .env only
- Use python-dotenv for env vars, never hardcode secrets
- Frontend uses Tailwind CSS with custom CSS variables for the Terminal Noir theme
- All Gemini prompts must request JSON output and handle parsing failures gracefully

## Watch Out For
- Gemini sometimes returns markdown-fenced JSON (```json...```). Always strip fences before parsing.
- SQLite DB lives in backend/data/secuscan.db — create the data/ dir if missing
- CORS middleware must allow all origins for local dev (frontend on 5173, backend on 8000)
- The .env file y .env.example and add your GEMINI_API_KEY
