## 2024-05-22 - Sensitive Data Logging in AI and Terminal Services
**Vulnerability:** The application was logging sensitive data including AI user prompts, system prompts, AI responses, and full request JSONs using `println!` in `src-tauri/src/commands/ai.rs`, `src-tauri/src/ai/ollama_client.rs`, and `src-tauri/src/ai/openrouter_client.rs`. Additionally, debug logs in `src-tauri/src/services/terminal.rs` could potentially leak terminal input/output.
**Learning:** Developers often use `println!` for debugging during development but forget to remove it before production. In Rust/Tauri apps, these logs can end up in the system journal or terminal output if the app is launched from a terminal, exposing sensitive data.
**Prevention:** Strictly prohibit `println!` for any data. `eprintln!` is permitted for error logging only, provided the error message itself does not contain sensitive user data (e.g. use generic error messages or upstream API error codes, but sanitize input reflection). Use a proper logging library with log levels for better control in the future.

## 2025-05-23 - Command Injection via Environment Variables
**Vulnerability:** SSH environment variables were being injected into the shell command without validating the keys. While values were escaped, malicious keys (e.g., `VAR=val; command`) could lead to arbitrary command execution.
**Learning:** Shell command construction from user inputs is always risky. Even if you escape values, keys/identifiers must also be validated or strictly sanitized.
**Prevention:** Always validate environment variable names against a strict whitelist (e.g., alphanumeric and underscores only) before using them in shell commands.
