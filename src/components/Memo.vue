<template>
  <div class="memo-app-container">
    <div class="list-container">
      <List />
    </div>
    
    <div v-if="store.drawer" class="memo-drawer-overlay" @click="store.drawer = false"></div>
    <div :class="['memo-drawer', { 'is-open': store.drawer, 'is-desktop': store.isMdUp }]">
      <div class="drawer-header">
        <h3 class="drawer-title">
          <span v-if="store.content_to_show === 'editor'">{{ store.memo?.id ? 'Edit Memo' : 'New Memo' }}</span>
          <span v-else>Memo Details</span>
        </h3>
        <button @click="store.drawer = false" class="close-button">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <div class="drawer-content">
        <Content />
      </div>
      <div class="drawer-footer">
        <Transition name="fade" mode="out-in">
          <div v-if="store.content_to_show === 'editor'" class="action-buttons">
            <button :disabled="buttonLoading.includes('SUBMITTED')" @click="sendMemo('SUBMITTED')" class="btn btn-primary">
              {{ store.memo?.id == null ? 'Send Memo' : 'Update Memo' }}
            </button>
            <button v-if="store.memo?.id == null" :disabled="buttonLoading.includes('DRAFT')" @click="sendMemo('DRAFT')" class="btn btn-secondary">
              Save as Draft
            </button>
          </div>
          <div v-else class="action-buttons">
            <button v-if="!store.isMyMemo(store.memo)" @click="store.make_comment = true; store.comment = null" class="btn btn-secondary">
              Add Comment
            </button>
            <button v-else @click="store.content_to_show = 'editor'" class="btn btn-secondary">
              Edit Memo
            </button>
            <button v-if="!store.isMyMemo(store.memo) && store.memo.type == 'REQUEST'" :disabled="approver.status == 'APPROVED'" @click="sendMemo('APPROVED')" class="btn btn-success">
              Approve
            </button>
            <button v-if="!store.isMyMemo(store.memo) && store.memo.type == 'REQUEST'" :disabled="approver.status == 'REJECTED'" @click="sendMemo('REJECTED')" class="btn btn-danger">
              Reject
            </button>
          </div>
        </Transition>
      </div>
    </div>
    <NotificationRoot />
  </div>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import Content from "./Content.vue";
import List from "./List.vue";
import NotificationRoot from "./notifications/NotificationRoot.vue";
import { useClient } from "@/stores/client";

export default {
  components: {
    Content,
    List,
    NotificationRoot,
  },
  data() {
    return {
      store: useGlobalsStore(),
      buttonLoading: [],
    };
  },
  created() {
    this.store.config = this.$memoglobals;
    this.updateScreenSize();
    window.addEventListener("resize", this.updateScreenSize);
    this.store.boot();
  },
  watch: {
    config: {
      handler(c) {
        const config = this.deepMerge(this.store.config, c);
        this.store.config = config;
      },
      deep: true,
    },
  },
  computed: {
    approver() {
      if (
        this.store &&
        this.store.memo &&
        Array.isArray(this.store.memo.approvers) &&
        this.store.bootload?.user
      ) {
        return this.store.memo.approvers.find(
          (approver) =>
            approver.approver_id === this.store.bootload.user.id &&
            approver.approver_type === this.store.bootload.user.user_type
        );
      } else {
        return {};
      }
    },
  },
  methods: {
    async sendMemo(status = "SUBMITTED") {
      this.buttonLoading.push(status);

      const memo = { ...this.store.memo };
      if (!this.store.isMyMemo(this.store.memo)) {
        const ap = { ...this.approver };
        ap.status = status;
        memo.approvers = [ap];
      } else {
        memo.status = status;
      }

      const res = await useClient().http({
        method: "post",
        path: this.store.config.memosRoute,
        data: memo,
      });
      if (res) {
        this.store.fetchMemos();
        this.store.drawer = false;
        this.store.memo = res;
      }
      const index = this.buttonLoading.indexOf(status);
      if (index !== -1) {
        this.buttonLoading.splice(index, 1);
      }
    },
    deepMerge(target, source) {
      for (const key in source) {
        if (source[key] instanceof Object && key in target) {
          Object.assign(
            source[key],
            this.deepMerge(target[key], source[key])
          );
        }
      }
      return { ...target, ...source };
    },
    updateScreenSize() {
      this.store.isMdUp = window.innerWidth >= 961;
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateScreenSize);
  },
};
</script>

<style>

:root {
  /* Enhanced Theme Variables with Glass-morphism Support */
  --memo-primary-color: #3b82f6;
  --memo-primary-hover: #2563eb;
  --memo-secondary-color: #64748b;
  --memo-background: #f8fafc;
  --memo-surface: #ffffff;
  --memo-border: #e2e8f0;
  --memo-text-primary: #1e293b;
  --memo-text-secondary: #64748b;
  --memo-error: #ef4444;
  --memo-success: #10b981;
  --memo-warning: #f59e0b;
  --memo-info: #3b82f6;
  --memo-unread-bg: #f0f9ff;
  
  /* Modern Glass-morphism Variables */
  --memo-glass-primary: rgba(255, 255, 255, 0.1);
  --memo-glass-secondary: rgba(255, 255, 255, 0.05);
  --memo-glass-border: rgba(255, 255, 255, 0.2);
  --memo-backdrop-blur: blur(16px);
  
  /* Enhanced Shadow System */
  --memo-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --memo-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --memo-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --memo-shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  --memo-shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);
  --memo-shadow-floating: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* Modern Border Radius */
  --memo-radius-sm: 0.25rem;
  --memo-radius-md: 0.375rem;
  --memo-radius-lg: 0.5rem;
  --memo-radius-modern: 1rem;
  --memo-radius-xl: 1.5rem;
  
  /* Enhanced Transitions */
  --memo-transition: all 0.2s ease-in-out;
  --memo-transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --memo-transition-bounce: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Drawer Variables */
  --memo-drawer-width: 60%;
  --memo-drawer-bg: var(--memo-glass-primary);
  --memo-drawer-header-bg: var(--memo-glass-secondary);
  --memo-drawer-shadow: var(--memo-shadow-glass);
  --memo-drawer-border: 1px solid var(--memo-glass-border);
  --memo-drawer-header-height: 60px;
  --memo-action-btn-gap: 0.5rem;
  --memo-height: 80vh;
  
  /* Gradient Backgrounds */
  --memo-bg-gradient: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  --memo-primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --memo-accent-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --memo-surface-gradient: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
}

.memo-app-container {
  @apply vm-flex vm-h-screen vm-overflow-hidden;
}

.list-container {
  @apply vm-flex-1 vm-overflow-y-auto vm-p-6;
}

.memo-drawer-overlay {
  @apply vm-fixed vm-inset-0 vm-z-40 vm-backdrop-blur-sm;
  animation: fadeIn 0.3s ease-out;
}

.memo-drawer {
  @apply vm-fixed vm-top-0 vm-right-0 vm-h-full vm-z-50 vm-transform vm-translate-x-full;
  @apply vm-transition-all vm-duration-500 vm-ease-out;
  width: var(--memo-drawer-width, 80%);
  background: var(--memo-drawer-bg);
  backdrop-filter: var(--memo-backdrop-blur);
  border: var(--memo-drawer-border);
  box-shadow: var(--memo-drawer-shadow);
}

.memo-drawer.is-open {
  @apply vm-translate-x-0;
}

.memo-drawer.is-desktop {
  width: var(--memo-drawer-width, 60%);
}

.drawer-header {
  @apply vm-flex vm-items-center vm-justify-between vm-p-6;
  @apply vm-border-b vm-border-white/20;
  background: var(--memo-drawer-header-bg);
  backdrop-filter: var(--memo-backdrop-blur);
}

.drawer-title {
  @apply vm-text-xl vm-font-bold vm-text-text-primary;
  background: var(--memo-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-button {
  @apply vm-p-2 vm-rounded-xl vm-text-text-secondary vm-transition-all vm-duration-300;
  @apply hover:vm-text-text-primary hover:vm-bg-white/10 hover:vm-scale-110;
  @apply focus:vm-outline-none focus:vm-ring-2 focus:vm-ring-primary focus:vm-ring-opacity-50;
}

.drawer-content {
  @apply vm-p-6 vm-overflow-y-auto;
  height: calc(100% - 140px);
}

.drawer-footer {
  @apply vm-p-6 vm-border-t vm-border-white/20;
  background: var(--memo-drawer-header-bg);
  backdrop-filter: var(--memo-backdrop-blur);
}

.action-buttons {
  @apply vm-flex vm-gap-3 vm-flex-wrap;
}

.btn {
  @apply vm-px-6 vm-py-3 vm-rounded-xl vm-font-semibold vm-transition-all vm-duration-300;
  @apply vm-shadow-lg hover:vm-shadow-xl vm-transform hover:vm-scale-105;
  @apply focus:vm-outline-none focus:vm-ring-2 focus:vm-ring-offset-2;
}

.btn-primary {
  background: var(--memo-primary-gradient);
  @apply vm-text-white vm-border vm-border-white/20;
  @apply hover:vm-shadow-glow focus:vm-ring-primary focus:vm-ring-opacity-50;
}

.btn-secondary {
  @apply vm-bg-white/10 vm-text-text-primary vm-border vm-border-white/20;
  @apply hover:vm-bg-white/20 focus:vm-ring-secondary focus:vm-ring-opacity-50;
  backdrop-filter: var(--memo-backdrop-blur);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  @apply vm-text-white vm-border vm-border-white/20;
  @apply focus:vm-ring-success focus:vm-ring-opacity-50;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  @apply vm-text-white vm-border vm-border-white/20;
  @apply focus:vm-ring-error focus:vm-ring-opacity-50;
}

/* Enhanced Transitions */
.fade-enter-active,
.fade-leave-active {
  @apply vm-transition-all vm-duration-500;
}

.fade-enter-from,
.fade-leave-to {
  @apply vm-opacity-0 vm-transform vm-scale-95;
}

/* Loading animation for buttons */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.btn:disabled {
  @apply vm-opacity-60 vm-cursor-not-allowed;
  animation: pulse 2s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
