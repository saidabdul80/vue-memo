<template>
  <div class="memo-list-container">
    <div class="memo-list-header">
      <TopMenus />
      <GlobalSearch />
    </div>
    
    <div class="memo-list-content">
      <div class="memo-list-actions">
        <div class="vm-flex vm-items-center">
          <input type="checkbox" @change="toggleAll" :checked="selectAll" class="vm-mr-4" />
          <div class="status-filter">
            <button v-for="status in ['ALL', 'APPROVED', 'REJECTED']" :key="status" @click="global.filters.status = status" :class="{ 'active': global.filters.status === status }">
              {{ status }}
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="global.memos.length === 0" class="empty-memo-list">
        <i class="pi pi-folder-open vm-text-8xl vm-text-gray-300"></i>
        <p class="vm-text-xl vm-font-semibold vm-mt-4">No Memos {{ global.filters.status?.toLowerCase() }}</p>
      </div>
      
      <div v-else class="memo-items-container" :style="{ 'height': global.config.height }">
        <div v-if="!memoLoading" class="memo-items">
          <div v-for="memo in global.memos" :key="memo.id" :class="{ 'vm-bg-primary-hover': global.memo.id === memo.id }" class="memo-item">
            <div class="vm-p-3">
              <input type="checkbox" v-model="global.selectedMenus" :value="memo" />
            </div>
            <div class="vm-flex-grow vm-cursor-pointer" @click="selectList(memo)">
              <div class="vm-flex vm-justify-between vm-items-center vm-mb-1">
                <span class="vm-font-bold vm-text-text-primary">{{ cleanHtml(memo.title).slice(0, 25) }}</span>
                <span v-if="memo.is_read === 0" class="unread-badge">Unread</span>
              </div>
              <p class="vm-text-sm vm-text-text-secondary vm-truncate">{{ cleanHtml(memo.content).slice(0, 120) }}</p>
            </div>
            <div class="vm-flex vm-items-center vm-gap-2 vm-p-3">
              <div class="vm-text-right">
                <p class="vm-text-xs vm-font-bold vm-uppercase vm-text-primary">{{ memo.type }}</p>
                <p class="vm-text-xs vm-text-text-secondary">{{ memo.time_at }}</p>
              </div>
              <button @click="toggle($event, memo)" class="btn-icon">
                <i class="pi pi-ellipsis-v"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-if="memoLoading">
          <MemoLoader v-for="x in 5" :key="x" class="vm-mb-3" />
        </div>
      </div>
      
      <div class="memo-list-footer">
        <Pagination />
        <button @click="global.compose()" class="btn btn-primary">
          <i class="pi pi-pencil vm-mr-2"></i>
          Compose New Memo
        </button>
      </div>
    </div>
    
    <div v-if="showMenu" class="overlay-menu" :style="menuStyle">
      <ul>
        <li @click="editMemo"><i class="pi pi-pencil vm-mr-2"></i> Edit</li>
        <li @click="deleteMemo"><i class="pi pi-trash vm-mr-2"></i> Delete</li>
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

export default {
  components: {
    GlobalSearch,
    TopMenus,
    MemoLoader,
    Pagination,
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
  @apply vm-flex vm-flex-col vm-h-full vm-bg-surface vm-shadow-md vm-rounded-lg;
}
.memo-list-header {
  @apply vm-p-4 vm-border-b;
}
.memo-list-content {
  @apply vm-flex-grow vm-flex vm-flex-col;
}
.memo-list-actions {
  @apply vm-p-3 vm-border-b;
}
.status-filter {
  @apply vm-flex vm-items-center vm-gap-1 vm-bg-background vm-p-1 vm-rounded-md;
}
.status-filter button {
  @apply vm-px-3 vm-py-1 vm-text-sm vm-rounded-md vm-transition-colors;
}
.status-filter button.active {
  @apply vm-bg-primary vm-text-white;
}
.empty-memo-list {
  @apply vm-flex vm-flex-col vm-justify-center vm-items-center vm-h-full vm-text-text-secondary;
}
.memo-items-container {
  @apply vm-flex-grow vm-overflow-y-auto;
}
.memo-items {
  @apply vm-pb-16;
}
.memo-item {
  @apply vm-flex vm-items-center vm-border-b vm-transition-colors vm-duration-200;
}
.memo-item:hover {
  @apply vm-bg-primary-hover;
}
.unread-badge {
  @apply vm-bg-primary vm-text-white vm-text-xs vm-px-2 vm-py-1 vm-rounded-full;
}
.btn-icon {
  @apply vm-p-2 vm-rounded-full hover:vm-bg-background;
}
.memo-list-footer {
  @apply vm-flex vm-justify-between vm-items-center vm-p-3 vm-border-t;
}
.overlay-menu {
  @apply vm-fixed vm-bg-surface vm-shadow-lg vm-rounded-md vm-py-2 vm-z-50;
}
.overlay-menu ul {
  @apply vm-list-none vm-p-0 vm-m-0;
}
.overlay-menu li {
  @apply vm-px-4 vm-py-2 vm-cursor-pointer hover:vm-bg-background;
}
</style>
