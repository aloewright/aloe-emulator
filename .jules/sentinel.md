# Sentinel Journal

## 2024-05-24 - Sensitive AI Data Leakage in Logs
**Vulnerability:** User prompts, system prompts, and AI responses were being logged to stdout using `println!` in `src-tauri/src/commands/ai.rs`.
**Learning:** Developers often add debug logging during development and forget to remove it. In an AI context, prompts can contain highly sensitive PII, passwords, or proprietary code.
**Prevention:** Avoid `println!` for data flow. Use a logging framework with configurable levels (e.g., `log` or `tracing`) and ensure production log levels do not capture data payloads. Explicitly review AI/LLM integration points for data leakage.
