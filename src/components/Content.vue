<template>
  <div class="memo-content-container">
    <Transition name="slide-up" mode="out-in">
      <div v-if="global.content_to_show === 'viewer'" class="memo-viewer">
        <div class="memo-details-card">
          <div class="memo-type-badge">{{ global.memo?.type }}</div>
          <div class="memo-meta">
            <p><strong>From:</strong> {{ global.memo?.owner?.full_name || "Jamiyu Yusuf" }}</p>
            <p><strong>Department:</strong> {{ global.memo?.departments?.join(", ") }}</p>
            <p><strong>Date:</strong> {{ global.memo?.updated_at }}</p>
          </div>
        </div>

        <div class="memo-body-card">
          <h3 class="memo-title">{{ global.memo?.title }}</h3>
          <div class="memo-content" v-html="global.memo?.content"></div>
        </div>

        <div class="memo-tabs">
          <div class="tab-headers">
            <button @click="activeTab = 'comments'" :class="{ 'active': activeTab === 'comments' }">Comments</button>
            <button @click="activeTab = 'logs'" :class="{ 'active': activeTab === 'logs' }">Logs</button>
          </div>
          <div class="tab-content">
            <div v-if="activeTab === 'comments'" class="comment-section">
              <div v-for="comment in global.memo.comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <strong>{{ comment?.full_name }}</strong>
                  <span class="comment-time">{{ comment.time_at }}</span>
                </div>
                <div v-if="editingCommentId === comment.id">
                  <textarea v-model="editedCommentContent" class="comment-editor"></textarea>
                  <div class="comment-actions">
                    <button @click="saveEditedComment(comment)" class="btn btn-primary">Save</button>
                    <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
                  </div>
                </div>
                <div v-else class="comment-body" v-html="comment.comment"></div>
                <div class="comment-owner-actions" v-if="global.user.id === comment.approver_id">
                  <button @click="editComment(comment)" class="btn-icon"><i class="pi pi-pencil"></i></button>
                  <button @click="deleteComment(comment.id)" class="btn-icon btn-danger"><i class="pi pi-trash"></i></button>
                </div>
              </div>
            </div>
            <div v-if="activeTab === 'logs'" class="log-section">
              <div v-for="log in global.memo.logs" :key="log.id" class="log-item">
                <div class="log-header">
                  <strong>{{ log?.full_name }}</strong>
                  <span class="log-time">{{ log.time_at }}</span>
                </div>
                <div class="log-body">Memo status changed to: <strong>{{ log.status }}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="memo-editor">
        <div class="form-grid">
          <div class="form-field-full">
            <label for="memo-subject">Memo Subject</label>
            <input id="memo-subject" type="text" v-model="global.memo.title" placeholder="Title" class="form-input" :class="{ 'error': !!global.nameRules?.title }" />
            <small v-if="global.nameRules?.title" class="error-text">{{ global.nameRules.title.join(", ") }}</small>
          </div>
          <div class="form-field">
            <label>Type</label>
            <select v-model="global.memo.type" class="form-select" :class="{ 'error': !!global.nameRules?.type }">
              <option v-for="type in global.types" :key="type" :value="type">{{ type }}</option>
            </select>
            <small v-if="global.nameRules?.type" class="error-text">{{ global.nameRules.type.join(", ") }}</small>
          </div>
          <div class="form-field">
            <label>Department</label>
            <select v-model="global.memo.department_id" class="form-select" :disabled="global.memo.type === 'REQUEST'" :class="{ 'error': !!global.nameRules?.department }">
              <option v-for="dept in global.departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
            <small v-if="global.nameRules?.department" class="error-text">{{ global.nameRules.department.join(", ") }}</small>
          </div>
          <div class="form-field-full">
            <label>Manage Approvers</label>
            <div class="multi-select">
              <div v-for="approver in global.members" :key="approver?.full_name?.replace(' ','-')" class="multi-select-option">
                <input type="checkbox" :value="approver" v-model="approvers" />
                <span>{{ approver.full_name }}</span>
              </div>
            </div>
          </div>
        </div>
        <MemoEditor v-model="global.memo.content" :nameRules="global.nameRules" />
      </div>
    </Transition>

    <div v-if="global.make_comment" class="comment-drawer-overlay" @click="global.make_comment = false"></div>
    <div :class="['comment-drawer', { 'is-open': global.make_comment }]">
      <div class="drawer-header">
        <h3 class="drawer-title">Add Comment</h3>
        <button @click="global.make_comment = false" class="close-button">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <div class="drawer-content">
        <MemoEditor :reply="true" v-model="global.comment" :nameRules="global.nameRules" />
      </div>
      <div class="drawer-footer">
        <button :disabled="buttonLoading" @click="sendComment" class="btn btn-primary">Send Comment</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useClient } from "@/stores/client";
import { useGlobalsStore } from "@/stores/globals";
import MemoEditor from "./MemoEditor.vue";

export default {
  components: {
    MemoEditor,
  },
  data() {
    return {
      global: useGlobalsStore(),
      buttonLoading: false,
      editingCommentId: null,
      editedCommentContent: '',
      activeTab: 'comments',
    };
  },
  computed: {
    approvers: {
      get() {
        if (!this.global.memo?.approvers) {
          this.global.memo.approvers = [];
          return [];
        }
        return this.global.memo.approvers.map((item) => item.key);
      },
      set(selectedKeys) {
        const selectedKeySet = new Set(selectedKeys);
        if (!this.global.memo?.stored_approvers && this.global.memo.approvers.length > 0) {
          this.global.memo.stored_approvers = [...this.global.memo.approvers];
        }
        this.global.memo.approvers = this.global.memo.approvers.filter((existing) => selectedKeySet.has(existing.key));
        const old = new Set(this.global.memo.approvers.map((item) => item.key));
        const filtered = selectedKeys.filter((existing) => !old.has(existing));
        filtered.forEach((selectedKey) => {
          const newMember = { key: selectedKey, ...selectedKey };
          const index = this.global.memo?.stored_approvers?.findIndex(
            (a) => a.key.approver_id == selectedKey.approver_id && a.key.approver_type == selectedKey.approver_type
          );
          if (index === -1 || index === undefined) {
            this.global.memo.approvers.push(newMember);
          } else {
            this.global.memo.approvers.push({ ...this.global.memo.stored_approvers[index] });
          }
        });
      },
    },
  },
  methods: {
    async sendComment() {
      this.buttonLoading = true;
      await useClient().http({
        method: "post",
        path: this.global.config.makeCommentRoute,
        data: {
          memo_id: this.global.memo.id,
          comment: this.global.comment,
        },
      });
      this.buttonLoading = false;
      this.global.make_comment = false;
      this.global.fetchMemos(null, this.global.filters);
    },
    editComment(comment) {
      this.editingCommentId = comment.id;
      this.editedCommentContent = comment.comment;
    },
    async saveEditedComment(comment) {
      await this.global.updateComment(comment.id, this.editedCommentContent);
      this.cancelEdit();
      this.global.fetchMemos(null, this.global.filters);
    },
    cancelEdit() {
      this.editingCommentId = null;
      this.editedCommentContent = '';
    },
    async deleteComment(commentId) {
      await this.global.deleteComment(commentId);
      this.global.fetchMemos(null, this.global.filters);
    },
  },
};
</script>

<style scoped>
.memo-content-container {
  @apply vm-p-4 vm-h-full vm-overflow-y-auto;
}
.memo-viewer, .memo-editor {
  @apply vm-flex vm-flex-col vm-gap-6;
}
.memo-details-card, .memo-body-card {
  @apply vm-bg-surface vm-rounded-lg vm-shadow-md vm-p-6;
}
.memo-type-badge {
  @apply vm-bg-primary vm-text-white vm-px-3 vm-py-1 vm-rounded-md vm-text-sm vm-font-semibold;
}
.memo-meta p {
  @apply vm-mt-2 vm-text-text-secondary;
}
.memo-title {
  @apply vm-text-2xl vm-font-bold vm-text-text-primary vm-mb-4;
}
.memo-content {
  @apply vm-prose;
}
.memo-tabs {
  @apply vm-mt-4;
}
.tab-headers {
  @apply vm-flex vm-border-b;
}
.tab-headers button {
  @apply vm-px-4 vm-py-2 vm-text-text-secondary hover:vm-text-text-primary;
}
.tab-headers button.active {
  @apply vm-border-b-2 vm-border-primary vm-text-primary;
}
.tab-content {
  @apply vm-py-4;
}
.comment-section, .log-section {
  @apply vm-flex vm-flex-col vm-gap-4;
}
.comment-item, .log-item {
  @apply vm-bg-background vm-p-4 vm-rounded-md vm-relative;
}
.comment-header, .log-header {
  @apply vm-flex vm-justify-between vm-items-center vm-mb-2 vm-text-text-secondary;
}
.comment-time, .log-time {
  @apply vm-text-xs;
}
.comment-body, .log-body {
  @apply vm-text-text-primary;
}
.comment-editor {
  @apply vm-w-full vm-p-2 vm-border vm-rounded-md;
}
.comment-actions {
  @apply vm-flex vm-justify-end vm-gap-2 vm-mt-2;
}
.comment-owner-actions {
  @apply vm-absolute vm-top-2 vm-right-2 vm-flex;
}
.form-grid {
  @apply vm-grid vm-grid-cols-2 vm-gap-6 vm-mb-6;
}
.form-field-full {
  @apply vm-col-span-2;
}
.form-field label {
  @apply vm-block vm-font-semibold vm-mb-2 vm-text-text-primary;
}
.form-input, .form-select {
  @apply vm-w-full vm-p-2 vm-border vm-rounded-md vm-bg-background focus:vm-outline-none focus:vm-ring-2 focus:vm-ring-primary;
}
.form-input.error, .form-select.error {
  @apply vm-border-error;
}
.error-text {
  @apply vm-text-error vm-text-sm vm-mt-1;
}
.multi-select {
  @apply vm-flex vm-flex-col vm-gap-2;
}
.multi-select-option {
  @apply vm-flex vm-items-center vm-gap-2;
}
.comment-drawer-overlay {
  @apply vm-fixed vm-inset-0 vm-bg-black vm-bg-opacity-50 vm-z-40;
}
.comment-drawer {
  @apply vm-fixed vm-top-0 vm-right-0 vm-h-full vm-bg-surface vm-shadow-lg vm-z-50 vm-transform vm-translate-x-full vm-transition-transform vm-duration-300 vm-ease-in-out;
  width: 60%;
}
.comment-drawer.is-open {
  @apply vm-translate-x-0;
}
</style>
