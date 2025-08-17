<template>
  <Transition name="slide-fade" mode="out-in">
    <div v-if="global.content_to_show == 'viewer'" class="memo-viewer">
      <Panel class="memo-header-panel">
        <template #header>
          <div class="memo-header-content">
            <span class="memo-type" :style="{ color: `var(--memo-primary-color)` }">
              #{{ global.memo?.type }}
            </span>
            <div class="memo-meta">
              <div class="meta-item">
                <span class="meta-label">From:</span>
                <span class="meta-value">{{ global.memo?.owner?.full_name || "Unknown" }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Department:</span>
                <span class="meta-value">{{ global.memo?.departments?.join(", ") || "N/A" }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Date:</span>
                <span class="meta-value">{{ formatDate(global.memo?.updated_at) }}</span>
              </div>
            </div>
          </div>
        </template>
      </Panel>

      <Panel class="memo-content-panel">
        <template #header>
          <h2 class="memo-title">{{ global.memo?.title }}</h2>
        </template>
        <div class="memo-body" v-html="global.memo?.content"></div>
      </Panel>

      <div class="memo-tabs">
        <button 
          class="tab-btn" 
          :class="{ 'active': show_comment }" 
          @click="toggleTab('comment')"
        >
          <span>Comments</span>
          <Badge v-if="global.memo?.comments?.length" class="tab-badge">
            {{ global.memo.comments.length }}
          </Badge>
        </button>
        <button 
          class="tab-btn" 
          :class="{ 'active': show_log }" 
          @click="toggleTab('log')"
        >
          Activity Log
        </button>
      </div>

      <Transition name="expand">
        <div v-if="show_comment" class="comments-section">
          <div 
            v-for="comment in global.memo.comments" 
            :key="comment.id" 
            class="comment-item"
            :class="{ 'reply': comment.is_owner }"
          >
            <div v-if="!comment.is_owner" class="comment-content">
              <div class="comment-header">
                <div class="comment-author">
                  <span class="author-name">{{ comment.full_name }}</span>
                  <span class="comment-time">{{ formatTime(comment.time_at) }}</span>
                </div>
                <div v-if="global.user.id === comment.approver_id" class="comment-actions">
                  <Button 
                    @click="editComment(comment)" 
                    icon="pi pi-pencil" 
                    class="action-btn edit-btn"
                    text
                  />
                  <Button 
                    @click="deleteComment(comment.id)" 
                    icon="pi pi-trash" 
                    class="action-btn delete-btn"
                    text
                  />
                </div>
              </div>
              
              <Transition name="fade" mode="out-in">
                <div v-if="editingCommentId === comment.id" class="comment-edit">
                  <Editor v-model="editedCommentContent" editorStyle="height: 120px" />
                  <div class="edit-actions">
                    <Button 
                      @click="saveEditedComment(comment)" 
                      label="Save" 
                      class="save-btn"
                      :style="{ backgroundColor: `var(--memo-primary-color)` }"
                    />
                    <Button 
                      @click="cancelEdit" 
                      label="Cancel" 
                      class="cancel-btn"
                      severity="secondary"
                    />
                  </div>
                </div>
                <div v-else class="comment-text" v-html="comment.comment"></div>
              </Transition>
            </div>
            
            <div v-else class="reply-content">
              <div class="reply-header">
                <img src="@/assets/reply.png" class="reply-icon" />
                <div class="reply-meta">
                  <span class="reply-type">#{{ comment.type }}</span>
                  <span class="reply-time">{{ formatTime(comment.updated_at) }}</span>
                </div>
              </div>
              <Panel class="reply-panel">
                <template #header>
                  <h3 class="reply-title">{{ comment.title }}</h3>
                </template>
                <div class="reply-body" v-html="comment.comment"></div>
              </Panel>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="expand">
        <div v-if="show_log" class="activity-log">
          <div 
            v-for="log in global.memo.logs" 
            :key="log.id" 
            class="log-item"
          >
            <div class="log-content">
              <div class="log-header">
                <span class="log-author">{{ log.full_name }}</span>
                <span class="log-time">{{ formatTime(log.time_at) }}</span>
              </div>
              <div class="log-text">
                Status changed to: <strong :class="statusClass(log.status)">{{ log.status }}</strong>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div v-else class="memo-editor">
      <div class="editor-header">
        <h2 class="editor-title">
          {{ global.memo?.id ? 'Edit Memo' : 'Create New Memo' }}
        </h2>
      </div>
      
      <div class="form-grid">
        <div class="form-group full-width">
          <label class="form-label">Memo Subject</label>
          <InputText
            v-model="global.memo.title"
            placeholder="Enter memo subject"
            class="form-input"
            :class="{ 'invalid': global.nameRules?.title }"
          />
          <small v-if="global.nameRules?.title" class="error-message">
            {{ global.nameRules?.title?.join(", ") }}
          </small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Type</label>
          <Select
            v-model="global.memo.type"
            :options="global.types"
            placeholder="Select type"
            class="form-select"
            :class="{ 'invalid': global.nameRules?.type }"
          />
          <small v-if="global.nameRules?.type" class="error-message">
            {{ global.nameRules?.type?.join(", ") }}
          </small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Department</label>
          <MultiSelect
            v-model="global.memo.department_id"
            :options="global.departments"
            optionLabel="name"
            optionValue="id"
            placeholder="Select departments"
            class="form-multiselect"
            :class="{ 'invalid': global.nameRules?.department }"
            :disabled="global.memo.type === 'REQUEST'"
          />
          <small v-if="global.nameRules?.department" class="error-message">
            {{ global.nameRules?.department?.join(", ") }}
          </small>
        </div>
        
        <div class="form-group full-width">
          <label class="form-label">Approvers</label>
          <MultiSelect
            v-model="approvers"
            :options="global.members"
            optionLabel="full_name"
            placeholder="Select approvers"
            display="chip"
            class="form-multiselect"
            :maxSelectedLabels="3"
          />
        </div>
      </div>
      
      <MemoEditor
        v-model="global.memo.content"
        :nameRules="global.nameRules"
      />
    </div>
  </Transition>

  <Drawer
    v-model:visible="global.make_comment"
    :position="global.isMdUp ? 'right' : 'bottom'"
    @hide="global.content_to_show = 'viewer'"
    :class="['comment-drawer', { 'md-size': global.isMdUp }]"
  >
    <template #header>
      <div class="drawer-header">
        <h3>Add Comment</h3>
      </div>
    </template>
    
    <MemoEditor
      :reply="true"
      v-model="global.comment"
      :nameRules="global.nameRules"
    />
    
    <template #footer>
      <div class="drawer-footer">
        <Button
          label="Cancel"
          severity="secondary"
          @click="global.make_comment = false"
          class="footer-btn"
        />
        <Button
          label="Post Comment"
          :loading="buttonLoading"
          @click="sendComment"
          class="footer-btn"
          :style="{ backgroundColor: `var(--memo-primary-color)` }"
        />
      </div>
    </template>
  </Drawer>
</template>

<script>
import { useClient } from "@/stores/client";
import { useGlobalsStore } from "@/stores/globals";
import Card from "primevue/card";
import Editor from "primevue/editor";
import InputText from "primevue/inputtext";
import Panel from "primevue/panel";
import Select from "primevue/select";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";
import MemoEditor from "./MemoEditor.vue";
import Drawer from "primevue/drawer";
import ButtonGroup from "primevue/buttongroup";
import { PhArrowBendUpLeft, PhPencil, PhTrash } from "@phosphor-icons/vue";

export default {
  components: {
    Panel,
    Editor,
    Card,
    InputText,
    Select,
    MultiSelect,
    Button,
    MemoEditor,
    Drawer,
    ButtonGroup,
    PhArrowBendUpLeft,
    PhPencil,
    PhTrash
  },
  data() {
    return {
      global: useGlobalsStore(),
      searchInput: "",
      isLoading: false,
      editor: null,
      buttonLoading:false,
      show_comment:false,
      show_log:false,
      editingCommentId: null,
      editedCommentContent: '',
    };
  },
  computed: {
    approver() {
      if (
        this.global &&
        this.global.memo &&
        Array.isArray(this.global.memo.approvers) &&
        this.global.user
      ) {
        return this.global.memo.approvers.find(
          (approver) =>
            approver.approver_id === this.global.user.id &&
            approver.approver_type === this.global.user.user_type
        );
      } else {
        return [];
      }
    },
    approvers: {
      get() {
        if (!this.global.memo?.approvers) {
          this.global.memo.approvers = [];
          return [];
        }
        return this.global.memo.approvers.map((item) => item.key); // Return keys for the MultiSelect
      },
      set(selectedKeys) {
        // Create a Set from the selected keys for easy lookup
        const selectedKeySet = new Set(selectedKeys);
        // Update approvers in global.memo

        if (
          !this.global.memo?.stored_approvers &&
          this.global.memo.approvers.length > 0
        ) {
          this.global.memo.stored_approvers = [...this.global.memo.approvers]; // Copy existing approvers
        }

        this.global.memo.approvers = this.global.memo.approvers.filter(
          (existing) => selectedKeySet.has(existing.key)
        );
        //console.log(this.global.memo.approvers, selectedKeySet, selectedKeys)
        // Add new approvers to the global.members if they don't already exist
        const old = new Set(this.global.memo.approvers.map((item) => item.key));
        const filtered = selectedKeys.filter((existing) => !old.has(existing));
        filtered.forEach((selectedKey) => {
          const newMember = { key: selectedKey, ...selectedKey };
          const index = this.global.memo?.stored_approvers?.findIndex(
            (a) =>
              a.key.approver_id == selectedKey.approver_id &&
              a.key.approver_type == selectedKey.approver_type
          );
          console.log(index, 111);
          if (index == -1 || index === undefined) {
            this.global.memo.approvers.push(newMember);
          } else {
            this.global.memo.approvers.push({
              ...this.global.memo.stored_approvers[index],
            });
          }
        });
      },
    },
  },

  methods: {
    view(name){
      
      if(name=='comment'){
        this.show_log = false;
        this.show_comment = !this.show_comment
      }

      if(name=='log'){
        this.show_comment = false;
        this.show_log = !this.show_log
      }
    },
    async sendComment(){
      this.buttonLoading = true
      const response = await useClient().http({
            method: "post",
            path: this.global.config.makeCommentRoute,
            data: { 
              memo_id: this.global.memo.id,
              comment: this.global.comment,
             },
          });
      this.buttonLoading = false
      this.global.make_comment = false
      this.global.fetchMemos(null, this.global.filters)
    },
    getInstance(editor) {
      const instance = editor.instance;
      instance.setContents(
        instance.clipboard.convert({
          html: this.global.memo.content,
        })
      );
    },
    async asyncFind(event) {
      clearTimeout(this.typingTimer);
      if (this.searchInput === "") return;

      this.typingTimer = setTimeout(async () => {
        this.isLoading = true;
        try {
          const response = await useClient().http({
            method: "get",
            path: this.global.config.getMembersRoute,
            data: { search: this.searchInput },
          });
          this.options = response ? response.data : [];
        } finally {
          this.isLoading = false;
        }
      }, 500);
    },
    editComment(comment) {
        this.editingCommentId = comment.id;
        this.editedCommentContent = comment.comment;
    },
    async saveEditedComment(comment) {
        await this.global.updateComment(comment.id, this.editedCommentContent);
        this.editingCommentId = null;
        this.editedCommentContent = '';
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
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        // Example: "August 16, 2025"
      } catch (e) {
        return dateString;
      }
    },
    formatTime(timeString) {
      if (!timeString) return '';
      try {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        // Example: "02:45 PM"
      } catch (e) {
        return timeString;
      }
    },
    toggleTab(tab) {
      if (tab === 'comment') {
        this.show_log = false;
        this.show_comment = !this.show_comment;
      } else {
        this.show_comment = false;
        this.show_log = !this.show_log;
      }
    },
    statusClass(status) {
      return {
        'text-approved': status === 'APPROVED',
        'text-rejected': status === 'REJECTED',
        'text-pending': status === 'PENDING'
      };
    },
  },
};
</script>

<style scoped>
.memo-viewer, .memo-editor {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.memo-header-panel {
  background-color: var(--memo-surface);
  border-radius: var(--memo-radius-md);
  box-shadow: var(--memo-shadow-sm);
  border: 1px solid var(--memo-border);
}

.memo-header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.memo-type {
  font-size: 1.25rem;
  font-weight: 600;
  text-transform: uppercase;
}

.memo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  gap: 0.25rem;
}

.meta-label {
  font-weight: 600;
  color: var(--memo-text-primary);
}

.meta-value {
  color: var(--memo-text-secondary);
}

.memo-content-panel {
  background-color: var(--memo-surface);
  border-radius: var(--memo-radius-md);
  box-shadow: var(--memo-shadow-sm);
  border: 1px solid var(--memo-border);
}

.memo-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--memo-text-primary);
  margin: 0;
}

.memo-body {
  line-height: 1.6;
  color: var(--memo-text-primary);
}

.memo-body :deep(p) {
  margin-bottom: 1rem;
}

.memo-body :deep(a) {
  color: var(--memo-primary-color);
  text-decoration: none;
}

.memo-body :deep(a:hover) {
  text-decoration: underline;
}

.memo-tabs {
  display: flex;
  border-bottom: 1px solid var(--memo-border);
  margin-bottom: 1rem;
}

.tab-btn {
  position: relative;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  font-weight: 500;
  color: var(--memo-text-secondary);
  cursor: pointer;
  transition: var(--memo-transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  color: var(--memo-primary-color);
}

.tab-btn.active {
  color: var(--memo-primary-color);
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--memo-primary-color);
}

.tab-badge {
  background-color: var(--memo-primary-color);
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

.comments-section, .activity-log {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  background-color: var(--memo-surface);
  border-radius: var(--memo-radius-md);
  padding: 1rem;
  box-shadow: var(--memo-shadow-sm);
  border: 1px solid var(--memo-border);
}

.comment-item.reply {
  background-color: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.comment-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-name {
  font-weight: 600;
  color: var(--memo-text-primary);
}

.comment-time {
  font-size: 0.75rem;
  color: var(--memo-text-secondary);
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.edit-btn:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--memo-primary-color);
}

.delete-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--memo-error);
}

.comment-text {
  line-height: 1.6;
  color: var(--memo-text-primary);
}

.comment-edit {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.save-btn, .cancel-btn {
  padding: 0.5rem 1rem;
  border-radius: var(--memo-radius-md);
}

.save-btn {
  color: white;
}

.reply-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 2rem;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reply-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.reply-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.reply-type {
  font-weight: 600;
  color: var(--memo-primary-color);
}

.reply-time {
  color: var(--memo-text-secondary);
}

.reply-panel {
  background-color: var(--memo-surface);
  border-radius: var(--memo-radius-md);
  box-shadow: var(--memo-shadow-sm);
  border: 1px solid var(--memo-border);
}

.reply-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--memo-text-primary);
}

.reply-body {
  line-height: 1.6;
  color: var(--memo-text-primary);
}

.log-item {
  background-color: var(--memo-surface);
  border-radius: var(--memo-radius-md);
  padding: 1rem;
  box-shadow: var(--memo-shadow-sm);
  border: 1px solid var(--memo-border);
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.log-author {
  font-weight: 600;
  color: var(--memo-text-primary);
}

.log-time {
  font-size: 0.75rem;
  color: var(--memo-text-secondary);
}

.log-text {
  color: var(--memo-text-primary);
}

.text-approved {
  color: var(--memo-success);
}

.text-rejected {
  color: var(--memo-error);
}

.text-pending {
  color: var(--memo-warning);
}

.memo-editor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--memo-text-primary);
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--memo-text-primary);
}

.form-input, .form-select, .form-multiselect {
  width: 100%;
}

.invalid {
  border-color: var(--memo-error) !important;
}

.error-message {
  color: var(--memo-error);
  font-size: 0.75rem;
}

.comment-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.comment-drawer.md-size {
  width: 60%;
}

.drawer-header {
  padding: 1rem;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--memo-border);
}

.footer-btn {
  padding: 0.5rem 1rem;
  border-radius: var(--memo-radius-md);
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>