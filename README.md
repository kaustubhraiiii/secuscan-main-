# SecuScan

AI-powered security scanner that detects vulnerabilities in Python code using Groq LLM, with color-coded severity ratings, scan history tracking, and a terminal-inspired web dashboard.

![screenshot](screenshot.png)

## Features

- **AI-Powered Analysis** — Uses Groq (llama-3.3-70b-versatile) to detect SQL injection, hardcoded secrets, weak cryptography, command injection, and more
- **Severity Ratings** — Color-coded CRITICAL / HIGH / MEDIUM / LOW classifications for every finding
- **Smart Caching** — SHA-256 deduplication skips re-scanning identical code, saving API calls
- **Scan History** — SQLite-backed history with severity breakdowns and trend tracking
- **Dual Interface** — Rich CLI for terminal users + React web dashboard with real-time results
- **File & Inline Scanning** — Scan .py files from disk or paste code directly

## Tech Stack

**Backend:** Python, FastAPI, SQLAlchemy, SQLite, Groq API, Rich
**Frontend:** React, TypeScript, Vite, Tailwind CSS
**Design:** Terminal Noir — dark theme, JetBrains Mono, electric cyan accents

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Groq API key (free tier is sufficient, no credit card required — get one at [console.groq.com](https://console.groq.com))

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your Groq API key to .env: GROQ_API_KEY=your_key_here
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The web app will be available at `http://localhost:5173`.

### CLI

```bash
cd backend
python cli.py scan --file path/to/file.py
python cli.py scan --code 'password = "admin123"'
python cli.py history
```

## API Endpoints

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| GET    | `/api/health`        | Health check + database status |
| POST   | `/api/scan`          | Scan code for vulnerabilities |
| GET    | `/api/history`       | List all past scans          |
| GET    | `/api/scan/{id}`     | Get full scan details        |
| DELETE | `/api/history/{id}`  | Delete a scan                |

## License

MIT
