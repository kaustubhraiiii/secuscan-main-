---
description: Run the scanner against a test vulnerable Python file and verify output
---

Create a temporary file at backend/test_vulnerable.py with this content if it does not already exist:

import sqlite3
import hashlib
import os

password = "admin123"
secret_key = "sk-abc123def456"

def get_user(username):
    conn = sqlite3.connect("app.db")
    query = f"SELECT * FROM users WHERE name = '{username}'"
    return conn.execute(query).fetchone()

def hash_password(pw):
    return hashlib.md5(pw.encode()).hexdigest()

def run_command(user_input):
    os.system(f"echo {user_input}")

Then run:
!`cd backend && python cli.py scan --file test_vulnerable.py`

Verify that the output:
1. Shows at least 4 vulnerabilities (SQL injection, hardcoded secrets, weak hash, command injection)
2. Has color-coded severity ratings
3. Shows a summary line at the bottom

If anything fails, diagnose and fix the issue.
