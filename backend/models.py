# models.py — Pydantic request/response schemas
# Defines ScanRequest, ScanResponse, Vulnerability, and related models
# Severity levels: CRITICAL, HIGH, MEDIUM, LOW

from datetime import datetime

from pydantic import BaseModel, Field


class ScanRequest(BaseModel):
    """Request body for scanning code."""

    code: str = Field(..., min_length=1, max_length=50000)
    filename: str = Field(default="untitled.py")


class VulnerabilityOut(BaseModel):
    """Single vulnerability in scan results."""

    id: int
    vulnerability: str
    severity: str
    line_number: int | None
    description: str
    recommendation: str

    model_config = {"from_attributes": True}


class ScanResponse(BaseModel):
    """Response body for a completed scan."""

    id: int
    filename: str
    scanned_at: datetime
    vulnerabilities: list[VulnerabilityOut]
    total_vulnerabilities: int
    is_duplicate: bool = False

    model_config = {"from_attributes": True}


class ScanHistoryItem(BaseModel):
    """Summary of a past scan for the history endpoint."""

    id: int
    filename: str
    scanned_at: datetime
    total_vulnerabilities: int
    severity_breakdown: dict[str, int] = Field(default_factory=dict)

    model_config = {"from_attributes": True}
