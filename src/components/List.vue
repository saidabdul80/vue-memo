<template>
  <div class="memo-app">
    <TopMenus />
    <GlobalSearch />

    <div class="memo-list-container glass-strong" :style="'min-height:'+global.config.height">
      <div class="list-controls">
        <div class="controls-left">
          <div class="checkbox-wrapper">
            <input 
              type="checkbox" 
              @change="toggleAll" 
              :checked="selectAll" 
              class="select-all-checkbox" 
              id="selectAll"
            />
            <label for="selectAll" class="checkbox-label">Select All</label>
          </div>
          <Select 
            v-model="global.filters.status" 
            :options="['ALL', 'APPROVED', 'REJECTED']" 
            class="status-filter glass"
            placeholder="Filter by status"
          >
            <template #dropdownicon>
              <PhFunnel class="filter-icon" />
            </template>
          </Select>
        </div>
      </div>
      
      <Transition name="fade" mode="out-in">
        <div v-if="global.memos.length === 0" class="empty-state slide-up">
          <div class="empty-illustration floating">
            <PhFolderOpen class="empty-icon"/>
            <div class="empty-sparkles">
              <div class="sparkle" style="--delay: 0s"></div>
              <div class="sparkle" style="--delay: 0.5s"></div>
              <div class="sparkle" style="--delay: 1s"></div>
            </div>
          </div>
          <h3 class="empty-title gradient-text">No Memos Found</h3>
          <p class="empty-description">Start your productivity journey by creating your first memo</p>
          <button 
            @click="global.compose()" 
            class="compose-btn btn-modern floating"
            style="animation-delay: 0.3s"
          >
            <PhPencil class="btn-icon" />
            <span>Create Your First Memo</span>
          </button>
        </div>

        <div v-else class="memo-list-wrapper" :style="'max-height:'+ (parseInt(global.config.height)-3)+'vh'">
          <div v-if="!memoLoading" class="memo-list">
            <TransitionGroup name="list" tag="div">
              <div 
                v-for="(memo, index) in global.memos" 
                :key="memo.id" 
                class="memo-item glass"
                :class="{
                  'selected': global.memo.id === memo.id,
                  'unread': memo.is_read === 0
                }"
                :style="{ '--delay': index * 0.05 + 's' }"
                @click="selectList(memo)"
              >
                <div class="memo-item-content">
                  <div class="memo-checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      v-model="global.selectedMenus" 
                      :value="memo" 
                      class="item-checkbox" 
                      @click.stop
                    />
                  </div>
                  
                  <div class="memo-details">
                    <div class="memo-header">
                      <div class="memo-title-section">
                        <h4 class="memo-title">{{ cleanHtml(memo.title).slice(0, 50) }}</h4>
                        <div class="memo-status">
                          <Badge v-if="memo.is_read === 0" class="unread-badge pulse">New</Badge>
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
                    </div>

                    <div class="memo-preview">
                      <p class="memo-content">{{ cleanHtml(memo.content).slice(0, 120) }}...</p>
                    </div>

                    <div class="memo-meta">
                      <div class="meta-left">
                        <span class="memo-type">{{ memo.type }}</span>
                        <span class="meta-separator">•</span>
                        <span class="memo-author">{{ memo.author || 'Unknown' }}</span>
                      </div>
                      <span class="memo-time">{{ formatTime(memo.time_at) }}</span>
                    </div>
                  </div>
                  
                  <button 
                    class="memo-actions-btn" 
                    @click.stop="toggle('overlay_menu_', $event, memo)" 
                    aria-haspopup="true" 
                    aria-controls="overlay_menu_"
                  >
                    <PhDotsThreeOutlineVertical class="actions-icon" weight="fill" />
                  </button>
                </div>
                
                <div class="memo-item-overlay"></div>
              </div>
            </TransitionGroup>
          </div>
          
          <div v-if="memoLoading" class="loading-state">
            <MemoLoader v-for="x in 5" :key="x" class="memo-loader-item scale-in" />
          </div>
        </div>
      </Transition>
      
      <div class="list-footer glass">
        <Pagination />
        <button 
          @click="global.compose()" 
          class="compose-btn btn-modern"
        >
          <PhPencil class="btn-icon" />
          <span>Compose New Memo</span>
        </button>
      </div>
    </div>
    
    <Menu 
      ref="overlay_menu_" 
      id="overlay_menu_" 
      :model="items" 
      :popup="true"
      class="memo-context-menu glass-strong"
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
  padding: var(--memo-space-md);
  gap: var(--memo-space-md);
}

.memo-list-container {
  border-radius: var(--memo-radius-2xl);
  padding: var(--memo-space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-lg);
  backdrop-filter: var(--memo-blur-lg);
  border: 1px solid var(--memo-border-light);
  box-shadow: var(--memo-shadow-xl);
  position: relative;
}

.memo-list-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--memo-gradient-primary);
  border-radius: var(--memo-radius-2xl) var(--memo-radius-2xl) 0 0;
}

.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--memo-space-md) 0;
  border-bottom: 1px solid var(--memo-border);
}

.controls-left {
  display: flex;
  align-items: center;
  gap: var(--memo-space-lg);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: var(--memo-space-sm);
}

.select-all-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--memo-primary-color);
  cursor: pointer;
  border-radius: var(--memo-radius-sm);
  transition: var(--memo-transition);
}

.select-all-checkbox:hover {
  transform: scale(1.1);
}

.checkbox-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--memo-text-secondary);
  cursor: pointer;
  user-select: none;
}

.status-filter {
  min-width: 160px;
  border-radius: var(--memo-radius-lg);
  backdrop-filter: var(--memo-blur-sm);
  border: 1px solid var(--memo-border-light);
}

.filter-icon {
  color: var(--memo-primary-color);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--memo-space-2xl) 0;
  gap: var(--memo-space-lg);
  text-align: center;
  position: relative;
}

.empty-illustration {
  position: relative;
  margin-bottom: var(--memo-space-md);
}

.empty-icon {
  font-size: 5rem;
  color: var(--memo-text-tertiary);
  opacity: 0.6;
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.2));
}

.empty-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--memo-gradient-primary);
  border-radius: 50%;
  animation: sparkle 2s ease-in-out infinite;
  animation-delay: var(--delay);
}

.sparkle:nth-child(1) {
  top: 20%;
  right: 10%;
}

.sparkle:nth-child(2) {
  top: 60%;
  left: 15%;
}

.sparkle:nth-child(3) {
  top: 30%;
  left: 80%;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

.empty-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.empty-description {
  font-size: 1.1rem;
  color: var(--memo-text-secondary);
  margin: 0;
  max-width: 400px;
  line-height: 1.6;
}

.compose-btn {
  display: flex;
  align-items: center;
  gap: var(--memo-space-sm);
  padding: var(--memo-space-md) var(--memo-space-xl);
  border-radius: var(--memo-radius-xl);
  font-weight: 600;
  font-size: 1rem;
  transition: var(--memo-transition);
  border: none;
  cursor: pointer;
  box-shadow: var(--memo-shadow-lg);
  position: relative;
  overflow: hidden;
}

.compose-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--memo-shadow-xl);
}

.compose-btn:active {
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.1rem;
}

.memo-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-right: var(--memo-space-sm);
}

.memo-list {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-md);
}

.memo-item {
  border-radius: var(--memo-radius-xl);
  transition: var(--memo-transition);
  border: 1px solid var(--memo-border-light);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.4s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateY(20px);
}

.memo-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: var(--memo-transition-slow);
  z-index: 1;
}

.memo-item:hover::before {
  left: 100%;
}

.memo-item.unread {
  border-left: 4px solid var(--memo-primary-color);
  background: var(--memo-gradient-glass);
}

.memo-item.unread::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--memo-gradient-primary);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
}

.memo-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--memo-shadow-xl);
  border-color: var(--memo-primary-color);
}

.memo-item.selected {
  border-color: var(--memo-primary-color);
  background: var(--memo-gradient-glass);
  box-shadow: var(--memo-shadow-glow);
  transform: translateY(-2px);
}

.memo-item-content {
  display: flex;
  align-items: center;
  gap: var(--memo-space-md);
  padding: var(--memo-space-lg);
  position: relative;
  z-index: 2;
}

.memo-checkbox-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--memo-primary-color);
  cursor: pointer;
  border-radius: var(--memo-radius-sm);
  transition: var(--memo-transition);
}

.item-checkbox:hover {
  transform: scale(1.15);
}

.memo-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-sm);
}

.memo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--memo-space-md);
}

.memo-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-xs);
}

.memo-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--memo-text-primary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.memo-status {
  display: flex;
  gap: var(--memo-space-sm);
  flex-wrap: wrap;
}

.unread-badge {
  background: var(--memo-gradient-primary);
  color: var(--memo-text-inverse);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: var(--memo-radius-full);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  box-shadow: var(--memo-shadow-sm);
}

.status-tag {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: var(--memo-radius-full);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.memo-preview {
  margin: var(--memo-space-xs) 0;
}

.memo-content {
  color: var(--memo-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.memo-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--memo-text-tertiary);
}

.meta-left {
  display: flex;
  align-items: center;
  gap: var(--memo-space-sm);
}

.memo-type {
  font-weight: 700;
  text-transform: uppercase;
  color: var(--memo-primary-color);
  background: rgba(99, 102, 241, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: var(--memo-radius-sm);
}

.meta-separator {
  color: var(--memo-text-tertiary);
  opacity: 0.5;
}

.memo-author {
  font-weight: 500;
}

.memo-time {
  font-weight: 500;
  opacity: 0.8;
}

.memo-actions-btn {
  background: none;
  border: none;
  color: var(--memo-text-tertiary);
  padding: var(--memo-space-sm);
  border-radius: var(--memo-radius-full);
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--memo-transition);
  position: relative;
}

.memo-actions-btn:hover {
  background: var(--memo-gradient-glass);
  color: var(--memo-text-primary);
  transform: scale(1.1);
  box-shadow: var(--memo-shadow-sm);
}

.actions-icon {
  font-size: 1.25rem;
}

.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--memo-space-lg) 0;
  border-top: 1px solid var(--memo-border);
  backdrop-filter: var(--memo-blur-sm);
  border-radius: var(--memo-radius-lg);
  padding: var(--memo-space-lg);
  margin-top: var(--memo-space-lg);
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-md);
}

.memo-context-menu {
  box-shadow: var(--memo-shadow-xl);
  border-radius: var(--memo-radius-xl);
  border: 1px solid var(--memo-border-light);
  backdrop-filter: var(--memo-blur-lg);
  padding: var(--memo-space-sm);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--memo-space-sm);
  padding: var(--memo-space-sm) var(--memo-space-md);
  color: var(--memo-text-primary);
  text-decoration: none;
  transition: var(--memo-transition);
  border-radius: var(--memo-radius-md);
  font-weight: 500;
}

.menu-item:hover {
  background: var(--memo-gradient-glass);
  color: var(--memo-primary-color);
  transform: translateX(4px);
}

.menu-icon {
  font-size: 1rem;
}

/* Animations */
@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 960px) {
  .memo-app {
    padding: var(--memo-space-sm);
  }
  
  .memo-list-container {
    padding: var(--memo-space-lg);
    border-radius: var(--memo-radius-xl);
  }
  
  .memo-item-content {
    padding: var(--memo-space-md);
    gap: var(--memo-space-sm);
  }
  
  .memo-title {
    font-size: 1rem;
  }
  
  .memo-content {
    font-size: 0.85rem;
  }
  
  .list-footer {
    flex-direction: column;
    gap: var(--memo-space-md);
  }
  
  .compose-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .memo-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--memo-space-sm);
  }
  
  .memo-status {
    align-self: flex-start;
  }
  
  .memo-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--memo-space-xs);
  }
}
</style>