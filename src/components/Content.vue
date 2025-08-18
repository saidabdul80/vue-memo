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
  @apply vm-p-6 vm-h-full vm-overflow-y-auto;
}

.memo-viewer, .memo-editor {
  @apply vm-flex vm-flex-col vm-gap-6;
}

.memo-details-card, .memo-body-card {
  @apply vm-rounded-2xl vm-p-6 vm-backdrop-blur-xl;
  background: var(--memo-glass-primary);
  border: 1px solid var(--memo-glass-border);
  box-shadow: var(--memo-shadow-glass);
}

.memo-details-card:hover, .memo-body-card:hover {
  @apply vm-transform vm-scale-[1.01];
  background: var(--memo-glass-secondary);
  box-shadow: var(--memo-shadow-floating);
}

.memo-type-badge {
  @apply vm-text-white vm-px-4 vm-py-2 vm-rounded-xl vm-text-sm vm-font-bold vm-shadow-lg;
  background: var(--memo-primary-gradient);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.memo-meta p {
  @apply vm-mt-3 vm-text-text-secondary vm-text-base;
}

.memo-title {
  @apply vm-text-3xl vm-font-bold vm-mb-6;
  background: var(--memo-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.memo-content {
  @apply vm-prose vm-prose-lg;
  color: var(--memo-text-primary);
}

.memo-tabs {
  @apply vm-mt-6;
}

.tab-headers {
  @apply vm-flex vm-rounded-xl vm-p-1;
  background: var(--memo-glass-secondary);
  backdrop-filter: var(--memo-backdrop-blur);
  border: 1px solid var(--memo-glass-border);
}

.tab-headers button {
  @apply vm-flex-1 vm-px-6 vm-py-3 vm-rounded-lg vm-text-text-secondary;
  @apply vm-font-medium vm-transition-all vm-duration-300;
}

.tab-headers button:hover {
  @apply vm-text-text-primary vm-transform vm-scale-105;
  background: var(--memo-glass-primary);
}

.tab-headers button.active {
  @apply vm-text-primary vm-font-semibold;
  background: var(--memo-primary-gradient);
  color: white;
  box-shadow: var(--memo-shadow-glow);
}

.tab-content {
  @apply vm-py-6;
}

.comment-section, .log-section {
  @apply vm-flex vm-flex-col vm-gap-4;
}

.comment-item, .log-item {
  @apply vm-p-6 vm-rounded-2xl vm-relative vm-backdrop-blur-lg;
  @apply vm-transition-all vm-duration-300;
  background: var(--memo-glass-secondary);
  border: 1px solid var(--memo-glass-border);
  box-shadow: var(--memo-shadow-glass);
}

.comment-item:hover, .log-item:hover {
  @apply vm-transform vm-scale-[1.01];
  background: var(--memo-glass-primary);
}

.comment-header, .log-header {
  @apply vm-flex vm-justify-between vm-items-center vm-mb-3 vm-text-text-secondary;
}

.comment-time, .log-time {
  @apply vm-text-xs vm-font-medium;
}

.comment-body, .log-body {
  @apply vm-text-text-primary vm-leading-relaxed;
}

.comment-editor {
  @apply vm-w-full vm-p-4 vm-rounded-xl vm-backdrop-blur-sm;
  @apply vm-text-text-primary vm-resize-none vm-transition-all vm-duration-300;
  @apply focus:vm-outline-none focus:vm-ring-2 focus:vm-ring-primary focus:vm-ring-opacity-50;
  background: var(--memo-glass-secondary);
  border: 1px solid var(--memo-glass-border);
  min-height: 120px;
}

.comment-actions {
  @apply vm-flex vm-justify-end vm-gap-3 vm-mt-4;
}

.comment-owner-actions {
  @apply vm-absolute vm-top-4 vm-right-4 vm-flex vm-gap-2;
}

.form-grid {
  @apply vm-grid vm-grid-cols-1 md:vm-grid-cols-2 vm-gap-6 vm-mb-6;
}

.form-field-full {
  @apply vm-col-span-full;
}

.form-field label {
  @apply vm-block vm-font-semibold vm-mb-3 vm-text-text-primary vm-text-sm vm-uppercase vm-tracking-wide;
}

.form-input, .form-select {
  @apply vm-w-full vm-p-4 vm-rounded-xl vm-backdrop-blur-sm;
  @apply vm-text-text-primary vm-transition-all vm-duration-300;
  @apply focus:vm-outline-none focus:vm-ring-2 focus:vm-ring-primary focus:vm-ring-opacity-50;
  background: var(--memo-glass-secondary);
  border: 1px solid var(--memo-glass-border);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.form-input:focus, .form-select:focus {
  background: var(--memo-glass-primary);
  box-shadow: var(--memo-shadow-glow);
}

.form-input.error, .form-select.error {
  border-color: var(--memo-error);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.error-text {
  @apply vm-text-error vm-text-sm vm-mt-2 vm-font-medium;
}

.multi-select {
  @apply vm-flex vm-flex-col vm-gap-3 vm-p-4 vm-rounded-xl vm-backdrop-blur-sm;
  background: var(--memo-glass-secondary);
  border: 1px solid var(--memo-glass-border);
  max-height: 200px;
  overflow-y: auto;
}

.multi-select-option {
  @apply vm-flex vm-items-center vm-gap-3 vm-p-2 vm-rounded-lg vm-transition-all vm-duration-200;
  @apply hover:vm-bg-white/10;
}

.comment-drawer-overlay {
  @apply vm-fixed vm-inset-0 vm-bg-black/30 vm-z-40 vm-backdrop-blur-sm;
}

.comment-drawer {
  @apply vm-fixed vm-top-0 vm-right-0 vm-h-full vm-z-50 vm-transform vm-translate-x-full;
  @apply vm-transition-all vm-duration-500 vm-ease-out;
  width: 60%;
  background: var(--memo-glass-primary);
  backdrop-filter: var(--memo-backdrop-blur);
  border: 1px solid var(--memo-glass-border);
  box-shadow: var(--memo-shadow-glass);
}

.comment-drawer.is-open {
  @apply vm-translate-x-0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .form-grid {
    @apply vm-grid-cols-1;
  }
  
  .comment-drawer {
    width: 90%;
  }
  
  .memo-content-container {
    @apply vm-p-4;
  }
}
</style>
