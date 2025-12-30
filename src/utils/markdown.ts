export function renderMarkdown(md: string): string {
  // 1. HTML Escape Helper
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Escape the entire input first to prevent HTML injection
  let escaped = escapeHtml(md);

  // 2. Regex Replacements
  // Note: Since we escaped < and >, we don't need to worry about existing tags in input.
  // The regex replacements will add SAFE tags.

  let html = escaped
    .replaceAll(/^### (.*$)/gim, "<h3>$1</h3>")
    .replaceAll(/^## (.*$)/gim, "<h2>$1</h2>")
    .replaceAll(/^# (.*$)/gim, "<h1>$1</h1>")
    .replaceAll(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replaceAll(/__(.*?)__/gim, "<strong>$1</strong>")
    .replaceAll(/\*(.*?)\*/gim, "<em>$1</em>")
    .replaceAll(/_(.*?)_/gim, "<em>$1</em>")
    .replaceAll(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
    .replaceAll(/`(.*?)`/gim, "<code>$1</code>")
    .replaceAll(
      /\[([^\]]{1,1000})\]\(([^)]{1,1000})\)/gim,
      (match, text, url) => {
        // 3. URL Validation
        // Unescape the URL because it was escaped at the beginning, but we need to check the protocol
        // Wait, if I escaped everything, then `javascript:alert(1)` is still `javascript:alert(1)` (no special chars).
        // But if it had special chars like `javascript:alert('x')`, it would be `javascript:alert(&#039;x&#039;)`.

        // Basic check for dangerous protocols
        // We allow http, https, ftp, mailto, and relative paths (starting with / or . or just alphanumeric)
        // We reject javascript:, data:, vbscript:

        // Decoding HTML entities might be needed if the URL contained & encoded chars,
        // but for safety, let's just check the string as is.
        // If the user provided `javascript:`, it is still `javascript:` in `url`.

        const lowerUrl = url.toLowerCase().trim();
        if (
          lowerUrl.startsWith("javascript:") ||
          lowerUrl.startsWith("data:") ||
          lowerUrl.startsWith("vbscript:")
        ) {
          // unsafe URL, render as text or #
          return `<a href="#" title="Unsafe URL blocked">${text}</a>`;
        }

        // We return the URL as is (it is already HTML escaped from step 1,
        // so it shouldn't break out of quotes)
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${text}</a>`;
      },
    )
    .replaceAll(/\n\n/gim, "</p><p>")
    .replaceAll(/\n/gim, "<br>");

  return `<p>${html}</p>`;
}
