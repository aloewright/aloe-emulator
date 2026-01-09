# Sentinel Journal

This journal records critical security learnings, patterns, and decisions for the Aloe terminal application.

## 2025-02-19 - Initial Security Scan
**Vulnerability:** Found permissive `fs:scope` (`**/*`) in Tauri configuration, allowing full filesystem access to the frontend.
**Learning:** Terminal applications often require broad permissions, but default configuration should be least-privilege where possible.
**Prevention:** Restrict `fs:scope` to user directories or specific paths if possible, though a file manager feature may require broader access.

## 2025-02-19 - Command Injection in Terminal Shell Construction
**Vulnerability:** The `LocalTerminal` implementation constructs a shell command string using `format!("{}; exec {} -l", command, shell)`. If the `shell` parameter contains shell metacharacters (e.g., `;`, `&`, `|`), it could lead to command injection when the `command` is also present.
**Learning:** String interpolation of shell commands is dangerous even when the inputs are expected to be file paths.
**Prevention:** Validate inputs used in shell command construction. Ensure file paths do not contain shell control characters.
