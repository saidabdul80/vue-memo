<template>
  <div class="pagination-container">
    <span class="pagination-info">
      Showing {{ meta?.from }} - {{ meta?.to }} of {{ meta?.total }}
    </span>
    
    <div class="pagination-controls">
      <Button
        outlined
        :disabled="!links?.prev"
        @click="changePage(links?.prev)"
        class="pagination-btn"
        aria-label="Previous page"
      >
        <PhCaretLeft class="btn-icon" />
      </Button>
      
      <Button
        outlined
        :disabled="!links?.next"
        @click="changePage(links?.next)"
        class="pagination-btn"
        aria-label="Next page"
      >
        <PhCaretRight class="btn-icon" />
      </Button>
    </div>
  </div>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import { PhCaretLeft, PhCaretRight } from "@phosphor-icons/vue";
import Button from "primevue/button";

export default {
  components: {
    Button,
    PhCaretRight,
    PhCaretLeft,
  },
  props: {
    meta: Object,
    links: Object,
  },
  data() {
    return {
      global: useGlobalsStore(),
    };
  },
  methods: {
    changePage(path) {
      this.global.fetchMemos(path, this.global.filters, true);
    },
  },
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--memo-text-secondary);
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.pagination-btn {
  width: 2rem;
  height: 2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--memo-radius-sm);
  border-color: var(--memo-border);
  color: var(--memo-text-secondary);
  transition: var(--memo-transition);
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--memo-primary-color);
  border-color: var(--memo-primary-color);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1rem;
}
</style>