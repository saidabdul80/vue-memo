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
  @apply vm-flex vm-justify-between vm-items-center vm-p-2;
}
.btn-icon {
  @apply vm-p-2 vm-rounded-full hover:vm-bg-background disabled:vm-opacity-50;
}
</style>
