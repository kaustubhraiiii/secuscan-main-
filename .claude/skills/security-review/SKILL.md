---
name: security-review
description: Review Python code in this project for security vulnerabilities. Use when editing backend code, adding new API routes, modifying database queries, or when the user mentions security, vulnerabilities, or auditing.
allowed-tools: Read, Grep, Glob
---

When reviewing code in this project for security issues, check for:

1. **Injection vulnerabilities**: SQL injection via string concatenation, OS command injection via os.system/subprocess with user input, code injection via eval/exec
2. **Secret exposure**: Hardcoded API keys, passwords, tokens, or secrets in source files. Check that .env is gitignored and .env.example has only placeholders
3. **Weak cryptography**: MD5 or SHA1 for password hashing (should use bcrypt/argon2), insufficient randomness
4. **Input validation gaps**: Missing length checks on API inputs, missing type validation, path traversal in file operations
5. **Database safety**: Raw SQL strings instead of parameterized queries/ORM, missing input sanitization before DB storage
6. **API security**: Missing rate limiting notes, overly permissive CORS for production, error messages leaking stack traces or internal details
7. **Dependency concerns**: Known vulnerable package versions in requirements.txt

Report findings as:
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- File and line number
- What the vulnerability is
- How to fix it

Prioritize findings that could be exploited remotely over local-only issues.
