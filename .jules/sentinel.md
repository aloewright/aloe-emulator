## 2024-05-23 - Prevent Sensitive Data Leakage in Logs
**Vulnerability:** The AI command handlers and clients were logging full user prompts, system prompts, and AI generated responses to standard output using `println!`.
**Learning:** Development logs often get left in production code. When dealing with sensitive user data (like AI prompts which may contain code secrets or PII), "debug" logging must be strictly sanitized or removed in production. `println!` bypasses log levels and always outputs, making it dangerous for sensitive data.
**Prevention:**
1. Avoid `println!` for logging in backend code; use a proper logging framework (like `log` or `tracing`) with configurable levels.
2. Never log entire request bodies or unmasked user input in the "happy path".
3. If debugging is needed, use conditional compilation (`#[cfg(debug_assertions)]`) or trace logging level.
