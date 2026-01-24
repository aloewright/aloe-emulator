## 2024-05-23 - Sensitive Data Logging in AI Components
**Vulnerability:** The AI integration components (`ai.rs`, `ollama_client.rs`, `openrouter_client.rs`) were logging raw user prompts, system prompts, and full AI responses to the standard output via `println!`.
**Learning:** AI interactions often contain highly sensitive data (passwords, keys, internal code, PII) in the prompts or responses. Logging them creates a persistent record of this sensitive data which can be accessed by unauthorized parties or processes viewing stdout/logs.
**Prevention:** Treat all AI inputs and outputs as sensitive user data. Use structured logging that omits payload content. Never use `println!` for debugging sensitive flows in production code.
