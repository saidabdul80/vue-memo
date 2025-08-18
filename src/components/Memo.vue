<template>
  <div class="memo-app-container">
    <div class="list-container">
      <List />
    </div>
    
    <Drawer
      v-model:visible="store.drawer"
      :position="store.isMdUp ? 'right' : 'bottom'"
      @hide="store.content_to_show = 'viewer'"
      :class="['memo-drawer', { 'desktop-drawer': store.isMdUp }]"
    >
      <template #header>
        <div class="drawer-header">
          <Transition name="fade" mode="out-in">
            <div v-if="store.content_to_show == 'editor'" class="editor-actions">
              <h3 class="drawer-title">
                {{ store.memo?.id ? 'Edit Memo' : 'New Memo' }}
              </h3>
              <ButtonGroup class="action-buttons">
                <Button
                  :loading="buttonLoading.includes('SUBMITTED')"
                  @click="sendMemo('SUBMITTED')"
                  :label="store.memo?.id == null ? 'Send Memo' : 'Update Memo'"
                  :severity="store.memo?.id == null ? 'primary' : 'warning'"
                  class="action-btn"
                />
                <Button
                  v-if="store.memo?.id == null"
                  :loading="buttonLoading.includes('DRAFT')"
                  @click="sendMemo('DRAFT')"
                  label="Save as Draft"
                  severity="secondary"
                  class="action-btn"
                />
              </ButtonGroup>
            </div>
            
            <div v-else class="viewer-actions">
              <h3 class="drawer-title">Memo Details</h3>
              <ButtonGroup class="action-buttons">
                <Button
                  v-if="!store.isMyMemo(store.memo)"
                  severity="secondary"
                  @click="store.make_comment = true; store.comment = null"
                  class="action-btn"
                >
                  <template #icon>
                    <PhPencil />
                  </template>
                  <span>Add Comment</span>
                </Button>
                <Button
                  v-else
                  severity="secondary"
                  @click="store.content_to_show = 'editor'"
                  class="action-btn"
                >
                  <template #icon>
                    <PhPencil />
                  </template>
                  <span>Edit Memo</span>
                </Button>
                <Button
                  v-if="!store.isMyMemo(store.memo) && store.memo.type == 'REQUEST'"
                  :disabled="approver.status == 'APPROVED'"
                  :loading="buttonLoading.includes('APPROVED')"
                  @click="sendMemo('APPROVED')"
                  class="action-btn"
                  severity="success"
                >
                  <template #icon>
                    <PhCheckCircle />
                  </template>
                  <span>Approve</span>
                </Button>
                <Button
                  v-if="!store.isMyMemo(store.memo) && store.memo.type == 'REQUEST'"
                  :disabled="approver.status == 'REJECTED'"
                  :loading="buttonLoading.includes('REJECTED')"
                  @click="sendMemo('REJECTED')"
                  class="action-btn"
                  severity="danger"
                >
                  <template #icon>
                    <PhXCircle />
                  </template>
                  <span>Reject</span>
                </Button>
              </ButtonGroup>
            </div>
          </Transition>
        </div>
      </template>
      
      <Content />
    </Drawer>
    
    <NotificationRoot />
  </div>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import Content from "./Content.vue";
import List from "./List.vue";
import Drawer from "primevue/drawer";
import Button from "primevue/button";
import { PhPencil, PhCheckCircle, PhXCircle } from "@phosphor-icons/vue";
import ButtonGroup from "primevue/buttongroup";
import NotificationRoot from "./notifications/NotificationRoot.vue";
import { useClient } from "@/stores/client";

export default {
  components: {
    Content,
    Drawer,
    List,
    Button,
    ButtonGroup,
    NotificationRoot,
    PhPencil,
    PhCheckCircle,
    PhXCircle,
  },
  data() {
    return {
      store: useGlobalsStore(),
      buttonLoading: [],
    };
  },
  created() {
    this.store.config = this.$memoglobals;
    console.log(this.store.config);
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
        return [];
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
      this.store.currentSize = window.innerWidth;
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateScreenSize);
  },
};
</script>

<style scoped>
.memo-app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.list-container {
  flex: 1;
}

.memo-drawer {
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-lg);
  box-shadow: var(--memo-shadow-xl);
  border: 1px solid var(--memo-border-light);
  border-radius: var(--memo-radius-2xl) 0 0 var(--memo-radius-2xl);
  transition: var(--memo-transition);
  overflow: hidden;
  position: relative;
}

.memo-drawer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--memo-gradient-primary);
  z-index: 1;
}

.memo-drawer.desktop-drawer {
  width: var(--memo-drawer-width);
  height: 100%;
}

.drawer-header {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-md);
  padding: var(--memo-space-xl);
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-md);
  border-bottom: 1px solid var(--memo-border-light);
  position: relative;
  z-index: 2;
}

.drawer-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: var(--memo-gradient-primary);
  opacity: 0.3;
}

.drawer-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--memo-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
}

.editor-actions,
.viewer-actions {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-lg);
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--memo-space-md);
}

.action-btn {
  flex: 1 1 auto;
  min-width: 140px;
  padding: var(--memo-space-md) var(--memo-space-lg);
  border-radius: var(--memo-radius-xl);
  font-weight: 600;
  font-size: 0.9rem;
  transition: var(--memo-transition);
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--memo-space-sm);
  box-shadow: var(--memo-shadow-sm);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: var(--memo-transition-slow);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--memo-shadow-lg);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:active {
  transform: translateY(-1px);
}

/* Primary button styles */
.action-btn[severity="primary"],
.action-btn[class*="primary"] {
  background: var(--memo-gradient-primary);
  color: var(--memo-text-inverse);
  box-shadow: var(--memo-shadow-glow);
}

.action-btn[severity="primary"]:hover {
  box-shadow: var(--memo-shadow-glow-hover);
}

/* Secondary button styles */
.action-btn[severity="secondary"] {
  background: var(--memo-surface-glass);
  color: var(--memo-text-primary);
  border: 1px solid var(--memo-border-light);
  backdrop-filter: var(--memo-blur-sm);
}

.action-btn[severity="secondary"]:hover {
  background: var(--memo-surface);
  border-color: var(--memo-primary-color);
  color: var(--memo-primary-color);
}

/* Success button styles */
.action-btn[severity="success"] {
  background: var(--memo-gradient-success);
  color: var(--memo-text-inverse);
}

/* Danger button styles */
.action-btn[severity="danger"] {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: var(--memo-text-inverse);
}

/* Warning button styles */
.action-btn[severity="warning"] {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: var(--memo-text-inverse);
}

/* Button icons */
.action-btn svg {
  font-size: 1.1rem;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  :root {
    --memo-drawer-width: 100%;
    --memo-drawer-header-height: auto;
  }
  
  .drawer-header {
    padding: var(--memo-space-lg);
  }
  
  .drawer-title {
    font-size: 1.25rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    min-width: unset;
  }
}

/* Focus states */
.action-btn:focus-visible {
  outline: 2px solid var(--memo-primary-color);
  outline-offset: 2px;
}

/* Loading states */
.action-btn[data-loading="true"] {
  pointer-events: none;
  opacity: 0.8;
}

.action-btn[data-loading="true"]::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Hover effects for different button types */
.action-btn[severity="primary"]:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
}

.action-btn[severity="success"]:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.action-btn[severity="danger"]:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.action-btn[severity="warning"]:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}
</style>
<!-- <style>
:root {
  --vm-prime-button-primary-background: v-bind(store.config.colors.primary);
}
.menu-active {
  color: var(--vm-prime-button-primary-background);
  border-bottom: 3px solid var(--vm-prime-button-primary-background);
  background: #0001;
  border-radius: 5px 5px 0 0;
  height: 100% !important;
  transition: all 0.5s !important;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style> -->
