export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function renderMarkdown(md: string): string {
  // First escape HTML to prevent XSS (this will escape <script> to &lt;script&gt;)
  const escaped = escapeHtml(md);

  // Then apply Markdown formatting on the escaped text
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
    // Safe link replacement: checks protocol
    .replace(
      /\[([^\]]{1,1000})\]\(([^)]{1,1000})\)/gim,
      (match: string, text: string, url: string) => {
        // Allow relative paths (starting with / or .) and safe protocols
        if (
          url.startsWith("/") ||
          url.startsWith(".") ||
          /^(https?|mailto|ftp):\/\//i.test(url)
        ) {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${text}</a>`;
        }
        // If protocol is unsafe (e.g. javascript:), render as text or #
        return text;
      },
    )
    .replaceAll(/\n\n/gim, "</p><p>")
    .replaceAll(/\n/gim, "<br>");

  return `<p>${html}</p>`;
}
