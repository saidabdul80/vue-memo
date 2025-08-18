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
  /* Enhanced Theme Variables with Glass-morphism Support */
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
  
  /* Modern Glass-morphism Variables */
  --memo-glass-primary: rgba(255, 255, 255, 0.1);
  --memo-glass-secondary: rgba(255, 255, 255, 0.05);
  --memo-glass-border: rgba(255, 255, 255, 0.2);
  --memo-backdrop-blur: blur(16px);
  
  /* Enhanced Shadow System */
  --memo-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --memo-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --memo-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --memo-shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  --memo-shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);
  --memo-shadow-floating: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* Modern Border Radius */
  --memo-radius-sm: 0.25rem;
  --memo-radius-md: 0.375rem;
  --memo-radius-lg: 0.5rem;
  --memo-radius-modern: 1rem;
  --memo-radius-xl: 1.5rem;
  
  /* Enhanced Transitions */
  --memo-transition: all 0.2s ease-in-out;
  --memo-transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --memo-transition-bounce: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Drawer Variables */
  --memo-drawer-width: 60%;
  --memo-drawer-bg: var(--memo-glass-primary);
  --memo-drawer-header-bg: var(--memo-glass-secondary);
  --memo-drawer-shadow: var(--memo-shadow-glass);
  --memo-drawer-border: 1px solid var(--memo-glass-border);
  --memo-drawer-header-height: 60px;
  --memo-action-btn-gap: 0.5rem;
  --memo-height: 80vh;
  
  /* Gradient Backgrounds */
  --memo-bg-gradient: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  --memo-primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --memo-accent-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --memo-surface-gradient: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
