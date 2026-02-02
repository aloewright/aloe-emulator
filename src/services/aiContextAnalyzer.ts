// src/services/aiContextAnalyzer.ts
// Analyzes terminal output to provide contextual AI suggestions

export interface AIAction {
  id: string;
  label: string;
  icon: string; // lucide icon name
  command?: string;
  type: "command" | "navigate" | "info";
}

export interface AISuggestion {
  id: string;
  title: string;
  message: string;
  actions: AIAction[];
  timestamp: number;
  context: TerminalContext;
  dismissable: boolean;
}

export interface TerminalContext {
  type: "server" | "error" | "git" | "npm" | "build" | "general";
  serverUrl?: string;
  routes?: string[];
  errorType?: string;
  projectType?: "node" | "python" | "rust" | "go" | "unknown";
}

export interface OutputPattern {
  pattern: RegExp;
  type: TerminalContext["type"];
  extractor: (
    match: RegExpMatchArray,
    fullOutput: string,
  ) => Partial<TerminalContext>;
  suggestionGenerator: (context: TerminalContext) => AISuggestion | null;
}

// Common development server patterns
const SERVER_PATTERNS: OutputPattern[] = [
  // Node.js / Vite / Next.js server ready
  {
    pattern:
      /(?:Server|server|App|app)?\s*(?:ready|running|listening|started)\s*(?:at|on)?\s*(https?:\/\/[^\s]+|localhost:\d+)/i,
    type: "server",
    extractor: (match) => ({
      type: "server",
      serverUrl: match[1]?.startsWith("http") ? match[1] : `http://${match[1]}`,
      projectType: "node",
    }),
    suggestionGenerator: (ctx) => ({
      id: `server-${Date.now()}`,
      title: "What's next?",
      message: "Your server is running! Here are some things you can do:",
      timestamp: Date.now(),
      context: ctx,
      dismissable: true,
      actions: [
        {
          id: "logs",
          label: "Open logs",
          icon: "terminal",
          type: "command",
          command: "tail -f logs/*.log",
        },
        { id: "routes", label: "View routes", icon: "lightbulb", type: "info" },
        {
          id: "tests",
          label: "Run tests",
          icon: "refresh-cw",
          type: "command",
          command: "npm test",
        },
        {
          id: "optimize",
          label: "Optimize code",
          icon: "sparkles",
          type: "navigate",
        },
      ],
    }),
  },
  // Express.js specific
  {
    pattern: /listening\s+on\s+port\s+(\d+)/i,
    type: "server",
    extractor: (match) => ({
      type: "server",
      serverUrl: `http://localhost:${match[1]}`,
      projectType: "node",
    }),
    suggestionGenerator: (ctx) => ({
      id: `server-${Date.now()}`,
      title: "What's next?",
      message: "Your server is running! Here are some things you can do:",
      timestamp: Date.now(),
      context: ctx,
      dismissable: true,
      actions: [
        {
          id: "logs",
          label: "Open logs",
          icon: "terminal",
          type: "command",
          command: "tail -f logs/*.log",
        },
        { id: "routes", label: "View routes", icon: "lightbulb", type: "info" },
        {
          id: "tests",
          label: "Run tests",
          icon: "refresh-cw",
          type: "command",
          command: "npm test",
        },
        {
          id: "optimize",
          label: "Optimize code",
          icon: "sparkles",
          type: "navigate",
        },
      ],
    }),
  },
];

// Route extraction patterns
const ROUTE_PATTERNS = [
  /(?:GET|POST|PUT|DELETE|PATCH)\s+([\/\w\-:]+)/gi,
  /Route:\s*([\/\w\-:]+)/gi,
  /→\s*(\/[\/\w\-:]+)/gi,
];

// Error patterns
const ERROR_PATTERNS: OutputPattern[] = [
  {
    pattern: /(?:Error|ERROR|error):\s*(.+)/i,
    type: "error",
    extractor: (match) => ({
      type: "error",
      errorType: match[1]?.slice(0, 100),
    }),
    suggestionGenerator: (ctx) => ({
      id: `error-${Date.now()}`,
      title: "Error Detected",
      message: ctx.errorType || "An error occurred",
      timestamp: Date.now(),
      context: ctx,
      dismissable: true,
      actions: [
        {
          id: "fix",
          label: "Ask AI to fix",
          icon: "sparkles",
          type: "navigate",
        },
        {
          id: "search",
          label: "Search docs",
          icon: "search",
          type: "navigate",
        },
        {
          id: "retry",
          label: "Retry command",
          icon: "refresh-cw",
          type: "command",
        },
      ],
    }),
  },
  {
    pattern: /command not found:\s*(.+)/i,
    type: "error",
    extractor: (match) => ({
      type: "error",
      errorType: `Command not found: ${match[1]}`,
    }),
    suggestionGenerator: (ctx) => ({
      id: `cmd-not-found-${Date.now()}`,
      title: "Command Not Found",
      message: ctx.errorType || "Command not found",
      timestamp: Date.now(),
      context: ctx,
      dismissable: true,
      actions: [
        {
          id: "fix",
          label: "Suggest installation",
          icon: "download",
          type: "navigate",
        },
        { id: "typo", label: "Check for typo", icon: "type", type: "navigate" },
      ],
    }),
  },
  {
    pattern: /no such file or directory/i,
    type: "error",
    extractor: () => ({
      type: "error",
      errorType: "File or directory not found",
    }),
    suggestionGenerator: (ctx) => ({
      id: `no-file-${Date.now()}`,
      title: "File Not Found",
      message: "The specified file or directory does not exist",
      timestamp: Date.now(),
      context: ctx,
      dismissable: true,
      actions: [
        {
          id: "ls",
          label: "List files",
          icon: "list",
          type: "command",
          command: "ls -la",
        },
        {
          id: "create",
          label: "Create file",
          icon: "plus-square",
          type: "navigate",
        },
      ],
    }),
  },
];

// Git patterns
const GIT_PATTERNS: OutputPattern[] = [
  {
    pattern: /Your branch is (ahead|behind)/i,
    type: "git",
    extractor: (match) => ({
      type: "git",
    }),
    suggestionGenerator: () => ({
      id: `git-${Date.now()}`,
      title: "Git Status",
      message: "Your branch is out of sync with remote",
      timestamp: Date.now(),
      context: { type: "git" },
      dismissable: true,
      actions: [
        {
          id: "push",
          label: "Push changes",
          icon: "upload",
          type: "command",
          command: "git push",
        },
        {
          id: "pull",
          label: "Pull changes",
          icon: "download",
          type: "command",
          command: "git pull",
        },
        {
          id: "status",
          label: "View status",
          icon: "git-branch",
          type: "command",
          command: "git status",
        },
      ],
    }),
  },
];

// Singleton instance
const ANSI_REGEX =
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

export class AIContextAnalyzer {
  private outputBuffer: string = "";
  private lastSuggestionTime: number = 0;
  private suggestionCooldown: number = 5000; // 5 seconds between suggestions

  /**
   * Strip ANSI escape codes
   */
  private stripAnsi(str: string): string {
    return str.replace(ANSI_REGEX, "");
  }

  /**
   * Analyze terminal output and return suggestion if pattern matches
   */
  analyzeOutput(output: string): AISuggestion | null {
    // Strip ANSI codes before processing
    const cleanOutput = this.stripAnsi(output);

    // Append to buffer (keep last 5000 chars)
    this.outputBuffer = (this.outputBuffer + cleanOutput).slice(-5000);

    // Rate limit suggestions
    const now = Date.now();
    if (now - this.lastSuggestionTime < this.suggestionCooldown) {
      return null;
    }

    // Check all patterns
    const allPatterns = [
      ...SERVER_PATTERNS,
      ...ERROR_PATTERNS,
      ...GIT_PATTERNS,
    ];

    for (const patternDef of allPatterns) {
      const match = this.outputBuffer.match(patternDef.pattern);
      if (match) {
        const context = patternDef.extractor(match, this.outputBuffer);

        // Extract routes if server context
        if (context.type === "server") {
          context.routes = this.extractRoutes(this.outputBuffer);
        }

        const suggestion = patternDef.suggestionGenerator(
          context as TerminalContext,
        );
        if (suggestion) {
          this.lastSuggestionTime = now;
          // Clear buffer after generating suggestion to avoid duplicates
          this.outputBuffer = "";
          return suggestion;
        }
      }
    }

    return null;
  }

  /**
   * Extract API routes from output
   */
  private extractRoutes(output: string): string[] {
    const routes: Set<string> = new Set();

    for (const pattern of ROUTE_PATTERNS) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(output)) !== null) {
        if (match[1]) {
          routes.add(match[1]);
        }
      }
    }

    return Array.from(routes).slice(0, 10); // Limit to 10 routes
  }

  /**
   * Detect localhost URL from output
   */
  detectServerUrl(output: string): string | null {
    // Strip ANSI before detecting URL
    const cleanOutput = this.stripAnsi(output);
    const urlPattern = /https?:\/\/(?:localhost|127\.0\.0\.1):\d+/i;
    const match = cleanOutput.match(urlPattern);
    return match ? match[0] : null;
  }

  /**
   * Clear the output buffer
   */
  clearBuffer(): void {
    this.outputBuffer = "";
  }

  /**
   * Reset cooldown (for testing or user dismissal)
   */
  resetCooldown(): void {
    this.lastSuggestionTime = 0;
  }
}

export const aiContextAnalyzer = new AIContextAnalyzer();
