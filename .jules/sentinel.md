## 2024-05-22 - Prevent Sensitive AI Prompt Logging
**Vulnerability:** Information Leakage via Logs.
**Learning:** The application was logging full AI prompts (including user terminal context) and responses to stdout/stderr. In production, these logs could be persisted to insecure files or viewed by unauthorized users, exposing sensitive data (keys, passwords, PII) contained in the terminal context.
**Prevention:** Avoid using `println!` or `log::info!` for sensitive data payload (requests/responses). Use `log::debug!` only if necessary and ensure debug logs are disabled in production. Validate data serialization without logging the result.
