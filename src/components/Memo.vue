<template>
  <div>
    <div class="">
      <div class="xl:vm-col-span-3">
        <List />
      </div>
    </div>
    <div class="md:!vm-hidden vm-block">
      <Drawer
        v-model:visible="store.drawer"
        :position="store.isMdUp ? 'right' : 'bottom'"
        @hide="store.content_to_show = 'viewer'"
        :class="store.isMdUp ? '!vm-w-[60%] !vm-h-full' : ''"
        style="height: auto"
      >
        <template #header>
          <div v-if="store.content_to_show == 'editor'" class="vm-mb-3 vm-mt-4">
            <ButtonGroup>
              <Button
                size="small"
                :loading="buttonLoading.includes('SUBMITTED')"
                @click="sendMemo('SUBMITTED')"
                :label="store.memo?.id == null ? 'Send Memo' : 'Update Memo'"
                :severity="store.memo?.id == null ? 'primary' : 'warn'"
              />
              <Button
                size="small"
                v-if="store.memo?.id == null"
                :loading="buttonLoading.includes('DRAFT')"
                @click="sendMemo('DRAFT')"
                label="Save as Draft"
                severity="secondary"
              />
            </ButtonGroup>
          </div>
          <div v-else>
            <ButtonGroup>
              <Button
                v-if="!store.isMyMemo(store.memo)"
                size="small"
                severity="secondary"
                @click="store.make_comment = true; store.comment = null"
                label="Make Comment">
                <template #icon>
                  <PhPencil />
                </template>
              </Button>
              <Button
                v-else
                size="small"
                severity="secondary"
                @click="store.content_to_show = 'editor'"
                label="Update Memo">
                <template #icon>
                  <PhPencil />
                </template>
              </Button>
              <Button
                v-if="!store.isMyMemo(store.memo) && store.memo.type == 'REQUEST'"
                :disabled="approver.status == 'APPROVED'"
                size="small"
                severity="primary"
                :loading="buttonLoading.includes('APPROVED')"
                @click="sendMemo('APPROVED')"
                label="Approve"
              >
              <template #icon>
              <PhCheckCircle />
            </template>
            </Button>
              <Button
                v-if="!store.isMyMemo(store.memo) && store.memo.type == 'REQUEST'"
                :disabled="approver.status == 'REJECTED'"
                size="small"
                severity="danger"
                :loading="buttonLoading.includes('REJECTED')"
                icon="PhXCircle"
                @click="sendMemo('REJECTED')"
                label="Reject"
              >
              <template #icon>
              <PhXCircle />
            </template>
            </Button>
            </ButtonGroup>
          </div>
        </template>
        <Content />
      </Drawer>
    </div>
  </div>
  <NotificationRoot />
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
  props: {
    user: {
      type: Object,
      default: () => ({}),
    },
  },
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
    this.store.fetchData();
    this.store.fetchMembers();
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
        this.store.user
      ) {
        return this.store.memo.approvers.find(
          (approver) =>
            approver.approver_id === this.store.user.id &&
            approver.approver_type === this.store.user.user_type
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

<style>
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
</style>
