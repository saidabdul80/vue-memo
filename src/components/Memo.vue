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
  --memo-primary-color: #3b82f6;
  --memo-primary-hover: #a5c1ff;
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
  --memo-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --memo-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --memo-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --memo-radius-sm: 0.25rem;
  --memo-radius-md: 0.375rem;
  --memo-radius-lg: 0.5rem;
  --memo-transition: all 0.2s ease-in-out;
  --memo-drawer-width: 60%;
  --memo-drawer-bg: var(--memo-surface);
  --memo-drawer-header-bg: var(--memo-surface);
  --memo-drawer-shadow: var(--memo-shadow-lg);
  --memo-drawer-border: 1px solid var(--memo-border);
  --memo-drawer-header-height: 60px;
  --memo-action-btn-gap: 0.5rem;
  --memo-height: 80vh;
}

.memo-app-container {
  @apply vm-flex vm-h-screen vm-overflow-hidden vm-bg-background;
}

.list-container {
  @apply vm-flex-1 vm-overflow-y-auto vm-p-4;
}

.memo-drawer-overlay {
  @apply vm-fixed vm-inset-0 vm-bg-black vm-bg-opacity-50 vm-z-40;
}

.memo-drawer {
  @apply vm-fixed vm-top-0 vm-right-0 vm-h-full vm-bg-surface vm-shadow-lg vm-z-50 vm-transform vm-translate-x-full vm-transition-transform vm-duration-300 vm-ease-in-out;
  width: var(--memo-drawer-width, 80%);
}

.memo-drawer.is-open {
  @apply vm-translate-x-0;
}

.memo-drawer.is-desktop {
  width: var(--memo-drawer-width, 60%);
}

.drawer-header {
  @apply vm-flex vm-items-center vm-justify-between vm-p-4 vm-border-b;
}

.drawer-title {
  @apply vm-text-lg vm-font-semibold vm-text-text-primary;
}

.close-button {
  @apply vm-text-text-secondary hover:vm-text-text-primary;
}

.drawer-content {
  @apply vm-p-4 vm-overflow-y-auto;
  height: calc(100% - 120px);
}

.drawer-footer {
  @apply vm-p-4 vm-border-t;
}

.action-buttons {
  @apply vm-flex vm-gap-2;
}

.btn {
  @apply vm-px-4 vm-py-2 vm-rounded-md vm-font-semibold vm-transition-colors;
}

.btn-primary {
  @apply vm-bg-primary vm-text-white hover:vm-bg-primary-hover;
}

.btn-secondary {
  @apply vm-bg-secondary vm-text-white hover:vm-bg-opacity-80;
}

.btn-success {
  @apply vm-bg-success vm-text-white hover:vm-bg-opacity-80;
}

.btn-danger {
  @apply vm-bg-error vm-text-white hover:vm-bg-opacity-80;
}

.fade-enter-active,
.fade-leave-active {
  @apply vm-transition-opacity vm-duration-300;
}

.fade-enter-from,
.fade-leave-to {
  @apply vm-opacity-0;
}
</style>
