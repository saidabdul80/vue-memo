<template>
  <div class=" vm-p-3 " :style="[`border-color:${global.config.colors?.primary}`]">
  <Memo />
  </div>
</template>

<script>
import { useGlobalsStore } from './stores/globals';

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      global:useGlobalsStore()
    }
  },
  created() {
    this.global.config = this.$memoglobals;
    console.log(this.$memoglobals,33);
  }
}
</script>

<style>

:root {
  /* Theme Variables */
  --memo-primary-color: #3b82f6;
  --memo-primary-hover: #2563eb;
  --memo-secondary-color: #64748b;
  --memo-background: #f8fafc;
  --memo-surface: #ffffff;
  --memo-border: #e2e8f0;
  --memo-text-primary: #1e293b;
  --memo-text-secondary: #64748b;
  --memo-error: #ef4444;
  --memo-success: #10b981;
  --memo-warning: #f59e0b;
  --memo-info: #3b82f6;
  --memo-unread-bg: #f0f9ff;
  --memo-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --memo-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --memo-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --memo-radius-sm: 0.25rem;
  --memo-radius-md: 0.375rem;
  --memo-radius-lg: 0.5rem;
  --memo-transition: all 0.2s ease-in-out;
  --memo-drawer-width: 60%;
  --memo-drawer-bg: var(--memo-surface);
  --memo-drawer-header-bg: var(--memo-surface);
  --memo-drawer-shadow: var(--memo-shadow-lg);
  --memo-drawer-border: 1px solid var(--memo-border);
  --memo-drawer-header-height: 60px;
  --memo-action-btn-gap: 0.5rem;
  --memo-height: 80vh;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
