# SecuScan

AI-powered security scanner that detects vulnerabilities in Python code using Google Gemini, with color-coded severity ratings, scan history tracking, and a terminal-inspired web dashboard.

![screenshot](screenshot.png)

## Features

- **AI-Powered Analysis** — Uses Google Gemini to detect SQL injection, hardcoded secrets, weak cryptography, command injection, and more
- **Severity Ratings** — Color-coded CRITICAL / HIGH / MEDIUM / LOW classifications for every finding
- **Smart Caching** — SHA-256 deduplication skips re-scanning identical code, saving API calls
- **Scan History** — SQLite-backed history with severity breakdowns and trend tracking
- **Dual Interface** — Rich CLI for terminal users + React web dashboard with real-time results
- **File & Inline Scanning** — Scan .py files from disk or paste code directly

## Tech Stack

**Backend:** Python, FastAPI, SQLAlchemy, SQLite, Google Gemini API, Rich  
**Frontend:** React, TypeScript, Vite, Tailwind CSS  
**Design:** Terminal Noir — dark theme, JetBrains Mono, electric cyan accents

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your Gemini API key to .env
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### CLI

```bash
cd backend
python cli.py scan --file path/to/file.py
python cli.py scan --code 'password = "admin123"'
python cli.py history
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scan` | Scan code for vulnerabilities |
| GET | `/api/history` | List all past scans |
| GET | `/api/scan/{id}` | Get full scan details |
| DELETE | `/api/history/{id}` | Delete a scan |
| GET | `/api/health` | API health check |

## Note

The Gemini API free tier is sufficient for this project. No credit card required.

## License

MIT
