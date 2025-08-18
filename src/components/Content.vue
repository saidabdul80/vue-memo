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
import Badge from "primevue/badge";
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
    Badge,
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
  padding: var(--memo-space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-xl);
  height: 100%;
  overflow-y: auto;
}

.memo-header-panel {
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-md);
  border-radius: var(--memo-radius-xl);
  box-shadow: var(--memo-shadow-md);
  border: 1px solid var(--memo-border-light);
  overflow: hidden;
  position: relative;
}

.memo-header-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--memo-gradient-accent);
}

.memo-header-content {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-md);
  padding: var(--memo-space-lg);
}

.memo-type {
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--memo-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--memo-space-sm);
}

.memo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--memo-space-lg);
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--memo-space-sm);
  padding: var(--memo-space-sm) var(--memo-space-md);
  background: var(--memo-surface-glass);
  border-radius: var(--memo-radius-lg);
  border: 1px solid var(--memo-border-light);
  backdrop-filter: var(--memo-blur-sm);
}

.meta-label {
  font-weight: 700;
  color: var(--memo-text-primary);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.025em;
}

.meta-value {
  color: var(--memo-text-secondary);
  font-weight: 500;
}

.memo-content-panel {
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-md);
  border-radius: var(--memo-radius-xl);
  box-shadow: var(--memo-shadow-lg);
  border: 1px solid var(--memo-border-light);
  overflow: hidden;
  position: relative;
}

.memo-content-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--memo-gradient-subtle);
  opacity: 0.6;
}

.memo-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--memo-text-primary);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.025em;
  padding: var(--memo-space-lg) var(--memo-space-xl) 0;
}

.memo-body {
  line-height: 1.7;
  color: var(--memo-text-primary);
  padding: var(--memo-space-lg) var(--memo-space-xl) var(--memo-space-xl);
  font-size: 1.05rem;
}

.memo-body :deep(p) {
  margin-bottom: var(--memo-space-lg);
}

.memo-body :deep(a) {
  color: var(--memo-primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: var(--memo-transition);
  position: relative;
}

.memo-body :deep(a::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--memo-gradient-primary);
  transition: var(--memo-transition);
}

.memo-body :deep(a:hover::after) {
  width: 100%;
}

.memo-body :deep(a:hover) {
  background: var(--memo-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.memo-tabs {
  display: flex;
  background: var(--memo-surface-glass);
  border-radius: var(--memo-radius-xl);
  padding: var(--memo-space-sm);
  backdrop-filter: var(--memo-blur-sm);
  border: 1px solid var(--memo-border-light);
  box-shadow: var(--memo-shadow-sm);
  position: relative;
  overflow: hidden;
}

.memo-tabs::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--memo-gradient-primary);
  opacity: 0.3;
}

.tab-btn {
  position: relative;
  padding: var(--memo-space-md) var(--memo-space-lg);
  background: none;
  border: none;
  font-weight: 600;
  color: var(--memo-text-secondary);
  cursor: pointer;
  transition: var(--memo-transition);
  display: flex;
  align-items: center;
  gap: var(--memo-space-sm);
  border-radius: var(--memo-radius-lg);
  font-size: 0.9rem;
  min-height: 44px;
}

.tab-btn:hover {
  color: var(--memo-primary-color);
  background: var(--memo-gradient-glass);
  transform: scale(1.02);
}

.tab-btn.active {
  color: var(--memo-text-inverse);
  background: var(--memo-gradient-primary);
  box-shadow: var(--memo-shadow-glow);
  transform: scale(1.02);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: var(--memo-text-inverse);
  border-radius: var(--memo-radius-full);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

.tab-badge {
  background: var(--memo-gradient-accent);
  color: var(--memo-text-inverse);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: var(--memo-radius-full);
  min-width: 24px;
  text-align: center;
  box-shadow: var(--memo-shadow-sm);
}

.tab-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: var(--memo-text-inverse);
}

.comments-section, .activity-log {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-xl);
}

.comment-item {
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-md);
  border-radius: var(--memo-radius-xl);
  padding: var(--memo-space-xl);
  box-shadow: var(--memo-shadow-md);
  border: 1px solid var(--memo-border-light);
  position: relative;
  overflow: hidden;
  transition: var(--memo-transition);
}

.comment-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--memo-gradient-primary);
  opacity: 0.6;
}

.comment-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--memo-shadow-lg);
}

.comment-item.reply {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: var(--memo-space-lg) 0;
}

.comment-item.reply::before {
  display: none;
}

.comment-content {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-lg);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: var(--memo-space-md);
}

.author-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--memo-text-primary);
  background: var(--memo-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.comment-time {
  font-size: 0.8rem;
  color: var(--memo-text-tertiary);
  background: var(--memo-surface-glass);
  padding: 0.2rem 0.6rem;
  border-radius: var(--memo-radius-full);
  backdrop-filter: var(--memo-blur-sm);
}

.comment-actions {
  display: flex;
  gap: var(--memo-space-sm);
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--memo-radius-full);
  border: none;
  cursor: pointer;
  transition: var(--memo-transition);
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-sm);
}

.edit-btn:hover {
  background: var(--memo-gradient-glass);
  color: var(--memo-primary-color);
  transform: scale(1.1);
  box-shadow: var(--memo-shadow-sm);
}

.delete-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
  color: var(--memo-error);
  transform: scale(1.1);
  box-shadow: var(--memo-shadow-sm);
}

.comment-text {
  line-height: 1.6;
  color: var(--memo-text-primary);
  font-size: 1rem;
}

.comment-edit {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-lg);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--memo-space-md);
}

.save-btn, .cancel-btn {
  padding: var(--memo-space-sm) var(--memo-space-lg);
  border-radius: var(--memo-radius-lg);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: var(--memo-transition);
}

.save-btn {
  background: var(--memo-gradient-primary);
  color: var(--memo-text-inverse);
  box-shadow: var(--memo-shadow-glow);
}

.save-btn:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
  transform: translateY(-2px);
  box-shadow: var(--memo-shadow-glow-hover);
}

.cancel-btn {
  background: var(--memo-surface-glass);
  color: var(--memo-text-secondary);
  border: 1px solid var(--memo-border-light);
}

.cancel-btn:hover {
  background: var(--memo-surface);
  color: var(--memo-text-primary);
  border-color: var(--memo-primary-color);
}

.reply-content {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-md);
  margin-left: var(--memo-space-2xl);
  position: relative;
}

.reply-content::before {
  content: '';
  position: absolute;
  left: -1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--memo-gradient-accent);
  border-radius: var(--memo-radius-full);
}

.reply-header {
  display: flex;
  align-items: center;
  gap: var(--memo-space-md);
}

.reply-icon {
  width: 1.5rem;
  height: 1.5rem;
  filter: drop-shadow(0 0 4px rgba(99, 102, 241, 0.3));
}

.reply-meta {
  display: flex;
  align-items: center;
  gap: var(--memo-space-md);
  font-size: 0.9rem;
}

.reply-type {
  font-weight: 700;
  color: var(--memo-primary-color);
  background: rgba(99, 102, 241, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: var(--memo-radius-md);
  text-transform: uppercase;
  font-size: 0.75rem;
}

.reply-time {
  color: var(--memo-text-tertiary);
}

.reply-panel {
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-md);
  border-radius: var(--memo-radius-xl);
  box-shadow: var(--memo-shadow-md);
  border: 1px solid var(--memo-border-light);
}

.reply-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--memo-text-primary);
  padding: var(--memo-space-lg) var(--memo-space-xl) 0;
}

.reply-body {
  line-height: 1.6;
  color: var(--memo-text-primary);
  padding: var(--memo-space-md) var(--memo-space-xl) var(--memo-space-xl);
}

.log-item {
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-md);
  border-radius: var(--memo-radius-xl);
  padding: var(--memo-space-xl);
  box-shadow: var(--memo-shadow-md);
  border: 1px solid var(--memo-border-light);
  position: relative;
  transition: var(--memo-transition);
}

.log-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--memo-gradient-accent);
  opacity: 0.6;
}

.log-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--memo-shadow-lg);
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-sm);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-author {
  font-weight: 700;
  color: var(--memo-text-primary);
  font-size: 1.1rem;
}

.log-time {
  font-size: 0.8rem;
  color: var(--memo-text-tertiary);
  background: var(--memo-surface-glass);
  padding: 0.2rem 0.6rem;
  border-radius: var(--memo-radius-full);
  backdrop-filter: var(--memo-blur-sm);
}

.log-text {
  color: var(--memo-text-primary);
  font-size: 1rem;
  line-height: 1.5;
}

.text-approved {
  color: var(--memo-success);
  font-weight: 700;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: var(--memo-radius-sm);
}

.text-rejected {
  color: var(--memo-error);
  font-weight: 700;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: var(--memo-radius-sm);
}

.text-pending {
  color: var(--memo-warning);
  font-weight: 700;
  background: rgba(245, 158, 11, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: var(--memo-radius-sm);
}

/* Editor Styles */
.memo-editor {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-xl);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--memo-space-lg) 0;
  border-bottom: 2px solid var(--memo-border);
  position: relative;
}

.editor-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60%;
  height: 2px;
  background: var(--memo-gradient-primary);
}

.editor-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: var(--memo-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--memo-space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-sm);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--memo-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-input, .form-select, .form-multiselect {
  width: 100%;
  padding: var(--memo-space-md);
  border: 2px solid var(--memo-border-light);
  border-radius: var(--memo-radius-lg);
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-sm);
  transition: var(--memo-transition);
  font-size: 1rem;
}

.form-input:focus,
.form-select:focus,
.form-multiselect:focus {
  border-color: var(--memo-primary-color);
  background: var(--memo-surface);
  box-shadow: var(--memo-shadow-glow);
  transform: scale(1.02);
  outline: none;
}

.invalid {
  border-color: var(--memo-error) !important;
  background: rgba(239, 68, 68, 0.05) !important;
}

.error-message {
  color: var(--memo-error);
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.3rem 0.6rem;
  border-radius: var(--memo-radius-md);
}

.comment-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-lg);
}

.comment-drawer.md-size {
  width: 70%;
}

.drawer-header {
  padding: var(--memo-space-xl);
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-md);
  border-bottom: 1px solid var(--memo-border-light);
}

.drawer-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--memo-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--memo-space-md);
  padding: var(--memo-space-xl);
  border-top: 1px solid var(--memo-border-light);
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-md);
}

.footer-btn {
  padding: var(--memo-space-md) var(--memo-space-xl);
  border-radius: var(--memo-radius-xl);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: var(--memo-transition);
  min-width: 120px;
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: scaleY(0.95);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 2000px;
  transform: scaleY(1);
}

/* Responsive Design */
@media (max-width: 960px) {
  .memo-viewer, .memo-editor {
    padding: var(--memo-space-lg);
  }
  
  .memo-title {
    font-size: 1.5rem;
  }
  
  .memo-type {
    font-size: 1.25rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .reply-content {
    margin-left: var(--memo-space-lg);
  }
}
</style>