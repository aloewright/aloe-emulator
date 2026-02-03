## 2025-05-23 - Critical SSH Security Gap
**Vulnerability:** SSH host key verification is completely disabled (`check_server_key` returns `Ok(true)` unconditionally) in `history.rs`, `tunnel.rs`, and likely other SSH-related services.
**Learning:** The application prioritizes ease of connection over security, making it vulnerable to Man-in-the-Middle (MitM) attacks. This seems to be a deliberate architectural choice to avoid managing `known_hosts`.
**Prevention:** Future implementations must implement proper host key verification (checking against `known_hosts` or prompting user) to secure SSH connections.

## 2025-05-23 - Sensitive AI Data Logging
**Vulnerability:** AI clients (`ollama_client.rs`, `openrouter_client.rs`) and commands (`ai.rs`) were logging full request bodies (including user prompts and system prompts) and responses to stdout via `println!`.
**Learning:** Debug logging was left in production code, exposing potentially sensitive user data (terminal history in prompts) and AI responses.
**Prevention:** Strictly review all logging statements in PRs. Use a proper logging framework with log levels, and never log raw request/response bodies containing user data or secrets.
