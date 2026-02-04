## 2025-02-18 - Pervasive logging of sensitive AI data
**Vulnerability:** The backend was logging full AI prompts (including user input and system context) and responses to stdout via `println!`.
**Learning:** Developers often add debug logs during development to trace AI interactions but fail to recognize that these logs persist in production and can leak sensitive user data or internal system details.
**Prevention:**
1. Establish a strict "no sensitive data in logs" policy.
2. Use structured logging with automatic redaction for known sensitive fields.
3. Explicitly audit logging statements in AI-related code during code reviews.
