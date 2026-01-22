## 2025-05-18 - Unsafe Custom Markdown Parser
**Vulnerability:** Found a custom regex-based markdown parser in `FilePreviewModal.vue` that did not escape HTML input or sanitize links, leading to Stored XSS.
**Learning:** Custom parsers for structured data (like Markdown/HTML) are error-prone and often miss security edge cases (like `javascript:` links or HTML injection).
**Prevention:** Always use established, security-audited libraries (like `marked` with `DOMPurify`) or implement strict input escaping before processing if a custom parser is absolutely necessary.
