<template>
  <div class="live-preview-panel h-full flex flex-col bg-bg-tertiary border-l border-gray-700">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-bg-secondary">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-200">Live Preview</span>
        <span
          v-if="isLive"
          class="flex items-center gap-1 px-2 py-0.5 bg-green-900/30 border border-green-700/30 rounded-full text-xs text-green-400"
        >
          <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>
      
      <!-- Device Toggle -->
      <div class="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
        <button
          v-for="device in devices"
          :key="device.id"
          @click="activeDevice = device.id"
          class="p-1.5 rounded transition-colors"
          :class="activeDevice === device.id 
            ? 'bg-gray-700 text-white' 
            : 'text-gray-400 hover:text-gray-200'"
          :title="device.label"
        >
          <component :is="device.icon" class="w-4 h-4" />
        </button>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1">
        <button
          @click="refresh"
          class="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
        </button>
        <button
          @click="openExternal"
          class="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="Open in browser"
        >
          <ExternalLink class="w-4 h-4" />
        </button>
        <button
          @click="close"
          class="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="Close preview"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Preview Container -->
    <div class="flex-1 flex items-center justify-center p-4 bg-gray-900/50 overflow-hidden">
      <div
        class="preview-frame bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
        :style="frameStyle"
      >
        <iframe
          v-if="url"
          ref="iframeRef"
          :src="url"
          class="w-full h-full border-0"
          :key="iframeKey"
          @load="onIframeLoad"
          @error="onIframeError"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500"
        >
          <div class="text-center">
            <Globe class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No preview available</p>
            <p class="text-xs text-gray-400 mt-1">Start a dev server to see preview</p>
          </div>
        </div>
      </div>
    </div>

    <!-- URL Bar -->
    <div class="px-4 py-2 border-t border-gray-700 bg-bg-secondary flex items-center gap-2">
      <Lock class="w-3.5 h-3.5 text-gray-500" />
      <span class="text-xs text-gray-400 font-mono truncate flex-1">
        {{ url || 'about:blank' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  X,
  Globe,
  Lock,
} from "lucide-vue-next";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useAIStore } from "../../stores/ai";

interface Props {
  url?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  url: null,
});

const emit = defineEmits<{
  close: [];
}>();

const aiStore = useAIStore();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const iframeKey = ref(0);
const isRefreshing = ref(false);
const isLive = ref(false);

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const activeDevice = ref<DeviceType>('desktop');

const devices = [
  { id: 'desktop' as DeviceType, label: 'Desktop', icon: Monitor },
  { id: 'tablet' as DeviceType, label: 'Tablet', icon: Tablet },
  { id: 'mobile' as DeviceType, label: 'Mobile', icon: Smartphone },
];

const deviceSizes: Record<DeviceType, { width: string; height: string }> = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' },
};

const frameStyle = computed(() => {
  const size = deviceSizes[activeDevice.value];
  if (activeDevice.value === 'desktop') {
    return {
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      maxHeight: 'none',
    };
  }
  return {
    width: size.width,
    height: size.height,
    maxWidth: size.width,
    maxHeight: size.height,
  };
});

const url = computed(() => props.url || aiStore.livePreviewUrl);

function refresh() {
  isRefreshing.value = true;
  iframeKey.value++;
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
}

async function openExternal() {
  if (url.value) {
    try {
      await openUrl(url.value);
    } catch (error) {
      window.open(url.value, '_blank');
    }
  }
}

function close() {
  aiStore.toggleLivePreview(false);
  emit('close');
}

function onIframeLoad() {
  isLive.value = true;
}

function onIframeError() {
  isLive.value = false;
}

// Auto-refresh when URL changes
watch(url, () => {
  if (url.value) {
    isLive.value = false;
    iframeKey.value++;
  }
});
</script>

<style scoped>
.preview-frame {
  transform-origin: top center;
}
</style>
