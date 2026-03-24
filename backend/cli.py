# cli.py — Rich-based CLI for SecuScan
# Calls scanner directly and saves results to database

import argparse
import os
import sys
from datetime import datetime, timezone

from rich.console import Console
from rich.table import Table
from rich.text import Text

from database import SessionLocal, find_existing_scan, hash_code, save_scan, ScanRecord, VulnerabilityRecord
from scanner import scan_code

console = Console()

SEVERITY_STYLES = {
    "CRITICAL": "bold red",
    "HIGH": "red",
    "MEDIUM": "yellow",
    "LOW": "green",
}


def _run_scan(code: str, filename: str) -> None:
    """Scan code, save to DB, and print results."""
    db = SessionLocal()
    try:
        code_hash = hash_code(code)
        existing = find_existing_scan(db, code_hash)
        is_cached = existing is not None

        if is_cached:
            scan = existing
            vulns = [
                {
                    "vulnerability": v.vulnerability,
                    "severity": v.severity,
                    "line_number": v.line_number,
                    "description": v.description,
                    "recommendation": v.recommendation,
                }
                for v in scan.vulnerabilities
            ]
        else:
            result = scan_code(code, filename=filename)
            if result["error"]:
                console.print(f"[bold red]Error:[/bold red] {result['error']}")
                sys.exit(1)
            vulns = result["vulnerabilities"]
            scan = save_scan(db, filename, code_hash, vulns)

        # Header
        timestamp = scan.scanned_at.strftime("%Y-%m-%d %H:%M:%S UTC") if scan.scanned_at else "N/A"
        console.print()
        console.print(f"[bold cyan]SecuScan Results[/bold cyan] — [bold]{filename}[/bold]")
        console.print(f"[dim]{timestamp}[/dim]")

        if is_cached:
            console.print("[dim]Results loaded from cache[/dim]")

        console.print()

        if not vulns:
            console.print("[bold green]No vulnerabilities found.[/bold green]")
            return

        # Vulnerability table
        table = Table(show_header=True, header_style="bold")
        table.add_column("Severity", width=10)
        table.add_column("Vulnerability", min_width=20)
        table.add_column("Line", justify="right", width=6)
        table.add_column("Description", min_width=30)
        table.add_column("Recommendation", min_width=30)

        for v in vulns:
            sev = v.get("severity", "MEDIUM") if isinstance(v, dict) else v["severity"]
            style = SEVERITY_STYLES.get(sev, "white")
            severity_text = Text(sev, style=style)
            line = str(v.get("line_number") or "—") if isinstance(v, dict) else str(v.get("line_number") or "—")

            table.add_row(
                severity_text,
                v.get("vulnerability", "Unknown"),
                line,
                v.get("description", ""),
                v.get("recommendation", ""),
            )

        console.print(table)

        # Summary
        counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for v in vulns:
            sev = v.get("severity", "MEDIUM")
            if sev in counts:
                counts[sev] += 1

        total = len(vulns)
        parts = []
        for sev, count in counts.items():
            if count > 0:
                style = SEVERITY_STYLES[sev]
                parts.append(f"[{style}]{count} {sev.lower()}[/{style}]")

        summary = ", ".join(parts)
        console.print(f"\nFound [bold]{total}[/bold] vulnerabilities ({summary})")
        console.print()
    finally:
        db.close()


def cmd_scan(args: argparse.Namespace) -> None:
    """Handle the scan subcommand."""
    if args.file:
        filepath = os.path.abspath(args.file)
        if not os.path.isfile(filepath):
            console.print(f"[bold red]Error:[/bold red] File not found: {args.file}")
            sys.exit(1)
        with open(filepath, "r", encoding="utf-8") as f:
            code = f.read()
        if not code.strip():
            console.print("[bold red]Error:[/bold red] File is empty")
            sys.exit(1)
        filename = os.path.basename(filepath)
    elif args.code:
        code = args.code
        if not code.strip():
            console.print("[bold red]Error:[/bold red] Code cannot be empty")
            sys.exit(1)
        filename = "inline_code.py"
    else:
        console.print("[bold red]Error:[/bold red] Provide --code or --file")
        sys.exit(1)

    if len(code) > 50000:
        console.print("[bold red]Error:[/bold red] Code exceeds 50,000 character limit")
        sys.exit(1)

    _run_scan(code, filename)


def cmd_history(args: argparse.Namespace) -> None:
    """Handle the history subcommand."""
    db = SessionLocal()
    try:
        scans = db.query(ScanRecord).order_by(ScanRecord.scanned_at.desc()).all()

        if not scans:
            console.print("[dim]No scan history found.[/dim]")
            return

        table = Table(title="Scan History", show_header=True, header_style="bold")
        table.add_column("ID", justify="right", width=6)
        table.add_column("Filename", min_width=20)
        table.add_column("Date", min_width=20)
        table.add_column("Total", justify="right", width=6)
        table.add_column("Critical", justify="right", width=8, style="bold red")
        table.add_column("High", justify="right", width=6, style="red")
        table.add_column("Medium", justify="right", width=8, style="yellow")
        table.add_column("Low", justify="right", width=6, style="green")

        for scan in scans:
            counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
            for v in scan.vulnerabilities:
                if v.severity in counts:
                    counts[v.severity] += 1

            date_str = scan.scanned_at.strftime("%Y-%m-%d %H:%M") if scan.scanned_at else "N/A"

            table.add_row(
                str(scan.id),
                scan.filename,
                date_str,
                str(scan.total_vulnerabilities),
                str(counts["CRITICAL"]),
                str(counts["HIGH"]),
                str(counts["MEDIUM"]),
                str(counts["LOW"]),
            )

        console.print()
        console.print(table)
        console.print()
    finally:
        db.close()


def main() -> None:
    """Entry point for the CLI."""
    parser = argparse.ArgumentParser(
        prog="secuscan",
        description="SecuScan — AI-powered Python security scanner",
    )
    subparsers = parser.add_subparsers(dest="command")

    # scan subcommand
    scan_parser = subparsers.add_parser("scan", help="Scan Python code for vulnerabilities")
    scan_parser.add_argument("--code", type=str, help="Inline code to scan")
    scan_parser.add_argument("--file", type=str, help="Path to a Python file to scan")

    # history subcommand
    subparsers.add_parser("history", help="Show past scan history")

    args = parser.parse_args()

    if args.command == "scan":
        cmd_scan(args)
    elif args.command == "history":
        cmd_history(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
