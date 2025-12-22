<template>
  <Modal
    id="ai-palette"
    :visible="false"
    :show-close-button="false"
    size="lg"
    class="ai-palette-modal"
  >
    <div class="flex flex-col h-[50vh] max-h-[500px]">
      <!-- Input Area -->
      <div class="flex items-center px-4 py-3 border-b border-gray-700 bg-gray-900/50">
        <Sparkles class="w-5 h-5 text-purple-400 mr-3 animate-pulse" />
        <input
          ref="inputRef"
          v-model="prompt"
          type="text"
          class="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg font-mono"
          placeholder="Ask AI to generate a command..."
          @keydown.enter.prevent="submit"
        />
        <div class="flex items-center gap-2">
           <span v-if="aiStore.isGenerating" class="text-xs text-purple-400">Thinking...</span>
           <span class="text-xs text-gray-500 px-1.5 py-0.5 rounded border border-gray-700">Enter</span>
        </div>
      </div>

      <!-- Results Area -->
      <div class="flex-1 overflow-y-auto p-4 bg-gray-900/30">
        <div v-if="aiStore.models.length === 0" class="text-red-400 mb-2">
           No models found. Make sure Ollama is running.
        </div>
        
        <div v-if="aiStore.error" class="p-3 bg-red-900/20 text-red-200 rounded border border-red-800 mb-4">
          Error: {{ aiStore.error }}
        </div>

        <div v-if="aiStore.suggestions.length > 0" class="space-y-4">
          <div v-for="(suggestion, idx) in aiStore.suggestions" :key="idx" class="group">
             <div class="text-xs text-gray-500 mb-1">Suggestion</div>
             <div class="flex items-center gap-2">
                <div class="flex-1 bg-black/50 p-3 rounded font-mono text-green-400 border border-gray-700 group-hover:border-purple-500 transition-colors">
                   {{ suggestion }}
                </div>
                <!-- TODO: Copy/Run button -->
             </div>
          </div>
        </div>
        
        <div v-if="!aiStore.suggestions.length && !aiStore.isGenerating" class="text-center text-gray-600 mt-10">
           Type a request like "undo last git commit" or "find all large files"
        </div>
      </div>
      
      <!-- Footer -->
       <div class="px-4 py-2 border-t border-gray-700 text-xs text-gray-500 flex justify-between items-center bg-gray-900">
        <div class="flex items-center gap-2">
           <span>Model:</span>
           <select v-model="aiStore.activeModel" class="bg-gray-800 border-none rounded text-xs text-gray-300">
              <option v-for="m in aiStore.models" :key="m" :value="m">{{ m }}</option>
           </select>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import { Sparkles } from "lucide-vue-next";
import Modal from "./Modal.vue";
import { useAIStore } from "../../stores/ai";
import { useOverlay } from "../../composables/useOverlay";

const aiStore = useAIStore();
const { closeOverlay } = useOverlay();

const inputRef = ref<HTMLInputElement | null>(null);
const prompt = ref("");

onMounted(() => {
   aiStore.fetchModels();
});

// Auto focus when visible logic would be handled by the Manager or watch
watch(() => inputRef.value, (el) => {
  if (el) nextTick(() => el.focus());
});

async function submit() {
   if (!prompt.value.trim()) return;
   await aiStore.generateCommand(prompt.value);
}
</script>
