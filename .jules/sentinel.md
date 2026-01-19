# Sentinel Journal

## 2026-01-19 - AI Prompt Leakage in Logs
**Vulnerability:** User prompts, system prompts, and AI responses were being logged to stdout using `println!`.
**Learning:** Developers often add logging for debugging purposes during development but forget to remove it before production. In AI applications, prompts often contain sensitive user data (PII, secrets, etc.).
**Prevention:** Establish a strict policy against logging raw user input or full AI responses in production code. Use a logging library with different levels (debug vs info) and ensure sensitive data is redacted or only logged at 'trace' level which is disabled by default.
