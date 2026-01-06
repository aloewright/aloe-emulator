
import { describe, it, expect, beforeEach } from 'vitest';
import { AIContextAnalyzer } from '../aiContextAnalyzer';

describe('AIContextAnalyzer', () => {
  let analyzer: AIContextAnalyzer;

  beforeEach(() => {
    // Create new instance for each test to reset buffer
    analyzer = new AIContextAnalyzer();
    // Reset any singleton state if necessary (the class has state)
    analyzer.clearBuffer();
    analyzer.resetCooldown();
  });

  it('detects simple command not found', () => {
    const output = 'zsh: command not found: foo';
    const suggestion = analyzer.analyzeOutput(output);
    expect(suggestion).not.toBeNull();
    expect(suggestion?.context.type).toBe('error');
    expect(suggestion?.context.errorType).toContain('Command not found: foo');
  });

  it('detects command not found with ANSI colors', () => {
    // Simulated output from zsh with syntax highlighting/colors
    // Red color for error
    const output = '\x1b[31mzsh: command not found: bar\x1b[0m';
    const suggestion = analyzer.analyzeOutput(output);
    expect(suggestion).not.toBeNull();
    expect(suggestion?.context.type).toBe('error');
    expect(suggestion?.context.errorType).toContain('Command not found: bar');
  });

  it('detects server start with ANSI colors', () => {
    // Simulated output from a node server
    const output = '\x1b[32m[INFO] Server running at http://localhost:3000\x1b[0m';
    const suggestion = analyzer.analyzeOutput(output);
    expect(suggestion).not.toBeNull();
    expect(suggestion?.context.type).toBe('server');
    expect(suggestion?.context.serverUrl).toBe('http://localhost:3000');
  });

  it('handles accumulated buffer with ANSI', () => {
    analyzer.analyzeOutput('\x1b[31mzsh: ');
    const suggestion = analyzer.analyzeOutput('command not found: baz\x1b[0m\r\n');
    expect(suggestion).not.toBeNull();
    expect(suggestion?.context.errorType).toContain('Command not found: baz');
  });
});
