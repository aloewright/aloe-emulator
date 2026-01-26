## 2025-02-19 - Sensitive Data Leak via Standard Output
**Vulnerability:** The application was logging full AI prompts (user input) and responses (AI output) to standard output using `println!`.
**Learning:** In backend AI services, developers often use `println!` for debugging during development but fail to remove or disable it in production. This leaks highly sensitive user data (prompts can contain passwords, keys, private code) to logs.
**Prevention:**
1. Avoid `println!` for logging in sensitive contexts. Use a logging library with levels (debug/info/error) and ensure debug logs are disabled in production.
2. Specifically in AI clients, validate JSON serialization using `let _ = serde_json::to_string(&req)?;` but do not assign it to a variable that is then printed.
3. Redact sensitive fields if logging request/response objects is absolutely necessary for errors.