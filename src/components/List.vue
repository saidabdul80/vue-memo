<template>
  <div class="memo-list-container">
    <div class="memo-list-header">
      <TopMenus />
      <GlobalSearch />
    </div>
    
    <div class="memo-list-content">
      <div class="memo-list-actions">
        <div class="vm-flex vm-items-center vm-gap-4">
          <label class="modern-checkbox">
            <input type="checkbox" @change="toggleAll" :checked="selectAll" />
            <span class="checkmark"></span>
            <span class="vm-text-sm vm-font-medium vm-text-text-secondary">Select All</span>
          </label>
          <div class="status-filter">
            <button 
              v-for="status in ['ALL', 'APPROVED', 'REJECTED']" 
              :key="status" 
              @click="global.filters.status = status" 
              :class="['status-btn', { 'active': global.filters.status === status }]"
            >
              {{ status }}
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="global.memos.length === 0 && !memoLoading" class="empty-memo-list">
        <div class="empty-icon-container">
          <PhFolderOpen :size="72" class="empty-icon" />
          <div class="pulse-ring"></div>
        </div>
        <h3 class="empty-title">No Memos Found</h3>
        <p class="empty-subtitle">{{ global.filters.status?.toLowerCase() || 'Start by creating your first memo' }}</p>
      </div>
      
      <div v-else class="memo-items-container" :style="{ 'height': global.config.height }">
        <div v-if="!memoLoading" class="memo-items">
          <div 
            v-for="(memo, index) in global.memos" 
            :key="memo.id" 
            :class="['memo-item-card', { 'selected': global.memo.id === memo.id }]"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="memo-checkbox-container">
              <label class="modern-checkbox-small">
                <input type="checkbox" v-model="global.selectedMenus" :value="memo" />
                <span class="checkmark-small"></span>
              </label>
            </div>
            
            <div class="memo-content" @click="selectList(memo)">
              <div class="memo-header">
                <h4 class="memo-title">{{ cleanHtml(memo.title).slice(0, 25) }}</h4>
                <div class="memo-meta">
                  <span v-if="memo.is_read === 0" class="unread-badge">New</span>
                  <span class="memo-type-badge" :class="`type-${memo.type.toLowerCase()}`">{{ memo.type }}</span>
                </div>
              </div>
              <p class="memo-preview">{{ cleanHtml(memo.content).slice(0, 120) }}</p>
              <div class="memo-footer">
                <span class="memo-time">{{ memo.time_at }}</span>
              </div>
            </div>
            
            <div class="memo-actions">
              <button @click="toggle($event, memo)" class="action-btn">
                <PhDotsThreeVertical :size="16" />
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="memoLoading" class="loading-container">
          <MemoLoader v-for="x in 5" :key="x" class="vm-mb-4" />
        </div>
      </div>
      
      <div class="memo-list-footer">
        <Pagination />
        <button @click="global.compose()" class="compose-btn">
          <div class="btn-gradient"></div>
          <PhPlus :size="16" class="vm-mr-2" />
          <span>New Memo</span>
        </button>
      </div>
    </div>
    
    <div v-if="showMenu" class="overlay-menu glass-menu" :style="menuStyle">
      <ul>
        <li @click="editMemo" class="menu-item">
          <PhPencil :size="16" class="vm-mr-3" /> 
          <span>Edit</span>
        </li>
        <li @click="deleteMemo" class="menu-item danger">
          <PhTrash :size="16" class="vm-mr-3" /> 
          <span>Delete</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import GlobalSearch from "./GlobalSearch.vue";
import TopMenus from "./TopMenus.vue";
import MemoLoader from "./MemoLoader.vue";
import Pagination from "./Pagination.vue";
import { PhFolderOpen, PhDotsThreeVertical, PhPlus, PhPencil, PhTrash } from '@phosphor-icons/vue';

export default {
  components: {
    GlobalSearch,
    TopMenus,
    MemoLoader,
    Pagination,
    PhFolderOpen,
    PhDotsThreeVertical,
    PhPlus,
    PhPencil,
    PhTrash,
  },
  data() {
    return {
      global: useGlobalsStore(),
      selectAll: false,
      memoLoading: false,
      showMenu: false,
      menuStyle: {},
    };
  },
  watch: {
    "global.filters": {
      handler: async function (newVal) {
        this.memoLoading = true;
        await this.global.fetchMemos(this.global.config.getMemosRoute, newVal);
        this.memoLoading = false;
      },
      deep: true,
    },
  },
  created() {
    this.global.fetchMemos(this.global.config.getMemosRoute, this.global.filters);
    document.addEventListener('click', this.closeMenu);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeMenu);
  },
  methods: {
    cleanHtml(text) {
      return text.replace(/<\/?[^>]+(>|$)/g, "");
    },
    toggle(event, item) {
      event.stopPropagation();
      this.global.memo = item;
      this.menuStyle = { top: `${event.clientY}px`, left: `${event.clientX-90}px` };
      this.showMenu = !this.showMenu;
    },
    closeMenu() {
      this.showMenu = false;
    },
    editMemo() {
      this.global.content_to_show = "editor";
      this.global.drawer = true;
      this.closeMenu();
    },
    async deleteMemo() {
      await this.global.deleteMemo(this.global.memo.id);
      this.global.fetchMemos();
      this.closeMenu();
    },
    toggleAll() {
      this.selectAll = !this.selectAll;
      this.global.selectedMenus = this.selectAll ? this.global.memos : [];
    },
    selectList(data) {
      this.global.memo = data;
      data.is_read = 1;
      this.global.content_to_show = "viewer";
      this.global.drawer = true;
    },
  },
};
</script>

<style scoped>
.memo-list-container {
  @apply vm-flex vm-flex-col vm-h-full vm-rounded-2xl vm-overflow-hidden;
  background: var(--memo-glass-primary);
  backdrop-filter: var(--memo-backdrop-blur);
  border: 1px solid var(--memo-glass-border);
  box-shadow: var(--memo-shadow-glass);
}

.memo-list-header {
  @apply vm-p-6;
  background: var(--memo-glass-secondary);
  backdrop-filter: var(--memo-backdrop-blur);
  border-bottom: 1px solid var(--memo-glass-border);
}

.memo-list-content {
  @apply vm-flex-grow vm-flex vm-flex-col;
}

.memo-list-actions {
  @apply vm-p-4;
  background: var(--memo-glass-secondary);
  backdrop-filter: var(--memo-backdrop-blur);
  border-bottom: 1px solid var(--memo-glass-border);
}

/* Modern checkbox design */
.modern-checkbox {
  @apply vm-flex vm-items-center vm-gap-3 vm-cursor-pointer;
}

.modern-checkbox input[type="checkbox"] {
  @apply vm-sr-only;
}

.checkmark {
  @apply vm-w-5 vm-h-5 vm-rounded-lg vm-border-2 vm-transition-all vm-duration-300;
  border-color: rgba(255, 255, 255, 0.3);
  background: var(--memo-glass-secondary);
  backdrop-filter: var(--memo-backdrop-blur);
  position: relative;
}

.modern-checkbox input:checked + .checkmark {
  background: var(--memo-primary-gradient);
  @apply vm-border-primary;
  box-shadow: var(--memo-shadow-glow);
}

.modern-checkbox input:checked + .checkmark::after {
  content: '';
  @apply vm-absolute vm-left-1.5 vm-top-0.5 vm-w-2 vm-h-3;
  border: 2px solid white;
  border-top: 0;
  border-left: 0;
  transform: rotate(45deg);
}

.modern-checkbox-small {
  @apply vm-flex vm-items-center vm-cursor-pointer;
}

.modern-checkbox-small input[type="checkbox"] {
  @apply vm-sr-only;
}

.checkmark-small {
  @apply vm-w-4 vm-h-4 vm-rounded-md vm-border vm-transition-all vm-duration-300;
  border-color: rgba(255, 255, 255, 0.3);
  background: var(--memo-glass-secondary);
}

.modern-checkbox-small input:checked + .checkmark-small {
  background: var(--memo-primary-gradient);
  @apply vm-border-primary;
}

.status-filter {
  @apply vm-flex vm-items-center vm-gap-1 vm-p-1 vm-rounded-xl;
  background: var(--memo-glass-secondary);
  backdrop-filter: var(--memo-backdrop-blur);
  border: 1px solid var(--memo-glass-border);
}

.status-btn {
  @apply vm-px-4 vm-py-2 vm-text-sm vm-rounded-lg vm-font-medium vm-transition-all vm-duration-300;
  @apply vm-text-text-secondary hover:vm-text-text-primary;
}

.status-btn:hover {
  background: var(--memo-glass-primary);
  @apply vm-transform vm-scale-105;
}

.status-btn.active {
  background: var(--memo-primary-gradient);
  @apply vm-text-white vm-shadow-lg;
  box-shadow: var(--memo-shadow-glow);
}

.empty-memo-list {
  @apply vm-flex vm-flex-col vm-justify-center vm-items-center vm-h-full vm-p-8;
}

.empty-icon-container {
  @apply vm-relative vm-mb-6;
}

.empty-icon {
  @apply vm-text-6xl vm-text-text-secondary vm-opacity-40;
  animation: floating 3s ease-in-out infinite;
}

.pulse-ring {
  @apply vm-absolute vm-inset-0 vm-rounded-full vm-border-2;
  border-color: rgba(59, 130, 246, 0.3);
  animation: pulse-ring 2s ease-out infinite;
}

.empty-title {
  @apply vm-text-2xl vm-font-bold vm-text-text-primary vm-mb-2;
  background: var(--memo-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-subtitle {
  @apply vm-text-text-secondary vm-text-center vm-max-w-md;
}

.memo-items-container {
  @apply vm-flex-grow vm-overflow-y-auto vm-p-2;
}

.memo-items {
  @apply vm-space-y-2 vm-pb-20;
}

.memo-item-card {
  @apply vm-flex vm-items-center vm-p-4 vm-rounded-2xl vm-transition-all vm-duration-300;
  @apply vm-cursor-pointer vm-backdrop-blur-sm;
  background: var(--memo-glass-secondary);
  border: 1px solid var(--memo-glass-border);
  animation: slide-up 0.5s ease-out;
}

.memo-item-card:hover {
  @apply vm-transform vm-scale-[1.02] vm-z-10;
  background: var(--memo-glass-primary);
  box-shadow: var(--memo-shadow-floating);
}

.memo-item-card.selected {
  background: var(--memo-primary-gradient);
  @apply vm-text-white;
  box-shadow: var(--memo-shadow-glow);
}

.memo-checkbox-container {
  @apply vm-mr-4;
}

.memo-content {
  @apply vm-flex-grow vm-min-w-0;
}

.memo-header {
  @apply vm-flex vm-justify-between vm-items-start vm-mb-2;
}

.memo-title {
  @apply vm-font-bold vm-text-text-primary vm-truncate vm-text-lg;
}

.memo-item-card.selected .memo-title {
  @apply vm-text-white;
}

.memo-meta {
  @apply vm-flex vm-gap-2 vm-flex-shrink-0;
}

.unread-badge {
  @apply vm-text-white vm-text-xs vm-px-3 vm-py-1 vm-rounded-full;
  @apply vm-font-semibold vm-shadow-lg;
  background: var(--memo-accent-gradient);
}

.memo-type-badge {
  @apply vm-text-xs vm-px-3 vm-py-1 vm-rounded-full vm-font-semibold vm-uppercase;
  @apply vm-backdrop-blur-sm vm-border;
}

.type-request {
  background-color: rgba(245, 158, 11, 0.2);
  color: var(--memo-warning);
  border-color: rgba(245, 158, 11, 0.3);
}

.type-info {
  background-color: rgba(59, 130, 246, 0.2);
  color: var(--memo-info);
  border-color: rgba(59, 130, 246, 0.3);
}

.type-notification {
  background-color: rgba(100, 116, 139, 0.2);
  color: var(--memo-secondary);
  border-color: rgba(100, 116, 139, 0.3);
}

.memo-preview {
  @apply vm-text-sm vm-text-text-secondary vm-mb-3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.memo-item-card.selected .memo-preview {
  color: rgba(255, 255, 255, 0.8);
}

.memo-footer {
  @apply vm-flex vm-justify-between vm-items-center;
}

.memo-time {
  @apply vm-text-xs vm-text-text-secondary vm-font-medium;
}

.memo-item-card.selected .memo-time {
  color: rgba(255, 255, 255, 0.6);
}

.memo-actions {
  @apply vm-ml-4;
}

.action-btn {
  @apply vm-p-3 vm-rounded-xl vm-text-text-secondary vm-transition-all vm-duration-300;
  @apply hover:vm-text-text-primary hover:vm-scale-110;
  @apply focus:vm-outline-none focus:vm-ring-2 focus:vm-ring-primary focus:vm-ring-opacity-50;
}

.memo-item-card.selected .action-btn {
  @apply vm-text-white hover:vm-text-white;
  color: rgba(255, 255, 255, 0.6);
}

.memo-item-card.selected .action-btn:hover {
  color: rgba(255, 255, 255, 1);
  background-color: rgba(255, 255, 255, 0.1);
}

.loading-container {
  @apply vm-space-y-4 vm-p-2;
}

.memo-list-footer {
  @apply vm-flex vm-justify-between vm-items-center vm-p-6;
  background: var(--memo-glass-secondary);
  backdrop-filter: var(--memo-backdrop-blur);
  border-top: 1px solid var(--memo-glass-border);
}

.compose-btn {
  @apply vm-relative vm-px-6 vm-py-3 vm-rounded-xl vm-font-semibold;
  @apply vm-text-white vm-transition-all vm-duration-300 vm-overflow-hidden;
  @apply vm-shadow-lg hover:vm-shadow-xl vm-transform hover:vm-scale-105;
  @apply focus:vm-outline-none focus:vm-ring-2 focus:vm-ring-offset-2 focus:vm-ring-primary focus:vm-ring-opacity-50;
  background: var(--memo-primary-gradient);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.compose-btn:hover {
  box-shadow: var(--memo-shadow-glow);
}

.btn-gradient {
  @apply vm-absolute vm-inset-0 vm-opacity-0 vm-transition-opacity vm-duration-300;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
}

.compose-btn:hover .btn-gradient {
  @apply vm-opacity-100;
}

/* Glass menu styling */
.glass-menu {
  @apply vm-backdrop-blur-xl vm-rounded-2xl vm-py-2 vm-z-50;
  background: var(--memo-glass-primary);
  border: 1px solid var(--memo-glass-border);
  box-shadow: var(--memo-shadow-floating);
  animation: scale-in 0.2s ease-out;
}

.glass-menu ul {
  @apply vm-list-none vm-p-0 vm-m-0;
}

.menu-item {
  @apply vm-flex vm-items-center vm-px-4 vm-py-3 vm-cursor-pointer vm-transition-all vm-duration-200;
  @apply vm-text-text-primary hover:vm-text-primary;
}

.menu-item:hover {
  background: var(--memo-glass-primary);
  @apply vm-transform vm-scale-105;
}

.menu-item.danger:hover {
  @apply vm-text-error;
  background: rgba(239, 68, 68, 0.1);
}

/* Animations */
@keyframes slide-up {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes scale-in {
  from { 
    opacity: 0; 
    transform: scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
}

@keyframes floating {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-ring {
  0% { 
    transform: scale(0.8); 
    opacity: 1; 
  }
  100% { 
    transform: scale(1.5); 
    opacity: 0; 
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .memo-item-card {
    @apply vm-p-3;
  }
  
  .memo-title {
    @apply vm-text-base;
  }
  
  .memo-list-footer {
    @apply vm-flex-col vm-gap-4 vm-p-4;
  }
  
  .compose-btn {
    @apply vm-w-full vm-justify-center;
  }
}
</style>
