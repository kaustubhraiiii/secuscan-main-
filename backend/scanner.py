# scanner.py — Core scanning logic
# Handles Groq API integration for code vulnerability analysis
# Includes SHA-256 hashing for scan deduplication

import json
import os
import re

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

GROQ_MODEL = "llama-3.3-70b-versatile"

SCAN_PROMPT = """Analyze the following Python code for security vulnerabilities.

Return a JSON array where each item has:
- "vulnerability": name of the vulnerability
- "severity": one of CRITICAL, HIGH, MEDIUM, LOW
- "line_number": integer line number where the issue occurs, or null if not applicable
- "description": 1-2 sentence explanation of the issue
- "recommendation": how to fix it

Return ONLY the JSON array, no other text.

Code:
```python
{code}
```"""


def _strip_markdown_fences(text: str) -> str:
    """Remove markdown code fences from LLM response."""
    stripped = re.sub(r"^```(?:json)?\s*\n?", "", text.strip())
    stripped = re.sub(r"\n?```\s*$", "", stripped)
    return stripped.strip()


def _get_client() -> OpenAI:
    """Create an OpenAI client pointed at Groq."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment. Add it to .env")
    return OpenAI(base_url="https://api.groq.com/openai/v1", api_key=api_key)


def scan_code(code: str, filename: str = "untitled.py") -> dict:
    """Scan Python code for security vulnerabilities using Groq."""
    client = _get_client()
    prompt = SCAN_PROMPT.format(code=code)

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        raw_text = response.choices[0].message.content
    except Exception as e:
        return {
            "filename": filename,
            "vulnerabilities": [],
            "error": f"Groq API error: {e}",
        }

    try:
        cleaned = _strip_markdown_fences(raw_text)
        vulnerabilities = json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "filename": filename,
            "vulnerabilities": [],
            "error": "Failed to parse Groq response as JSON",
            "raw_response": raw_text,
        }

    return {
        "filename": filename,
        "vulnerabilities": vulnerabilities,
        "error": None,
    }


def scan_file(filepath: str) -> dict:
    """Read a .py file from disk and scan it for vulnerabilities."""
    abs_path = os.path.abspath(filepath)
    if not os.path.isfile(abs_path):
        return {
            "filename": filepath,
            "vulnerabilities": [],
            "error": f"File not found: {filepath}",
        }

    with open(abs_path, "r", encoding="utf-8") as f:
        code = f.read()

    return scan_code(code, filename=os.path.basename(abs_path))


if __name__ == "__main__":
    test_code = '''import sqlite3
password = "admin123"
query = "SELECT * FROM users WHERE name = '" + user_input + "'"
'''
    result = scan_code(test_code, filename="test_snippet.py")

    if result["error"]:
        print(f"Error: {result['error']}")
    else:
        print(f"Found {len(result['vulnerabilities'])} vulnerabilities:\n")
        for vuln in result["vulnerabilities"]:
            print(f"  [{vuln['severity']}] {vuln['vulnerability']}")
            print(f"    Line: {vuln.get('line_number', 'N/A')}")
            print(f"    {vuln['description']}")
            print(f"    Fix: {vuln['recommendation']}\n")
