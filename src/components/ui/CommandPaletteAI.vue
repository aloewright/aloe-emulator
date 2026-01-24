<template>
  <Modal
    id="ai-palette"
    :visible="false"
    :show-close-button="false"
    size="lg"
    class="ai-palette-modal"
  >
    <div class="flex flex-col h-[50vh] max-h-[500px]">
      <!-- Header / Input Area -->
      <div
        class="flex items-center px-4 py-3 border-b border-gray-700 bg-gray-900/50 justify-between"
      >
        <div class="flex items-center flex-1 cursor-text" @click="focusInput">
          <Sparkles class="w-5 h-5 text-purple-400 mr-3 animate-pulse" />
          <input
            v-if="!showSettings"
            ref="inputRef"
            v-model="prompt"
            type="text"
            class="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg font-mono"
            placeholder="Ask AI to generate a command..."
            @keydown.enter.prevent="submit"
          />
          <span v-else class="text-lg font-semibold text-gray-200"
            >AI Settings</span
          >
        </div>

        <div class="flex items-center gap-3">
          <div v-if="!showSettings" class="flex items-center gap-2">
            <span v-if="aiStore.isGenerating" class="text-xs text-purple-400"
              >Thinking...</span
            >
            <span
              class="text-xs text-gray-500 px-1.5 py-0.5 rounded border border-gray-700"
              >Enter</span
            >
          </div>

          <button
            @click="toggleSettings"
            class="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            :class="{ 'text-purple-400 bg-gray-800': showSettings }"
            title="Settings"
          >
            <Settings class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div
        v-if="!showSettings"
        class="flex-1 overflow-y-auto p-4 bg-gray-900/30"
      >
        <div
          v-if="aiStore.models.length === 0"
          class="text-red-400 mb-2 text-sm"
        >
          No models found. Check Settings or ensure Ollama is running.
        </div>

        <div
          v-if="aiStore.error"
          class="p-3 bg-red-900/20 text-red-200 rounded border border-red-800 mb-4 text-sm"
        >
          Error: {{ aiStore.error }}
        </div>

        <div v-if="aiStore.suggestions.length > 0" class="space-y-4">
          <div
            v-for="(suggestion, idx) in aiStore.suggestions"
            :key="idx"
            class="group"
          >
            <div class="text-xs text-gray-500 mb-1">Suggestion</div>
            <div class="flex items-center gap-2">
              <div
                class="flex-1 bg-black/50 p-3 rounded font-mono text-green-400 border border-gray-700 group-hover:border-purple-500 transition-colors"
              >
                {{ suggestion }}
              </div>
              <!-- Actions -->
              <div class="flex gap-2">
                <button
                  @click="copyCommand(suggestion)"
                  class="p-3 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                  title="Copy to Clipboard"
                >
                  <Check v-if="copied" class="w-4 h-4 text-green-400" />
                  <Copy v-else class="w-4 h-4" />
                </button>
                <button
                  @click="runCommand(suggestion)"
                  class="p-3 bg-gray-800 hover:bg-green-900/50 rounded text-gray-400 hover:text-green-400 transition-colors"
                  title="Run in Terminal"
                >
                  <Terminal class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="!aiStore.suggestions.length && !aiStore.isGenerating"
          class="text-center text-gray-600 mt-10"
        >
          Type a request like "undo last git commit" or "find all large files"
        </div>
      </div>

      <!-- Settings View -->
      <div
        v-else
        class="flex-1 overflow-y-auto p-6 bg-gray-900/30 text-gray-300"
      >
        <div class="space-y-6">
          <!-- Provider Selection -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-400"
              >AI Provider</label
            >
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="ollama"
                  v-model="selectedProvider"
                  class="accent-purple-500"
                  @change="saveSettings"
                />
                <span>Ollama (Local)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="openrouter"
                  v-model="selectedProvider"
                  class="accent-purple-500"
                  @change="saveSettings"
                />
                <span>OpenRouter (Cloud)</span>
              </label>
            </div>
          </div>

          <!-- OpenRouter Key Input -->
          <div v-if="selectedProvider === 'openrouter'" class="space-y-2">
            <label class="block text-sm font-medium text-gray-400"
              >OpenRouter API Key</label
            >
            <input
              v-model="apiKey"
              type="password"
              class="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
              placeholder="sk-or-..."
              @blur="saveSettings"
              @keydown.enter="saveSettings"
            />
            <p class="text-xs text-gray-500">
              Keys are stored locally. Get a key at
              <a
                href="https://openrouter.ai"
                target="_blank"
                class="text-purple-400 hover:underline"
                >openrouter.ai</a
              >
            </p>
          </div>

          <!-- Model Refresh -->
          <div class="pt-4 border-t border-gray-700">
            <button
              @click="refreshModels"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center gap-2"
            >
              <RefreshCw
                class="w-3 h-3"
                :class="{ 'animate-spin': loadingModels }"
              />
              Refresh Models
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        v-if="!showSettings"
        class="px-4 py-2 border-t border-gray-700 text-xs text-gray-500 flex justify-between items-center bg-gray-900"
      >
        <div class="flex items-center gap-2">
          <span>Model:</span>
          <select
            v-model="aiStore.activeModel"
            class="bg-gray-800 border-none rounded text-xs text-gray-300 max-w-[200px]"
          >
            <option v-for="m in aiStore.models" :key="m" :value="m">
              {{ m }}
            </option>
          </select>
        </div>
        <div>
          {{ aiStore.activeProvider === "ollama" ? "Local" : "Cloud" }}
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import {
  Sparkles,
  Copy,
  Terminal,
  Check,
  Settings,
  RefreshCw,
} from "lucide-vue-next";
import Modal from "./Modal.vue";
import { useAIStore } from "../../stores/ai";
import { useOverlay } from "../../composables/useOverlay";
import { useWorkspaceStore } from "../../stores/workspace";
import { writeToTerminal } from "../../services/terminal";
import { message } from "../../utils/message";

const aiStore = useAIStore();
const workspaceStore = useWorkspaceStore();
const { closeOverlay } = useOverlay();

const inputRef = ref<HTMLInputElement | null>(null);
const prompt = ref("");
const copied = ref(false);
const showSettings = ref(false);
const loadingModels = ref(false);

// Settings local state
const selectedProvider = ref<"ollama" | "openrouter">("ollama");
const apiKey = ref("");

onMounted(async () => {
  await aiStore.init();
  selectedProvider.value = aiStore.activeProvider;
  apiKey.value = aiStore.openRouterKey || "";
});

// Auto focus when visible logic would be handled by the Manager or watch
watch(
  () => inputRef.value,
  (el) => {
    if (el && !showSettings.value) nextTick(() => el.focus());
  },
);

watch(
  () => aiStore.activeProvider,
  (val) => (selectedProvider.value = val),
);

async function submit() {
  if (!prompt.value.trim()) return;
  await aiStore.generateCommand(prompt.value);
}

function focusInput() {
  if (!showSettings.value && inputRef.value) {
    inputRef.value.focus();
  }
}

function toggleSettings() {
  showSettings.value = !showSettings.value;
  if (showSettings.value) {
    // Sync local state when opening
    selectedProvider.value = aiStore.activeProvider;
    apiKey.value = aiStore.openRouterKey || "";
  } else {
    // Focus input when closing
    nextTick(() => inputRef.value?.focus());
  }
}

async function saveSettings() {
  // Save provider
  if (selectedProvider.value !== aiStore.activeProvider) {
    await aiStore.setProvider(selectedProvider.value);
  }

  // Save key if changed
  if (apiKey.value !== aiStore.openRouterKey) {
    await aiStore.setOpenRouterKey(apiKey.value);
  }
}

async function refreshModels() {
  loadingModels.value = true;
  await saveSettings();
  await aiStore.fetchModels();
  loadingModels.value = false;
}

async function copyCommand(cmd: string) {
  await aiStore.copyToClipboard(cmd);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

async function runCommand(cmd: string) {
  // 1. Validate Command
  if (!cmd.trim()) {
    aiStore.error = "Cannot run empty command";
    return;
  }

  // 2. Resolve Active Terminal
  let panel = workspaceStore.findPanelInLayout(workspaceStore.activePanelId);

  // Fallback: If active panel invalid, try to find *any* panel with tabs
  // (This requires exposing a helper or manual traversal, for now we rely on active)

  if (!panel) {
    aiStore.error = `Could not find active panel (ID: ${workspaceStore.activePanelId})`;
    console.error(
      "Run Command Failed: Active panel not found",
      workspaceStore.panelLayout,
    );
    return;
  }

  if (!panel.activeTabId) {
    aiStore.error = "No active terminal tab found in current panel";
    return;
  }

  // 3. Resolve Backend Terminal ID
  const frontendTerminalId = panel.activeTabId;
  const terminalInstance = workspaceStore.terminals.find(
    (t) => t.id === frontendTerminalId,
  );

  if (!terminalInstance || !terminalInstance.backendTerminalId) {
    aiStore.error = `Terminal not ready (Frontend ID: ${frontendTerminalId})`;
    console.error(
      "Run Command Failed: No backend ID for terminal",
      terminalInstance,
    );
    return;
  }

  const terminalId = terminalInstance.backendTerminalId;

  // 4. Execute
  try {
    await writeToTerminal({
      terminalId,
      data: cmd + "\r\n",
    });

    // Debug Feedback
    // eslint-disable-next-line
    console.log(`Executed on terminal ${terminalId}`);
    message.info(`Sent to terminal: ${terminalId.slice(0, 8)}...`);
    closeOverlay("ai-palette");
  } catch (err) {
    console.error("Failed to run command", err);
    const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
    aiStore.error = `Failed to write: ${errorMsg}`;
  }
}
</script>
