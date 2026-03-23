---
paths:
  - "backend/**/*.py"
---
# Python Code Style

- Use type hints on all function signatures
- Use Pydantic models for all API request/response schemas, never raw dicts
- Async route handlers in FastAPI where possible
- Imports ordered: stdlib, third-party, local (separated by blank lines)
- Use f-strings, never .format() or % formatting
- All database operations go through SQLAlchemy session, never raw SQL
- Exception handling: catch specific exceptions, never bare except
- Docstrings on all public functions (one-liner is fine)
