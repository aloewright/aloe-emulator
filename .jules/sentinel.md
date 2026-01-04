## 2024-05-23 - [Critical XSS in Markdown Preview]
**Vulnerability:** The SFTP file previewer used a custom regex-based markdown parser that did not sanitize HTML input. This allowed attackers to inject malicious scripts (XSS) via file content (e.g., `<script>`) or unsafe links (e.g., `javascript:`).
**Learning:** Custom parsing of unsafe content formats like Markdown is risky. Always assume input contains malicious HTML. Regex-based parsers are often insufficient for security.
**Prevention:**
1. Always escape HTML characters (`<`, `>`, `&`, `"`, `'`) *before* applying formatting regexes if not using a security-aware library.
2. When parsing links, validate the protocol (allow `http`, `https`; deny `javascript`).
3. Prefer established, secure libraries (like `dompurify` + `marked`) over custom implementations for complex formats.
