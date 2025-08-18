<template>
  <div class="top-menus-container">
    <div class="top-menus-wrapper">
      <div class="modern-tabs">
        <button 
          v-for="(tab, index) in menus" 
          :key="tab.label" 
          @click="selectMenu(index)" 
          :class="['tab-button', { 'active': activeIndex === index }]"
        >
          <component :is="tab.icon" :size="18" class="tab-icon" />
          <span class="tab-label">{{ tab.label }}</span>
          <div v-if="activeIndex === index" class="tab-indicator"></div>
        </button>
      </div>
      
      <div class="search-section">
        <GlobalSearch />
      </div>
    </div>
  </div>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import { PhFolder, PhTray, PhPaperPlaneRight } from '@phosphor-icons/vue';
import GlobalSearch from './GlobalSearch.vue';

export default {
  components: {
    PhFolder,
    PhTray,
    PhPaperPlaneRight,
    GlobalSearch,
  },
  props: {
    menus: {
      type: Array,
      default: () => [
        {
          label: "All",
          icon: "PhFolder",
          name: "category",
        },
        {
          label: "INBOX",
          icon: "PhTray",
          name: "category",
        },
        {
          label: "SENT",
          icon: "PhPaperPlaneRight",
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
  @apply vm-mb-6;
}

.top-menus-wrapper {
  @apply vm-flex vm-items-center vm-justify-between vm-gap-6;
}

.modern-tabs {
  @apply vm-flex vm-relative vm-p-1 vm-rounded-2xl vm-flex-shrink-0;
  background: var(--memo-glass-secondary);
  backdrop-filter: var(--memo-backdrop-blur);
  border: 1px solid var(--memo-glass-border);
  box-shadow: var(--memo-shadow-glass);
}

.search-section {
  @apply vm-flex-shrink vm-min-w-0;
  flex: 1;
  max-width: 400px;
}

.tab-button {
  @apply vm-relative vm-flex vm-items-center vm-gap-3 vm-px-6 vm-py-3 vm-rounded-xl;
  @apply vm-text-text-secondary vm-font-medium vm-transition-all vm-duration-300;
  @apply vm-cursor-pointer vm-backdrop-blur-sm;
  position: relative;
  overflow: hidden;
}

.tab-button::before {
  content: '';
  @apply vm-absolute vm-inset-0 vm-opacity-0 vm-transition-opacity vm-duration-300;
  background: var(--memo-surface-gradient);
  backdrop-filter: var(--memo-backdrop-blur);
}

.tab-button:hover::before {
  @apply vm-opacity-100;
}

.tab-button:hover {
  @apply vm-text-text-primary vm-transform vm-scale-105;
  box-shadow: var(--memo-shadow-lg);
}

.tab-button.active {
  @apply vm-text-primary vm-font-semibold;
  background: var(--memo-primary-gradient);
  color: white;
  box-shadow: var(--memo-shadow-glow);
}

.tab-button.active::before {
  @apply vm-opacity-0;
}

.tab-icon {
  @apply vm-text-lg vm-transition-transform vm-duration-300;
  z-index: 1;
  position: relative;
}

.tab-button:hover .tab-icon {
  @apply vm-transform vm-scale-110;
}

.tab-button.active .tab-icon {
  @apply vm-drop-shadow-lg;
}

.tab-label {
  @apply vm-font-medium vm-transition-all vm-duration-300;
  z-index: 1;
  position: relative;
}

.tab-indicator {
  @apply vm-absolute vm-bottom-0 vm-left-0 vm-right-0 vm-h-0.5 vm-rounded-full;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: shimmer 2s infinite;
}

/* Responsive design */
@media (max-width: 768px) {
  .top-menus-wrapper {
    @apply vm-flex-col vm-gap-4;
  }
  
  .modern-tabs {
    @apply vm-w-full vm-justify-center;
  }
  
  .search-section {
    @apply vm-w-full;
    max-width: none;
  }
  
  .tab-button {
    @apply vm-px-4 vm-py-2;
  }
  
  .tab-label {
    @apply vm-text-sm;
  }
}

@media (max-width: 480px) {
  .top-menus-wrapper {
    @apply vm-gap-3;
  }
  
  .modern-tabs {
    @apply vm-gap-1;
  }
  
  .tab-button {
    @apply vm-px-3 vm-py-2;
  }
  
  .tab-label {
    @apply vm-text-xs;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
