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
  background-color: var(--memo-drawer-bg);
  box-shadow: var(--memo-drawer-shadow);
  border: var(--memo-drawer-border);
  transition: var(--memo-transition);
}

.memo-drawer.desktop-drawer {
  width: var(--memo-drawer-width);
  height: 100%;
}

.drawer-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--memo-drawer-header-bg);
  border-bottom: var(--memo-drawer-border);
}

.drawer-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--memo-text-primary);
}

.editor-actions,
.viewer-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--memo-action-btn-gap);
}

.action-btn {
  flex: 1 1 auto;
  min-width: 120px;
  white-space: nowrap;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  :root {
    --memo-drawer-width: 100%;
    --memo-drawer-header-height: auto;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
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
