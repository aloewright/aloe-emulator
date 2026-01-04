export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderMarkdown(md: string): string {
  // First, escape HTML to prevent XSS
  const safeMd = escapeHtml(md);

  // Then apply markdown formatting
  let html = safeMd
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
        // Basic URL sanitization: allow http, https, mailto, tel
        // Disallow javascript: and others
        if (
          url.trim().toLowerCase().startsWith("javascript:") ||
          url.trim().toLowerCase().startsWith("data:")
        ) {
          return text; // Return just text if unsafe URL
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${text}</a>`;
      },
    )
    .replaceAll(/\n\n/gim, "</p><p>")
    .replaceAll(/\n/gim, "<br>");

  return `<p>${html}</p>`;
}
