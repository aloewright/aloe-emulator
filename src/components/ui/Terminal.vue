<template>
  <div
    class="w-full h-full bg-bg-secondary terminal-container relative flex flex-col"
  >
    <!-- Main terminal area which contains the xterm instance and overlays -->
    <div class="flex-1 relative overflow-hidden">
      <!-- This is the dedicated element for xterm.js to attach to -->
      <div ref="terminalRef" class="w-full h-full"></div>

      <!-- Latency Badge -->
      <div
        v-if="
          currentTerminal?.latency !== undefined &&
          !isConnecting &&
          !showDisconnectedOverlay &&
          !showErrorOverlay
        "
        class="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1.5 border border-white/10"
      >
        <Wifi :size="14" :class="getLatencyColor(currentTerminal.latency)" />
        <span
          class="text-xs font-mono"
          :class="getLatencyColor(currentTerminal.latency)"
        >
          {{ currentTerminal.latency }}ms
        </span>
      </div>

      <!-- Overlays now correctly positioned over the terminal area -->
      <div
        v-if="isConnecting"
        class="absolute inset-0 bg-bg-secondary/95 flex items-center justify-center z-50"
      >
        <!-- Connection overlay content... -->
      </div>
      <div
        v-if="showDisconnectedOverlay"
        class="absolute inset-0 bg-bg-secondary/95 flex items-center justify-center z-50"
      >
        <!-- Disconnect overlay content... -->
      </div>
      <div
        v-if="showErrorOverlay"
        class="absolute inset-0 bg-bg-secondary/95 flex items-center justify-center z-50"
      >
        <!-- Error overlay content... -->
      </div>
    </div>

    <!-- History Search Modal -->
    <HistorySearchModal />

    <!-- Inline AI Suggestion is now a sibling in the flex layout -->
    <div ref="suggestionBoxRef">
      <InlineAISuggestion
        :suggestion="aiStore.inlineSuggestion"
        :mode="inlineAIMode"
        @dismiss="handleDismissSuggestion"
        @action="handleSuggestionAction"
        @feedback="handleSuggestionFeedback"
        @generate-command="handleGenerateCommand"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
  nextTick,
  onBeforeUnmount,
  watch,
  computed,
} from "vue";
import { debounce } from "../../utils/helpers";
import { TerminalBufferManager, InputBatcher } from "../../core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useWorkspaceStore } from "../../stores/workspace";
import { Wifi } from "lucide-vue-next";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";
import HistorySearchModal from "../history/HistorySearchModal.vue";
import InlineAISuggestion from "../ai/InlineAISuggestion.vue";
import { getTerminalTheme } from "../../utils/terminalTheme";
import type { SimpleTerminal } from "../../core";
import {
  aiContextAnalyzer,
  type AIAction,
} from "../../services/aiContextAnalyzer";
import { useSettingsStore } from "../../stores/settings";
import { useAIStore } from "../../stores/ai";
import { writeToTerminal } from "../../services/terminal";

import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

import { FitAddon } from "@xterm/addon-fit";
import { SearchAddon } from "@xterm/addon-search";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import { WebglAddon } from "@xterm/addon-webgl";

interface TerminalProps {
  terminalId?: string;
  backendTerminalId?: string;
  isVisible?: boolean;
  isConnecting?: boolean;
}

const props = withDefaults(defineProps<TerminalProps>(), {
  terminalId: "default",
  backendTerminalId: "",
  isVisible: true,
  isConnecting: false,
});

const emit = defineEmits<{
  "terminal-ready": [terminalId: string];
  "terminal-output": [terminalId: string, data: string];
}>();

const terminalRef = ref<HTMLElement | null>(null);
let term: Terminal;
let fitAddon: FitAddon;

const workspaceStore = useWorkspaceStore();
const settingsStore = useSettingsStore();
const aiStore = useAIStore();

const currentTerminal = computed(() =>
  workspaceStore.terminals.find((t) => t.id === props.terminalId),
);

const showDisconnectedOverlay = computed(
  () =>
    (currentTerminal.value?.disconnectReason === "connection-lost" ||
      currentTerminal.value?.disconnectReason === "server-disconnect" ||
      currentTerminal.value?.disconnectReason === "connection-error") &&
    !currentTerminal.value?.hasError,
);

const disconnectMessage = computed(() => {
  switch (currentTerminal.value?.disconnectReason) {
    case "server-disconnect":
      return {
        title: "Server Disconnected",
        message: "The server has closed the connection",
      };
    case "connection-error":
      return {
        title: "Connection Error",
        message: "Connection timeout - No response from server",
      };
    case "connection-lost":
    default:
      return {
        title: "Connection Lost",
        message: "The terminal connection was unexpectedly closed",
      };
  }
});

const showErrorOverlay = computed(
  () =>
    currentTerminal.value?.hasError &&
    currentTerminal.value?.errorMessage &&
    !props.isConnecting,
);

const suggestionBoxRef = ref<HTMLElement | null>(null);
const inlineAIMode = ref<"suggestion" | "input">("suggestion");

watch(
  () => aiStore.inlineSuggestion,
  (suggestion) => {
    // When the suggestion box appears or disappears, we need to resize the terminal
    nextTick(() => {
      handleResize();
    });
  },
);

const canReconnect = computed(
  () =>
    currentTerminal.value?.canReconnect && currentTerminal.value?.sshProfileId,
);

const getLatencyColor = (latency: number) => {
  if (latency < 100) return "text-green-400";
  if (latency < 300) return "text-yellow-400";
  return "text-red-400";
};

const handleReconnect = () => {
  if (currentTerminal.value?.sshProfileId) {
    if (currentTerminal.value.hasError) {
      clearTerminal();
    }
    workspaceStore.reconnectSSH(
      props.terminalId,
      currentTerminal.value.sshProfileId,
    );
  }
};

const bufferManager = TerminalBufferManager.getInstance();

const inputBatcher = InputBatcher.getInstance();

const handleTerminalInput = (data: string): void => {
  if (!props.backendTerminalId) return;

  try {
    inputBatcher.batchInput(props.backendTerminalId, data);
  } catch (error) {
    console.error("Failed to batch input for terminal:", error);
  }
};

const handleTerminalResize = async (): Promise<void> => {
  if (!fitAddon || !props.backendTerminalId) return;

  try {
    const dimensions = fitAddon.proposeDimensions();
    if (dimensions) {
      await workspaceStore.resizeTerminal({
        terminalId: props.backendTerminalId,
        cols: dimensions.cols,
        rows: dimensions.rows,
      });
    }
  } catch (error) {
    console.error("Failed to resize terminal:", error);
  }
};

const handleResize = debounce(async () => {
  if (fitAddon && props.isVisible) {
    fitAddon.fit();
    await handleTerminalResize();
  }
}, 100);

const focus = (): void => {
  if (term) {
    term.focus();
  }
};

const fitAndFocus = debounce((): void => {
  if (fitAddon && term && props.isVisible) {
    fitAddon.fit();
    term.focus();
    handleTerminalResize();
  }
}, 50);

const writeOutput = (data: string): void => {
  if (term) {
    try {
      term.write(data);

      if (props.backendTerminalId) {
        bufferManager.saveToLocalBuffer(props.backendTerminalId, data);
      }

      // Offload analysis to Web Worker
      if (aiStore.inlineEnabled && aiWorker) {
        aiAnalysisBuffer += data;
        // Optimization: flush immediately if buffer gets too large to prevent data loss or memory spikes
        if (aiAnalysisBuffer.length > AI_BUFFER_LIMIT) {
          debouncedAnalyze.cancel();
          flushAiAnalysis();
        } else {
          debouncedAnalyze();
        }
      }
    } catch (error) {
      console.error(`Error in writeOutput for ${props.terminalId}:`, error);
    }
  }
};

// Web Worker for AI analysis
let aiWorker: Worker | null = null;
let aiAnalysisBuffer = "";
const AI_BUFFER_LIMIT = 5000;

const flushAiAnalysis = () => {
  if (aiWorker && aiAnalysisBuffer) {
    try {
      aiWorker.postMessage({ type: "analyze", data: aiAnalysisBuffer });
      aiAnalysisBuffer = "";
    } catch (err) {
      console.error("[Terminal] Failed to post message to AI Worker:", err);
    }
  }
};

const debouncedAnalyze = debounce(flushAiAnalysis, 300); // 300ms debounce

const restoreBuffer = async (): Promise<boolean> => {
  if (!term || !props.backendTerminalId) return false;

  try {
    const simpleTerminal: SimpleTerminal = {
      clear: () => term.clear(),
      write: (data: string) => term.write(data),
    };
    return await bufferManager.restoreBuffer(
      props.backendTerminalId,
      simpleTerminal,
    );
  } catch (error) {
    console.error("Failed to restore buffer:", error);
    return false;
  }
};

const clearTerminal = async (): Promise<void> => {
  if (term) {
    term.clear();
  }

  if (props.backendTerminalId) {
    bufferManager.clearLocalBuffer(props.backendTerminalId);
  }
};

watch(
  () => props.isVisible,
  (newVisible) => {
    if (newVisible && term && fitAddon) {
      nextTick(() => {
        fitAndFocus();
      });
    }
  },
);

watch(
  () => settingsStore.terminalTheme,
  (newTheme) => {
    if (term) {
      const customTheme = settingsStore.getCustomTheme(newTheme);
      const theme = customTheme
        ? customTheme.colors
        : getTerminalTheme(newTheme as any);
      term.options.theme = theme;
    }
  },
);

watch(
  () => settingsStore.fontFamily,
  (newFont) => {
    if (term) {
      term.options.fontFamily = `'${newFont}', monospace`;
      fitAddon.fit();
    }
  },
);

watch(
  () => settingsStore.fontSize,
  (newSize) => {
    if (term) {
      term.options.fontSize = newSize;
      fitAddon.fit();
    }
  },
);

// Inline AI suggestion handlers
const handleDismissSuggestion = () => {
  aiStore.dismissInlineSuggestion();
  inlineAIMode.value = "suggestion"; // Reset mode
  aiContextAnalyzer.resetCooldown();
};

const handleSuggestionAction = async (action: AIAction, execute: boolean) => {
  if (action.type === "command" && action.command && props.backendTerminalId) {
    try {
      const command = action.command + (execute ? "\\r\\n" : "");
      await writeToTerminal({
        terminalId: props.backendTerminalId,
        data: command,
      });
    } catch (error) {
      console.error("Failed to execute action command:", error);
    }
  }
  // Dismiss after action
  aiStore.dismissInlineSuggestion();
  inlineAIMode.value = "suggestion";
};

const handleSuggestionFeedback = (type: "positive" | "negative") => {
  if (aiStore.inlineSuggestion) {
    aiStore.sendFeedback(aiStore.inlineSuggestion.id, type);
  }
};

const handleGenerateCommand = async (prompt: string) => {
  // We can use the existing command palette generation logic
  await aiStore.generateCommand(prompt);
  // The command palette will show the result, so we just dismiss the inline input
  handleDismissSuggestion();
};

// Global shortcut for Cmd+I
const handleManualAIInput = () => {
  console.log("Cmd+I pressed. Toggling AI input."); // DEBUG
  if (aiStore.inlineEnabled) {
    if (inlineAIMode.value === "input") {
      // If already in input mode, dismiss it
      handleDismissSuggestion();
    } else {
      aiStore.dismissInlineSuggestion(); // Clear any existing suggestion
      inlineAIMode.value = "input";
      // Use a minimal suggestion object to trigger the v-if
      aiStore.setInlineSuggestion({
        id: "manual-input",
        title: "Ask AI",
        message: "",
        actions: [],
        timestamp: Date.now(),
        context: { type: "general" },
        dismissable: true,
      });
    }
  }
};

defineExpose({
  focus,
  fitAndFocus,
  writeOutput,
  restoreBuffer,
  clearTerminal,
});

onMounted(async () => {
  console.log(`[Debug] Terminal component mounted for ID: ${props.terminalId}`);
  if (!terminalRef.value) {
    console.error("[Debug] terminalRef is not available on mount!");
    return;
  }

  const customTheme = settingsStore.getCustomTheme(settingsStore.terminalTheme);
  const theme = customTheme
    ? customTheme.colors
    : getTerminalTheme(settingsStore.terminalTheme as any);

  term = new Terminal({
    allowProposedApi: true,
    allowTransparency: false,
    rightClickSelectsWord: true,
    altClickMovesCursor: true,
    scrollback: 10000,
    customGlyphs: true,
    cursorBlink: true,
    cols: 110,
    rows: 30,
    fontFamily: `'${settingsStore.fontFamily}', monospace`,
    fontSize: settingsStore.fontSize,
    theme: theme,
  });

  const webglAddon = new WebglAddon();
  term.loadAddon(webglAddon);

  fitAddon = new FitAddon();
  term.loadAddon(fitAddon);

  const webLinksAddon = new WebLinksAddon(
    async (event: MouseEvent, uri: string) => {
      event.preventDefault();
      try {
        await openUrl(uri);
      } catch (error) {
        console.warn(
          "Failed to open link with Tauri opener, falling back to window.open:",
          error,
        );
        window.open(uri, "_blank");
      }
    },
  );
  term.loadAddon(webLinksAddon);

  const searchAddon = new SearchAddon();
  term.loadAddon(searchAddon);

  const unicode11Addon = new Unicode11Addon();
  term.loadAddon(unicode11Addon);
  term.unicode.activeVersion = "11";

  term.open(terminalRef.value);

  term.onSelectionChange(async () => {
    if (term.hasSelection()) {
      const selectedText = term.getSelection();
      await writeText(selectedText);
    }
  });

  term.attachCustomKeyEventHandler((arg: KeyboardEvent): boolean => {
    // Handle Ctrl+Shift+V / Cmd+Shift+V for paste (terminal-specific, always enabled)
    if (
      (arg.ctrlKey || arg.metaKey) &&
      arg.shiftKey &&
      arg.key === "v" &&
      arg.type === "keydown"
    ) {
      (async () => {
        const clipboardText = await readText();
        if (clipboardText) {
          term.write(clipboardText);
        }
      })();
      return false;
    }

    // Handle Cmd+I for inline AI input
    if (
      (arg.metaKey || arg.ctrlKey) &&
      arg.key === "i" &&
      arg.type === "keydown"
    ) {
      arg.preventDefault();
      handleManualAIInput();
      return false;
    }

    // History search is now handled by global shortcuts manager
    // No need to handle it here anymore

    return true;
  });

  term.onData(async (data) => {
    handleTerminalInput(data);
  });

  await nextTick();

  emit("terminal-ready", props.terminalId || "default");

  window.addEventListener("resize", handleResize);

  // Initialize AI Worker
  if (window.Worker) {
    try {
      aiWorker = new Worker(
        new URL("../../workers/ai.worker.ts", import.meta.url),
        { type: "module" },
      );

      aiWorker.onerror = (err) => {
        console.error("[Terminal] AI Worker error:", err);
      };

      aiWorker.onmessage = (e) => {
        if (!e || !e.data || typeof e.data.type !== "string") {
          console.warn("[Terminal] Received invalid message from AI worker");
          return;
        }

        const { type, payload } = e.data;
        switch (type) {
          case "suggestion":
            inlineAIMode.value = "suggestion";
            aiStore.setInlineSuggestion(payload);
            break;
          case "server-url":
            aiStore.setLivePreviewUrl(payload);
            break;
          case "error":
            console.error("[Terminal] AI Worker reported error:", payload);
            break;
          default:
          // Ignore unknown types
        }
      };
    } catch (err) {
      console.error("Failed to initialize AI Worker:", err);
    }
  }

  handleResize();
});

onBeforeUnmount(async () => {
  window.removeEventListener("resize", handleResize);

  if (props.backendTerminalId) {
    try {
      await inputBatcher.flushInput(props.backendTerminalId);
    } catch (error) {
      console.error("Failed to flush input during cleanup:", error);
    }

    inputBatcher.clearTerminal(props.backendTerminalId);
  }

  if (term) {
    term.dispose();
  }

  // Cancel any pending AI analysis
  debouncedAnalyze.cancel();

  if (aiWorker) {
    aiWorker.terminate();
    aiWorker = null;
  }
});
</script>

<style scoped>
/* Terminal cursor blink enhancement */
:deep(.xterm-cursor) {
  animation: terminalCursor 1s infinite;
}

@keyframes terminalCursor {
  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

/* Context menu styles */
:deep(.terminal-context-menu) {
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 4px 0;
  min-width: 120px;
  z-index: 1000;
}

:deep(.terminal-context-menu-item) {
  padding: 8px 12px;
  font-size: 13px;
  color: #d4d4d4;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

:deep(.terminal-context-menu-item:hover) {
  background-color: #404040;
}

:deep(.terminal-context-menu-item:active) {
  background-color: #505050;
}

/* Terminal selection styling */
:deep(.xterm-selection) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

/* Ensure terminal text is selectable */
:deep(.xterm-screen) {
  user-select: text;
}
</style>
