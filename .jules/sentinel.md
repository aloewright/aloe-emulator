## 2024-05-23 - SSH Command Injection via Profile Data
**Vulnerability:** SSH terminal profiles allowed command injection via `working_dir` and `env` keys because they were interpolated into a shell command string without proper escaping.
**Learning:** Even data that seems like configuration (metadata) must be treated as untrusted input when used to construct shell commands, especially when it can be imported or shared.
**Prevention:** Always use safe quoting/escaping functions (like `shell-words` or custom implementations) when constructing shell commands from strings. Validate keys/identifiers strictly.
