<template>
  <div class="top-menus-container">
    <div class="tabs">
      <button v-for="(tab, index) in menus" :key="tab.label" @click="selectMenu(index)" :class="{ 'active': activeIndex === index }">
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";

export default {
  props: {
    menus: {
      type: Array,
      default: () => [
        {
          label: "All",
          icon: "pi pi-folder",
          name: "category",
        },
        {
          label: "INBOX",
          icon: "pi pi-inbox",
          name: "category",
        },
        {
          label: "SENT",
          icon: "pi pi-send",
          name: "category",
        },
      ],
    },
  },
  data() {
    return {
      global: useGlobalsStore(),
      activeIndex: 0,
    };
  },
  methods: {
    selectMenu(index) {
      this.activeIndex = index;
      const selectedMenu = this.menus[index];
      this.global.filters.status = null;
      this.global.filters.category = null;
      this.global.filters[selectedMenu.name] = selectedMenu.label;
    },
  },
};
</script>

<style scoped>
.top-menus-container {
  @apply vm-mb-4;
}
.tabs {
  @apply vm-flex vm-border-b;
}
.tabs button {
  @apply vm-flex vm-items-center vm-gap-2 vm-px-4 vm-py-2 vm-text-text-secondary hover:vm-text-text-primary;
}
.tabs button.active {
  border-bottom:2px solid var(--memo-primary-color) !important;
  @apply vm-border-b-2 vm-border-primary vm-text-primary;
}
</style>
