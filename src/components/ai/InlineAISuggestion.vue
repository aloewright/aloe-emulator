<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="suggestion || mode === 'input'"
      class="inline-ai-suggestion bg-bg-tertiary/80 backdrop-blur-sm border-y border-gray-700/50 shadow-lg my-1 text-sm"
    >
      <!-- Header -->
      <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-700/30">
        <div class="flex items-center justify-center w-6 h-6 rounded-md bg-purple-500/20">
          <Sparkles class="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div class="flex-1">
          <span v-if="suggestion" class="text-purple-300 font-medium text-sm">{{ suggestion.title }}</span>
          <span v-else class="text-purple-300 font-medium text-sm">Ask AI</span>
        </div>
        <button
          v-if="suggestion?.dismissable || mode === 'input'"
          @click="dismiss"
          class="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content (Suggestion or Input) -->
      <div class="px-3 py-2">
        <p v-if="suggestion" class="text-gray-300 text-sm">{{ suggestion.message }}</p>
        
        <!-- Manual Input Mode -->
        <div v-if="mode === 'input'" class="flex items-center gap-2">
          <input
            ref="inputRef"
            v-model="manualPrompt"
            type="text"
            class="flex-1 bg-black/30 border border-gray-700 rounded px-2 py-1 text-white placeholder-gray-500 text-sm outline-none focus:border-purple-500"
            placeholder="Type your request and press Enter..."
            @keydown.enter.prevent="submitManualPrompt"
          />
          <button @click="submitManualPrompt" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm">
            Generate
          </button>
        </div>

        <!-- Actions List -->
        <div v-if="suggestion" class="mt-2 space-y-1">
          <div
            v-for="action in suggestion.actions"
            :key="action.id"
            class="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded group"
          >
            <div class="flex items-center gap-2">
              <component :is="getIcon(action.icon)" class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-300">{{ action.label }}</span>
            </div>
            <div v-if="action.command" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                 @click="handleAction(action, false)" 
                 class="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600"
                 title="Insert command into terminal"
                >
                 Insert
               </button>
               <button 
                 @click="handleAction(action, true)" 
                 class="px-2 py-1 text-xs rounded bg-purple-600 hover:bg-purple-700 flex items-center gap-1"
                 title="Insert and run command"
                >
                 <Play class="w-3 h-3" />
                 Run
               </button>
            </div>
             <div v-else class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                 @click="handleAction(action, false)" 
                 class="px-2 py-1 text-xs rounded bg-purple-600 hover:bg-purple-700 flex items-center gap-1"
                >
                 Go
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import {
  Sparkles, X, Terminal, Lightbulb,
  RefreshCw, Search, Upload, Download, GitBranch, Play,
  Type, List, PlusSquare
} from "lucide-vue-next";
import type { AISuggestion, AIAction } from "../../services/aiContextAnalyzer";

interface Props {
  suggestion: AISuggestion | null;
  mode: 'suggestion' | 'input'; // New prop to control mode
}

const props = defineProps<Props>();

const emit = defineEmits<{
  dismiss: [];
  action: [action: AIAction, execute: boolean]; // Add execute flag
  feedback: [type: 'positive' | 'negative'];
  'generate-command': [prompt: string];
}>();

const manualPrompt = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

watch(() => props.mode, (newMode) => {
  if (newMode === 'input') {
    nextTick(() => inputRef.value?.focus());
  }
});

const iconMap: Record<string, any> = {
  terminal: Terminal,
  lightbulb: Lightbulb,
  'refresh-cw': RefreshCw,
  sparkles: Sparkles,
  search: Search,
  upload: Upload,
  download: Download,
  'git-branch': GitBranch,
  type: Type,
  list: List,
  'plus-square': PlusSquare,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || Sparkles;
}

function dismiss() {
  emit('dismiss');
}

function handleAction(action: AIAction, execute: boolean) {
  emit('action', action, execute);
}

function submitManualPrompt() {
    if (manualPrompt.value.trim()) {
        emit('generate-command', manualPrompt.value);
        manualPrompt.value = '';
    }
}
</script>

<style scoped>
.inline-ai-suggestion {
  max-width: 100%;
}
</style>
