## 2026-01-14 - Sensitive Information Leakage in AI Logs

**Vulnerability:** The AI command handler (`src-tauri/src/commands/ai.rs`) was logging full user prompts and AI responses to stdout.
**Learning:** This likely existed to debug AI responses during development, but it poses a significant risk in production where prompts may contain secrets (API keys, passwords, code).
**Prevention:** Remove debug logging of sensitive data before merging. Use a proper logging framework with configurable log levels (e.g., `debug!`, `info!`) instead of `println!`, and ensure sensitive data is redacted or only logged at `trace` level in non-production builds.
