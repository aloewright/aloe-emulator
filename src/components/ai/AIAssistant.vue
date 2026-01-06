<template>
  <div class="ai-assistant">
    <p>{{ response }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  response: string;
}>();
</script>

<style scoped>
.ai-assistant {
  padding: 1rem;
  background-color: #1a1a1a;
  color: #fff;
}
</style>
