import { describe, it, expect } from "vitest";
import { renderMarkdown, escapeHtml } from "./markdown";

describe("Markdown Utils", () => {
  describe("escapeHtml", () => {
    it("escapes special characters", () => {
      expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
      expect(escapeHtml('"quoted"')).toBe("&quot;quoted&quot;");
      expect(escapeHtml("'single'")).toBe("&#039;single&#039;");
      expect(escapeHtml("&")).toBe("&amp;");
    });
  });

  describe("renderMarkdown", () => {
    it("renders headers correctly", () => {
      const input = "# Header 1\n## Header 2";
      const output = renderMarkdown(input);
      expect(output).toContain("<h1>Header 1</h1>");
      expect(output).toContain("<h2>Header 2</h2>");
    });

    it("renders bold and italic correctly", () => {
      const input = "**bold** and *italic*";
      const output = renderMarkdown(input);
      expect(output).toContain("<strong>bold</strong>");
      expect(output).toContain("<em>italic</em>");
    });

    it("renders links correctly with safe protocols", () => {
      const input = "[Google](https://google.com)";
      const output = renderMarkdown(input);
      expect(output).toContain('<a href="https://google.com"');
    });

    it("sanitizes unsafe links (javascript:)", () => {
      const input = "[Click me](javascript:alert(1))";
      const output = renderMarkdown(input);
      // Should NOT contain the link tag with javascript:
      expect(output).not.toContain('href="javascript:alert(1)"');
      // Should just render the text
      expect(output).toContain("Click me");
    });

    it("sanitizes HTML injection", () => {
      const input = "<script>alert(1)</script>";
      const output = renderMarkdown(input);
      expect(output).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
      expect(output).not.toContain("<script>");
    });

    it("handles mixed content safely", () => {
      const input =
        '# Title\n<script>alert("xss")</script>\n[Link](javascript:bad())';
      const output = renderMarkdown(input);
      expect(output).toContain("<h1>Title</h1>");
      expect(output).toContain(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
      );
      expect(output).not.toContain('href="javascript:bad()"');
    });
  });
});
