<template>
  <div class="memo-app">
    <TopMenus />
    <GlobalSearch />

    <div class="memo-list-container" :style="'min-height:'+global.config.height">
      <div class="list-controls">
        <div class="controls-left">
          <input 
            type="checkbox" 
            @change="toggleAll" 
            :checked="selectAll" 
            class="select-all-checkbox" 
          />
          <Select 
            v-model="global.filters.status" 
            :options="['ALL', 'APPROVED', 'REJECTED']" 
            class="status-filter"
          >
            <template #dropdownicon>
              <PhFunnel />
            </template>
          </Select>
        </div>
      </div>
      
      <Transition name="fade" mode="out-in">
        <div v-if="global.memos.length === 0" class="empty-state">
          <PhFolderOpen class="empty-icon"/>
          <p class="empty-text">No Memos Found</p>
          <Button 
            @click="global.compose()" 
            class="compose-btn"
            :style="{ backgroundColor: `var(--memo-primary-color)` }"
          >
            <PhPencil class="btn-icon" />
            Create Your First Memo
          </Button>
        </div>

        <div v-else class="memo-list-wrapper" :style="'max-height:'+ (parseInt(global.config.height)-3)+'vh'">
          <div v-if="!memoLoading" class="memo-list">
            <TransitionGroup name="list">
              <div 
                v-for="memo in global.memos" 
                :key="memo.id" 
                class="memo-item" 
                :class="{
                  'selected': global.memo.id === memo.id,
                  'unread': memo.is_read === 0
                }" 
                @click="selectList(memo)"
              >
                <div class="memo-item-content">
                  <input 
                    type="checkbox" 
                    v-model="global.selectedMenus" 
                    :value="memo" 
                    class="item-checkbox" 
                    @click.stop
                  />
                  
                  <div class="memo-details">
                    <div class="memo-header">
                      <span class="memo-title">{{ cleanHtml(memo.title).slice(0, 20) }}</span>
                      <div class="memo-status">
                        <Badge v-if="memo.is_read === 0" class="unread-badge">New</Badge>
                        <Tag v-if="memo.status === 'APPROVED'" severity="success" class="status-tag">
                          <template #icon><PhCheck /></template>
                          APPROVED
                        </Tag>
                        <Tag v-else-if="memo.status === 'REJECTED'" severity="danger" class="status-tag">
                          <template #icon><PhX /></template>
                          REJECTED
                        </Tag>
                      </div>
                    </div>

                    <div class="memo-preview">
                      <p class="memo-content">{{ cleanHtml(memo.content).slice(0, 100) }}</p>
                    </div>

                    <div class="memo-meta">
                      <span class="memo-type">{{ memo.type }}</span>
                      <span class="memo-time">{{ formatTime(memo.time_at) }}</span>
                    </div>
                  </div>
                  
                  <button 
                    class="memo-actions-btn" 
                    @click.stop="toggle('overlay_menu_', $event, memo)" 
                    aria-haspopup="true" 
                    aria-controls="overlay_menu_"
                  >
                    <PhDotsThreeOutlineVertical weight="fill" />
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </div>
          
          <div v-if="memoLoading" class="loading-state">
            <MemoLoader v-for="x in 5" :key="x" class="memo-loader-item" />
          </div>
        </div>
      </Transition>
      
      <div class="list-footer">
        <Pagination />
        <Button 
          @click="global.compose()" 
          class="compose-btn"
          :style="{ backgroundColor: `var(--memo-primary-color)` }"
        >
          <PhPencil class="btn-icon" />
          Compose New Memo
        </Button>
      </div>
    </div>
    
    <Menu 
      ref="overlay_menu_" 
      id="overlay_menu_" 
      :model="items" 
      :popup="true"
      class="memo-context-menu"
    >
      <template #item="{ item, props }">
        <a v-ripple v-bind="props.action" class="menu-item">
          <component :is="item.icon" class="menu-icon" />
          <span>{{ item.label }}</span>
        </a>
      </template>
    </Menu>
  </div>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import Button from "primevue/button";
import Menu from "primevue/menu";
import Select from "primevue/select";
import Badge from "primevue/badge";
import Tag from "primevue/tag";
import GlobalSearch from "./GlobalSearch.vue";
import TopMenus from "./TopMenus.vue";
import MemoLoader from "./MemoLoader.vue";
import Pagination from "./Pagination.vue";
import { 
  PhFunnel, 
  PhDotsThreeOutlineVertical, 
  PhFolderOpen, 
  PhPencil, 
  PhTrash, 
  PhCheck,
  PhX
} from "@phosphor-icons/vue";

export default {
  components: {
    Select,
    Menu,
    Button,
    Badge,
    TopMenus,
    MemoLoader,
    Pagination,
    GlobalSearch,
    PhFolderOpen,
    PhPencil,
    PhDotsThreeOutlineVertical,
    PhTrash,
    PhCheck,
    PhX,
    Tag
  },
  data() {
    return {
      global: useGlobalsStore(),
      items: [
        {
          label: "Edit",
          icon: PhPencil,
          command: () => {
            this.global.content_to_show = "editor"
            this.global.drawer = true;
          }
        },
        {
          label: "Delete",
          icon: PhTrash,
          command: async () => {
            await this.global.deleteMemo(this.global.memo.id);
            this.global.fetchMemos();
          }
        }
      ],
      selectAll: false,
      memoLoading: false,
    };
  },
  methods: {
    cleanHtml(text) {
      return text.replace(/<\/?[^>]+(>|$)/g, "");
    },
    formatTime(timeString) {
      if (!timeString) return "";

      const date = new Date(`1970-01-01T${timeString}Z`); // ensures valid ISO
      if (isNaN(date.getTime())) return timeString; // fallback if invalid

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // true = 12-hour, false = 24-hour
      });
    },
    toggle(ref, event, item) {
      this.global.memo = item;
      this.$refs['overlay_menu_'].toggle(event);
    },
    toggleAll() {
      this.selectAll = !this.selectAll;
      this.global.selectedMenus = this.selectAll ? [...this.global.memos] : [];
    },
    selectList(data) {
      this.global.memo = data
      data.is_read = 1;
      this.global.content_to_show = "viewer";
      this.global.drawer = true;
    },
  }
};
</script>

<style scoped>
.memo-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--memo-background);
}

.memo-list-container {
  background-color: var(--memo-surface);
  border-radius: var(--memo-radius-md);
  box-shadow: var(--memo-shadow-sm);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--memo-border);
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.select-all-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--memo-primary-color);
  cursor: pointer;
}

.status-filter {
  min-width: 120px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  gap: 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: var(--memo-text-secondary);
  opacity: 0.5;
}

.empty-text {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--memo-text-secondary);
}

.compose-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--memo-radius-md);
  color: white;
  font-weight: 500;
  transition: var(--memo-transition);
  border: none;
  cursor: pointer;
}

.compose-btn:hover {
  background-color: var(--memo-primary-hover) !important;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.1rem;
}

.memo-list-wrapper {
  flex: 1;
  overflow-y: auto;
}

.memo-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.memo-item {
  background-color: var(--memo-surface);
  border-radius: var(--memo-radius-md);
  box-shadow: var(--memo-shadow-sm);
  transition: var(--memo-transition);
  border: 1px solid var(--memo-border);
}

.memo-item.unread {
  background-color: var(--memo-unread-bg);
  border-left: 3px solid var(--memo-primary-color);
}

.memo-item:hover {
  box-shadow: var(--memo-shadow-md);
  transform: translateY(-1px);
}

.memo-item.selected {
  border: 1px solid var(--memo-primary-color);
  background-color: rgba(59, 130, 246, 0.05);
}

.memo-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
}

.item-checkbox {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--memo-primary-color);
  cursor: pointer;
}

.memo-details {
  flex: 1;
  min-width: 0;
}

.memo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.memo-title {
  font-weight: 600;
  color: var(--memo-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.memo-status {
  display: flex;
  gap: 0.5rem;
}

.unread-badge {
  background-color: var(--memo-primary-color);
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

.status-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
}

.memo-preview {
  margin-bottom: 0.25rem;
}

.memo-content {
  color: var(--memo-text-secondary);
  font-size: 0.875rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.memo-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--memo-text-secondary);
}

.memo-type {
  font-weight: 600;
  text-transform: uppercase;
}

.memo-time {
  opacity: 0.8;
}

.memo-actions-btn {
  background: none;
  border: none;
  color: var(--memo-text-secondary);
  padding: 0.25rem;
  border-radius: 50%;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--memo-transition);
}

.memo-actions-btn:hover {
  background-color: var(--memo-border);
  color: var(--memo-text-primary);
}

.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--memo-border);
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}

/* Context Menu */
.memo-context-menu {
  box-shadow: var(--memo-shadow-lg);
  border-radius: var(--memo-radius-md);
  border: 1px solid var(--memo-border);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--memo-text-primary);
  text-decoration: none;
  transition: var(--memo-transition);
}

.menu-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--memo-primary-color);
}

.menu-icon {
  font-size: 1rem;
}
</style>