## 2024-05-23 - [Sensitive AI Data Logging]
**Vulnerability:** The application was logging full user prompts, system prompts, and AI responses to `stdout` via `println!` in `src-tauri/src/commands/ai.rs`, `src-tauri/src/ai/ollama_client.rs`, and `src-tauri/src/ai/openrouter_client.rs`.
**Learning:** Developers often add debug prints during development and forget to remove them or wrap them in debug-only guards. In AI applications, prompts and responses can contain highly sensitive information (secrets, code, PII).
**Prevention:**
1.  Avoid `println!` for logging. Use a proper logging facade (like `log` or `tracing`) that can be configured to suppress logs in production.
2.  If `println!` is used for quick debugging, always review `git diff` for new `println!` statements before committing.
3.  Treat AI inputs and outputs as sensitive data, similar to passwords or API keys. Do not log them in cleartext.
