import { renderMarkdown } from "./markdown";
import { describe, it, expect } from "vitest";

describe("renderMarkdown", () => {
  it("should render headers correctly", () => {
    expect(renderMarkdown("# Header 1")).toContain("<h1>Header 1</h1>");
    expect(renderMarkdown("## Header 2")).toContain("<h2>Header 2</h2>");
    expect(renderMarkdown("### Header 3")).toContain("<h3>Header 3</h3>");
  });

  it("should render bold and italic correctly", () => {
    expect(renderMarkdown("**bold**")).toContain("<strong>bold</strong>");
    expect(renderMarkdown("*italic*")).toContain("<em>italic</em>");
  });

  it("should render links correctly", () => {
    expect(renderMarkdown("[link](https://example.com)")).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">link</a>',
    );
  });

  it("should PREVENT XSS (demonstration)", () => {
    const xssPayload = "<img src=x onerror=alert(1)>";
    const output = renderMarkdown(xssPayload);
    // Should NOT contain the raw HTML tag
    expect(output).not.toContain("<img src=x onerror=alert(1)>");
    // Should contain escaped version
    expect(output).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("should PREVENT XSS in links", () => {
    const xssPayload = "[link](javascript:alert(1))";
    const output = renderMarkdown(xssPayload);
    // Should NOT contain the javascript: link
    expect(output).not.toContain('href="javascript:alert(1)"');
    // Should contain blocked link
    expect(output).toContain('href="#"');
  });

  it("should allow benign relative links", () => {
    const payload = "[link](/some/path)";
    const output = renderMarkdown(payload);
    expect(output).toContain('href="/some/path"');
  });
});
