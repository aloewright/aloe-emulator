<template>
  <CommandPaletteAI />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import CommandPaletteAI from "./ui/CommandPaletteAI.vue";
import { useOverlay } from "../composables/useOverlay";

const { registerOverlay, unregisterOverlay } = useOverlay();

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
});

onBeforeUnmount(() => {
  unregisterOverlay("ai-palette");
});
</script>
