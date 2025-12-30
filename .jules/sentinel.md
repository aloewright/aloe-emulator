## 2025-12-30 - XSS in Markdown Preview
**Vulnerability:** The `renderMarkdown` function in `FilePreviewModal.vue` used simple regex replacements without escaping input HTML, allowing XSS via malicious markdown files (e.g., `<img src=x onerror=alert(1)>`).
**Learning:** Even simple text processing features can introduce high-severity vulnerabilities if input is not sanitized. Regex-based parsers are notoriously difficult to secure against XSS.
**Prevention:** Always escape user input before applying regex-based formatting, or use a mature library with built-in sanitization. In this case, I implemented a custom HTML escaper before the regex replacements to neutralize HTML injection while preserving the markdown formatting logic.
