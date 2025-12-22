<template>
  <CommandPaletteAI />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import CommandPaletteAI from "./ui/CommandPaletteAI.vue";
import { useOverlay } from "../composables/useOverlay";
import { invoke } from "@tauri-apps/api/core";

const { registerOverlay, unregisterOverlay, openOverlay } = useOverlay();

// Simple global listener for Cmd+L (AI) until we integrate with global shortcuts store
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
    e.preventDefault();
    openOverlay("ai-palette");
  }
};

onMounted(() => {
  registerOverlay({
    id: "ai-palette",
    type: "modal",
    title: "AI Assistant",
    props: {
        size: "lg",
        showCloseButton: false,
        closeOnBackdrop: true,
        closeOnEsc: true
    }
  });
  
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  unregisterOverlay("ai-palette");
  window.removeEventListener('keydown', handleKeydown);
});
</script>
