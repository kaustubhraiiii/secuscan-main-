# main.py — FastAPI app entry point
# Routes: POST /api/scan, GET /api/history, GET /api/scan/{id}, DELETE /api/history/{id}

from collections import Counter

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import ScanRecord, VulnerabilityRecord, engine, find_existing_scan, get_db, hash_code, save_scan
from models import ScanHistoryItem, ScanRequest, ScanResponse, VulnerabilityOut
from scanner import scan_code

app = FastAPI(title="SecuScan", version="1.0.0")

# CORS — permissive for local dev (frontend on 5173, backend on 8000)
# TODO: restrict origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict:
    """Health check endpoint."""
    return {"status": "running", "version": "1.0.0"}


@app.get("/api/health")
async def api_health() -> dict:
    """Detailed health check with database status."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    return {"status": "ok", "database": db_status}


@app.post("/api/scan", response_model=ScanResponse)
async def api_scan(request: ScanRequest, db: Session = Depends(get_db)) -> ScanResponse:
    """Scan code for security vulnerabilities."""
    if not request.code.strip():
        raise HTTPException(status_code=422, detail="Code cannot be empty or whitespace-only")
    if len(request.code) > 50000:
        raise HTTPException(status_code=422, detail="Code exceeds 50,000 character limit")

    code_hash = hash_code(request.code)

    existing = find_existing_scan(db, code_hash)
    if existing:
        return ScanResponse(
            id=existing.id,
            filename=existing.filename,
            scanned_at=existing.scanned_at,
            vulnerabilities=[VulnerabilityOut.model_validate(v) for v in existing.vulnerabilities],
            total_vulnerabilities=existing.total_vulnerabilities,
            is_duplicate=True,
        )

    result = scan_code(request.code, request.filename)

    if result["error"]:
        raise HTTPException(status_code=502, detail=result["error"])

    scan = save_scan(db, request.filename, code_hash, result["vulnerabilities"])

    return ScanResponse(
        id=scan.id,
        filename=scan.filename,
        scanned_at=scan.scanned_at,
        vulnerabilities=[VulnerabilityOut.model_validate(v) for v in scan.vulnerabilities],
        total_vulnerabilities=scan.total_vulnerabilities,
        is_duplicate=False,
    )


@app.get("/api/history", response_model=list[ScanHistoryItem])
async def api_history(db: Session = Depends(get_db)) -> list[ScanHistoryItem]:
    """List all past scans with severity breakdowns."""
    scans = db.query(ScanRecord).order_by(ScanRecord.scanned_at.desc()).all()

    items = []
    for scan in scans:
        severity_counts = Counter(v.severity for v in scan.vulnerabilities)
        breakdown = {
            "CRITICAL": severity_counts.get("CRITICAL", 0),
            "HIGH": severity_counts.get("HIGH", 0),
            "MEDIUM": severity_counts.get("MEDIUM", 0),
            "LOW": severity_counts.get("LOW", 0),
        }
        items.append(ScanHistoryItem(
            id=scan.id,
            filename=scan.filename,
            scanned_at=scan.scanned_at,
            total_vulnerabilities=scan.total_vulnerabilities,
            severity_breakdown=breakdown,
        ))

    return items


@app.get("/api/scan/{scan_id}", response_model=ScanResponse)
async def api_scan_detail(scan_id: int, db: Session = Depends(get_db)) -> ScanResponse:
    """Get full details of a specific scan."""
    scan = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return ScanResponse(
        id=scan.id,
        filename=scan.filename,
        scanned_at=scan.scanned_at,
        vulnerabilities=[VulnerabilityOut.model_validate(v) for v in scan.vulnerabilities],
        total_vulnerabilities=scan.total_vulnerabilities,
        is_duplicate=False,
    )


@app.delete("/api/history/{scan_id}")
async def api_delete_scan(scan_id: int, db: Session = Depends(get_db)) -> dict:
    """Delete a scan and its vulnerabilities."""
    scan = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    db.delete(scan)
    db.commit()
    return {"deleted": True}
