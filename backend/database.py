# database.py — SQLite setup with SQLAlchemy
# Defines ORM models for scan persistence
# DB stored at backend/data/secuscan.db

import hashlib
import os
from datetime import datetime, timezone
from typing import Generator

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, create_engine, Index
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'secuscan.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


class ScanRecord(Base):
    """ORM model for the scans table."""

    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String, nullable=False)
    scanned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    total_vulnerabilities = Column(Integer, default=0)
    code_hash = Column(String, index=True)

    vulnerabilities = relationship("VulnerabilityRecord", back_populates="scan", cascade="all, delete-orphan")


class VulnerabilityRecord(Base):
    """ORM model for the vulnerabilities table."""

    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    vulnerability = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    line_number = Column(Integer, nullable=True)
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)

    scan = relationship("ScanRecord", back_populates="vulnerabilities")


Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Yield a database session for FastAPI dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_code(code: str) -> str:
    """Generate SHA-256 hash of code for deduplication."""
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def find_existing_scan(db: Session, code_hash: str) -> ScanRecord | None:
    """Find an existing scan with the same code hash."""
    return db.query(ScanRecord).filter(ScanRecord.code_hash == code_hash).first()


def save_scan(db: Session, filename: str, code_hash: str, vulnerabilities: list[dict]) -> ScanRecord:
    """Save a new scan and its vulnerabilities to the database."""
    scan = ScanRecord(
        filename=filename,
        code_hash=code_hash,
        total_vulnerabilities=len(vulnerabilities),
    )
    db.add(scan)
    db.flush()

    for vuln in vulnerabilities:
        record = VulnerabilityRecord(
            scan_id=scan.id,
            vulnerability=vuln.get("vulnerability", "Unknown"),
            severity=vuln.get("severity", "MEDIUM"),
            line_number=vuln.get("line_number"),
            description=vuln.get("description", ""),
            recommendation=vuln.get("recommendation", ""),
        )
        db.add(record)

    db.commit()
    db.refresh(scan)
    return scan
