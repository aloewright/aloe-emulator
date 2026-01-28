# Sentinel Journal

## 2026-01-28 - Systematic Host Key Verification Bypass
**Vulnerability:** The codebase systematically disables SSH host key verification by returning `Ok(true)` in `check_server_key` across multiple modules (`ssh.rs`, `tunnel.rs`, `history.rs`, `sftp/service.rs`).
**Learning:** This likely exists to avoid implementing a complex `known_hosts` management system and UI for user verification, but it exposes users to Man-in-the-Middle (MitM) attacks.
**Prevention:** Implement a `known_hosts` storage mechanism and prompt users to verify new/changed keys. Do not unconditionally return `true` in `check_server_key`.

## 2026-01-28 - Sensitive Data Leakage via Debug Logging
**Vulnerability:** `println!` is used extensively in AI command handlers and clients (`ai.rs`, `ollama_client.rs`, `openrouter_client.rs`) to log full request/response bodies, including user prompts and AI responses.
**Learning:** Debug logging was likely left in production code during development.
**Prevention:** Use a proper logging framework (e.g., `log` or `tracing`) with log levels, and ensure sensitive data is redacted or not logged at info/error levels in production. Remove `println!` statements used for debugging.
