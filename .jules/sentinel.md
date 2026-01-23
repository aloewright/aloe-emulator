## 2025-05-18 - [CRITICAL] Sensitive Data Exposure in Logs
**Vulnerability:** Found `println!` statements logging raw user prompts, system prompts, and AI generated responses in `src-tauri/src/commands/ai.rs` and associated clients.
**Learning:** Developers often use `println!` for debugging during development but fail to remove it before production, leading to leakage of sensitive user data (passwords, keys in prompts) to system logs.
**Prevention:**
1. Use a proper logging library (like `log` or `tracing`) with configurable log levels.
2. Ensure sensitive data (prompts, responses) is never logged at INFO/DEBUG levels in production.
3. Add a CI check or lint rule to flag `println!` usage in production code.
