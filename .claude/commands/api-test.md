---
description: Test all API endpoints to verify backend is working correctly
---

Start the backend server if not running, then run these checks:

!`curl -s http://localhost:8000/ | python -m json.tool`

!`curl -s -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"code": "password = \"secret123\"\nimport os\nos.system(input())", "filename": "test.py"}' \
  | python -m json.tool`

!`curl -s http://localhost:8000/api/history | python -m json.tool`

!`curl -s http://localhost:8000/api/health | python -m json.tool`

Verify:
1. Root returns status "running"
2. Scan returns vulnerabilities with severity ratings
3. History returns at least one past scan
4. Health returns status "ok" with database "connected"

Report any failures and fix them.
