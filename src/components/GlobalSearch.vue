<template>
  <div class="global-search-container">
    <div class="search-input-wrapper" :class="{ 'focused': isFocused }">
      <div class="search-icon-container">
        <PhMagnifyingGlass :size="16" class="search-icon" />
      </div>
      <input 
        type="text" 
        v-model="global.filters.search" 
        placeholder="Search your memos..." 
        class="search-input"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <button 
        v-if="global.filters.search" 
        class="clear-button" 
        @click="clearSearch"
        aria-label="Clear search"
      >
        <PhX :size="14" class="clear-icon" />
      </button>
    </div>
  </div>
</template>

<script>
import { useGlobalsStore } from '@/stores/globals';
import { PhMagnifyingGlass, PhX } from '@phosphor-icons/vue';

export default {
  components: {
    PhMagnifyingGlass,
    PhX
  },
  data() {
    return {
      global: useGlobalsStore(),
      isFocused: false,
    };
  },
  methods: {
    clearSearch() {
      this.global.filters.search = '';
      this.$nextTick(() => {
        this.$refs?.searchInput?.focus();
      });
    },
  },
};
</script>

<style scoped>
.global-search-container {
  @apply vm-w-full;
}

.search-input-wrapper {
  @apply vm-relative vm-rounded-2xl vm-transition-all vm-duration-300;
  background: var(--memo-glass-secondary);
  backdrop-filter: var(--memo-backdrop-blur);
  border: 1px solid var(--memo-glass-border);
  box-shadow: var(--memo-shadow-glass);
}

.search-input-wrapper.focused {
  @apply vm-scale-[1.02];
  box-shadow: var(--memo-shadow-glow);
  border-color: var(--memo-primary-color);
}

.search-input-wrapper:hover {
  @apply vm-scale-[1.01];
  background: rgba(255, 255, 255, 0.15);
}

.search-icon-container {
  @apply vm-absolute vm-left-4 vm-top-1/2 vm-transform -vm-translate-y-1/2;
  @apply vm-transition-all vm-duration-300;
}

.search-input-wrapper.focused .search-icon-container {
  @apply vm-text-primary vm-scale-110;
}

.search-icon {
  @apply vm-text-text-secondary vm-transition-all vm-duration-300;
}

.search-input {
  @apply vm-w-full vm-pl-12 vm-pr-12 vm-py-3 vm-bg-transparent;
  @apply vm-text-text-primary vm-placeholder-text-secondary vm-text-sm;
  @apply vm-border-none vm-outline-none vm-rounded-2xl;
  @apply vm-transition-all vm-duration-300;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.search-input::placeholder {
  @apply vm-transition-all vm-duration-300;
}

.search-input:focus::placeholder {
  @apply vm-opacity-70 vm-transform vm-translate-x-1;
}

.clear-button {
  @apply vm-absolute vm-right-3 vm-top-1/2 vm-transform -vm-translate-y-1/2;
  @apply vm-p-2 vm-rounded-xl vm-text-text-secondary vm-transition-all vm-duration-300;
  @apply hover:vm-text-text-primary hover:vm-bg-white/10 hover:vm-scale-110;
  @apply focus:vm-outline-none focus:vm-ring-2 focus:vm-ring-primary focus:vm-ring-opacity-50;
}

.clear-icon {
  @apply vm-text-sm vm-transition-transform vm-duration-300;
}

.clear-button:hover .clear-icon {
  @apply vm-transform vm-rotate-90;
}

/* Loading state animation */
.search-input-wrapper.loading {
  animation: pulse-glow 2s ease-in-out infinite alternate;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .search-input-wrapper {
    @apply vm-mx-2;
  }
  
  .search-input {
    @apply vm-py-3 vm-text-sm;
  }
}
</style>
