<template>
  <div class="global-search-container">
    <div class="search-input-wrapper">
      <i class="pi pi-search search-icon"></i>
      <input type="text" v-model="global.filters.search" placeholder="Search Memos" class="search-input" />
      <i v-if="global.filters.search" class="pi pi-times clear-icon" @click="global.filters.search = ''"></i>
    </div>
  </div>
</template>

<script>
import { useGlobalsStore } from '@/stores/globals';

export default {
  data() {
    return {
      global: useGlobalsStore(),
    };
  },
};
</script>

<style scoped>
.global-search-container {
  @apply vm-w-full vm-max-w-md vm-mx-auto;
}
.search-input-wrapper {
  @apply vm-relative;
}
.search-icon {
  @apply vm-absolute vm-left-3 vm-top-1/2 -vm-translate-y-1/2 vm-text-text-secondary;
}
.search-input {
  @apply vm-w-full vm-pl-10 vm-pr-10 vm-py-2 vm-border vm-rounded-md vm-bg-background focus:vm-outline-none focus:vm-ring-2 focus:vm-ring-primary;
}
.clear-icon {
  @apply vm-absolute vm-right-3 vm-top-1/2 -vm-translate-y-1/2 vm-text-text-secondary vm-cursor-pointer hover:vm-text-text-primary;
}
</style>
