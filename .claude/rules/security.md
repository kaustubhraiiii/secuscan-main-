# Security Rules — Apply Everywhere

- NEVER hardcode API keys, tokens, passwords, or secrets in any file
- NEVER print, log, or include API keys in error messages or responses
- NEVER commit .env files. Always use .env.example with placeholder values
- All user-supplied code input must be treated as untrusted — never exec() or eval() it
- Gemini API responses are untrusted data — always validate and sanitize before ston DB
- SQL injection prevention: use SQLAlchemy ORM methods exclusively, never string-concatenated queries
- API input validation: enforce max length on code submissions (50000 chars), reject empty strings
- File path inputs in CLI must be validated — reject paths outside the project directory
- CORS is permissive only for local dev. Add a note about restricting in production
- Store the SQLite DB outside the web-accessible directory
