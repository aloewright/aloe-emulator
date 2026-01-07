import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("should escape HTML tags to prevent XSS", () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const output = renderMarkdown(maliciousInput);

    expect(output).toContain(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
    expect(output).not.toContain("<script>");
  });

  it("should render headers correctly", () => {
    const input = "# Header 1\n## Header 2\n### Header 3";
    const output = renderMarkdown(input);

    expect(output).toContain("<h1>Header 1</h1>");
    expect(output).toContain("<h2>Header 2</h2>");
    expect(output).toContain("<h3>Header 3</h3>");
  });

  it("should render bold text", () => {
    const input = "**bold** and __bold__";
    const output = renderMarkdown(input);

    expect(output).toContain("<strong>bold</strong>");
    expect(output).toMatch(/<strong>bold<\/strong>.*<strong>bold<\/strong>/);
  });

  it("should render italic text", () => {
    const input = "*italic* and _italic_";
    const output = renderMarkdown(input);

    expect(output).toContain("<em>italic</em>");
    expect(output).toMatch(/<em>italic<\/em>.*<em>italic<\/em>/);
  });

  it("should render code blocks", () => {
    const input = "```\nconst x = 1;\n```";
    const output = renderMarkdown(input);

    expect(output).toContain("<pre><code>");
    expect(output).toContain("const x = 1;");
    expect(output).toContain("</code></pre>");
  });

  it("should render inline code", () => {
    const input = "`code`";
    const output = renderMarkdown(input);

    expect(output).toContain("<code>code</code>");
  });

  it("should render links", () => {
    const input = "[Link](https://example.com)";
    const output = renderMarkdown(input);

    expect(output).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">Link</a>',
    );
  });

  it("should handle multiple newlines", () => {
    const input = "Line 1\n\nLine 2";
    const output = renderMarkdown(input);

    expect(output).toContain("</p><p>");
  });
});
