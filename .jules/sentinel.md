## 2025-05-23 - Command Injection in Rust Grep
**Vulnerability:** Found a command injection vulnerability in `src-tauri/src/services/sftp/service.rs` where user-provided `query` and `path` were interpolated into a `grep` shell command without proper escaping.
**Learning:** Even in type-safe languages like Rust, using `format!` to build shell commands is dangerous. The standard `replace("\"", "\\\"")` is insufficient for shell safety.
**Prevention:** Always use a robust shell escaping method (e.g., POSIX single-quote wrapping) when invoking shell commands, or prefer `std::process::Command` with separate arguments over shell strings. When arguments must be passed to a shell (e.g., via SSH exec), explicit escaping is mandatory.
