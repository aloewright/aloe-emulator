<template>
  <div class="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
    <TopBar />

    <div class="grow overflow-hidden">
      <SystemDashboard v-if="viewState.activeView === 'dashboard'" />

      <Workspace v-if="viewState.activeView === 'workspace'" />

      <SFTPBrowser v-if="viewState.activeView === 'sftp'" />

      <SSHProfileManager />

      <SavedCommandManager />

      <RecordingsManager />

      <TunnelManager />

      <SyncManager />

      <SettingsManager />

      <TerminalProfileManager />

      <CommandPaletteManager />
      <CommandPaletteAIManager />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, defineAsyncComponent } from "vue";
import { message } from "./utils/message";

import TopBar from "./components/TopBar.vue";

const SystemDashboard = defineAsyncComponent(
  () => import("./components/dashboard/SystemDashboard.vue"),
);
const Workspace = defineAsyncComponent(
  () => import("./components/Workspace.vue"),
);
const SFTPBrowser = defineAsyncComponent(
  () => import("./components/sftp/SFTPBrowser.vue"),
);
const SSHProfileManager = defineAsyncComponent(
  () => import("./components/ssh-profiles/SSHProfileManager.vue"),
);
const SavedCommandManager = defineAsyncComponent(
  () => import("./components/saved-commands/SavedCommandManager.vue"),
);
const RecordingsManager = defineAsyncComponent(
  () => import("./components/recording/RecordingsManager.vue"),
);
const TunnelManager = defineAsyncComponent(
  () => import("./components/tunnels/TunnelManager.vue"),
);
const SyncManager = defineAsyncComponent(
  () => import("./components/sync/SyncManager.vue"),
);
const SettingsManager = defineAsyncComponent(
  () => import("./components/settings/SettingsManager.vue"),
);
const TerminalProfileManager = defineAsyncComponent(
  () => import("./components/terminal-profiles/TerminalProfileManager.vue"),
);
const CommandPaletteManager = defineAsyncComponent(
  () => import("./components/CommandPaletteManager.vue"),
);
const CommandPaletteAIManager = defineAsyncComponent(
  () => import("./components/CommandPaletteAIManager.vue"),
);

import { useOverlay } from "./composables/useOverlay";
import { useGlobalShortcuts } from "./composables/useGlobalShortcuts";

import { useViewStateStore } from "./stores/viewState";
import { useUpdaterStore } from "./stores/updater";

const viewState = useViewStateStore();
const updaterStore = useUpdaterStore();

const { openOverlay } = useOverlay();

// Initialize global keyboard shortcuts once at app level
useGlobalShortcuts();

onMounted(async () => {
  // Enable top bar immediately (no auth)
  viewState.toggleTopBar(true);

  // Initialize updater store (detect platform)
  updaterStore.initialize();

  // Start listening for updates via store
  await updaterStore.startListening();

  // Watch for update availability to trigger modal
  watch(
    () => updaterStore.hasUpdate,
    (hasUpdate) => {
      if (hasUpdate) {
        message.success("Update available!");
        openOverlay("updater-modal");
      }
    },
    { immediate: true }
  );
});
</script>
