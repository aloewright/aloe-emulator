## 2024-02-14 - Stored XSS in Markdown Preview
**Vulnerability:** A stored XSS vulnerability was found in the markdown preview feature of `FilePreviewModal.vue`. The component used a simple regex replacement to render markdown, which did not escape HTML tags. This allowed arbitrary JavaScript execution if a malicious markdown file was previewed (e.g., `<script>alert('xss')</script>`).
**Learning:** Regex-based markdown rendering is often insecure if it doesn't explicitly handle HTML escaping first. The vulnerability existed because the component implemented its own ad-hoc rendering logic instead of using a centralized, secure utility or a dedicated library.
**Prevention:**
1.  Always sanitize or escape HTML before rendering user-provided content, especially when implementing custom rendering logic.
2.  Centralize security-critical logic (like markdown rendering) in a single utility file to ensure consistent application of security best practices.
3.  Use established libraries for complex formats like Markdown when possible, or rigorously test custom implementations against known attack vectors.
