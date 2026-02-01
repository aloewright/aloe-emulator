## 2024-05-23 - Sensitive Data Leakage in AI Logs
**Vulnerability:** Full AI prompts (containing user context) and responses were being logged to stdout via `println!`.
**Learning:** Developers often add verbose logging for debugging AI responses but forget to remove it or use a proper log level before production.
**Prevention:** Use a logging library (like `log` or `tracing`) with configurable levels. Never log full request/response bodies in production, especially for AI features handling user data.
