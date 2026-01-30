# Sentinel's Journal

## 2024-05-24 - Critical SSH Vulnerabilities
**Vulnerability:** SSH Host Key Verification is disabled (`check_server_key` returns `Ok(true)`) in `ssh.rs`, `sftp/service.rs`, `tunnel.rs`, and `history.rs`.
**Learning:** The application unconditionally trusts any SSH server it connects to, making it vulnerable to Man-in-the-Middle (MITM) attacks. This is likely due to the complexity of implementing a "Trust On First Use" (TOFU) UI flow and `known_hosts` management.
**Prevention:** Implement `known_hosts` file management and prompt users when connecting to a new host or when a key changes.

## 2024-05-24 - Command Injection in SFTP Search
**Vulnerability:** The SFTP search function (`src-tauri/src/services/sftp/service.rs`) uses `format!` with double quotes to construct a `grep` command, allowing command injection via `query` (e.g., using `$(...)`).
**Learning:** Double quotes in shell commands allow variable expansion and command substitution. Simple string replacement of double quotes is insufficient escaping.
**Prevention:** Always use single quotes for user input in shell commands and escape single quotes within the input (e.g., replace `'` with `'\''`). Use `grep -e` to prevent argument injection.
