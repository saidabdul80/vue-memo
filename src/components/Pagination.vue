<template>
  <div class="pagination-container">
    <span class="vm-text-sm vm-text-text-secondary">
      {{ meta.from }} - {{ meta.to }} of {{ meta.total }}
    </span>
    <div class="vm-flex vm-gap-2">
      <button @click="changePage(links.prev)" :disabled="!links.prev" class="btn-icon">
        <i class="pi pi-chevron-left"></i>
      </button>
      <button @click="changePage(links.next)" :disabled="!links.next" class="btn-icon">
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";

export default {
  props: {
    meta: {
      type: Object,
      default: () => ({}),
    },
    links: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      global: useGlobalsStore(),
    };
  },
  methods: {
    changePage(path) {
      if (path) {
        this.global.fetchMemos(path, this.global.filters, true);
      }
    },
  },
};
</script>

<style scoped>
.pagination-container {
  @apply vm-flex vm-justify-between vm-items-center vm-p-4;
}

.btn-icon {
  @apply vm-p-3 vm-rounded-xl vm-text-text-secondary vm-transition-all vm-duration-300;
  @apply hover:vm-text-text-primary hover:vm-scale-110 disabled:vm-opacity-50;
  @apply focus:vm-outline-none focus:vm-ring-2 focus:vm-ring-primary focus:vm-ring-opacity-50;
  background: var(--memo-glass-secondary);
  backdrop-filter: var(--memo-backdrop-blur);
  border: 1px solid var(--memo-glass-border);
}

.btn-icon:hover:not(:disabled) {
  background: var(--memo-glass-primary);
  box-shadow: var(--memo-shadow-lg);
}

.btn-icon:disabled {
  @apply vm-cursor-not-allowed vm-opacity-40;
}
</style>
