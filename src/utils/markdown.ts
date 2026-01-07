/**
 * Safely renders markdown content to HTML.
 * This function performs HTML escaping BEFORE applying markdown formatting
 * to prevent XSS attacks from malicious markdown content.
 */
export function renderMarkdown(md: string): string {
  if (!md) return "";

  // 1. First, escape all HTML to prevent XSS
  // This ensures that any <script> or other HTML tags in the source
  // are rendered as text, not executed/parsed as HTML.
  let safeMd = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // 2. Then apply formatting
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
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>',
    )
    .replaceAll(/\n\n/gim, "</p><p>")
    .replaceAll(/\n/gim, "<br>");

  return `<p>${html}</p>`;
}
