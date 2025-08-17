<template>
  <Transition name="slide-up" mode="out-in">
    <div
      v-if="global.content_to_show == 'viewer'"
      class="vm-h-[80vm] vm-overflow-auto">
      <Panel class="vm-border-0">
        <template #header>
          <div v-if="!global.drawer"></div>
        </template>
        <span
          :style="`color:${global.config.colors?.primary}`"
          class="vm-text-lg vm-uppercase vm-font-bold"
        >
          #{{ global.memo?.type }}
        </span>
        
        <p class="vm-text-sm vm-capitalize">
          <b>From:</b> {{ global.memo?.owner?.full_name || "Jamiyu Yusuf" }}
        </p>
        <p class="vm-text-sm vm-capitalize vm-mb-2">
          <b>Department:</b> {{ global.memo?.departments.join(",") }}
        </p>
        <p class="vm-text-sm vm-capitalize vm-mb-2">
          <b>Date:</b> {{ global.memo?.updated_at }}
        </p>
      </Panel>
      <Panel>
        <template #header>
          <span class="vm-text-lg vm-uppercase vm-font-bold">{{
            global.memo?.title
          }}</span>
        </template>
        <div class="vm-overflow-auto" v-html="global.memo?.content"></div>
      </Panel>
      <div class="vm-flex vm-gap-5">
      <p class="vm-text-sm vm-underline vm-cursor-pointer vm-font-bold vm-mt-4 vm-mb-3" @click="view('comment')">
        <span v-if="show_comment">Hide</span>
        <span v-else>View</span>
        Comments
      </p>
      <p class="vm-text-sm vm-underline vm-cursor-pointer vm-font-bold vm-mt-4 vm-mb-3" @click="view('log')">
        <span v-if="show_log">Hide</span>
        <span v-else>View</span>
        Logs
      </p>
    </div>
      
      <Transition name="slide-up" mode="out-in">
        <div v-if="show_comment">
          <div v-for="comment in global.memo.comments" class="vm-mb-5 ">
        
              <div v-if="!comment.is_owner" class=" vm-bg-gray-50 vm-p-3">
                <div class="vm-flex vm-justify-between vm-items-center">
                  <div class="vm-flex vm-justify-center">  
                    <p class="vm-text-xs vm-font-bold"><{{ comment.full_name }}></p>
                    <p class="vm-text-xs vm-ms-2">{{ comment.time_at }}</p>
                  </div>
                  <div class="vm-flex vm-gap-2">
                    <Button v-if="global.user.id === comment.approver_id" @click="editComment(comment)" icon="pi pi-pencil" class="vm-p-button-sm vm-p-button-text" />
                    <Button v-if="global.user.id === comment.approver_id" @click="deleteComment(comment.id)" icon="pi pi-trash" class="vm-p-button-sm vm-p-button-text vm-p-button-danger" />
                  </div>
                </div>
                <div v-if="editingCommentId === comment.id">
                  <Editor v-model="editedCommentContent" editorStyle="height: 100px" />
                  <div class="vm-flex vm-justify-end vm-gap-2 vm-mt-2">
                    <Button @click="saveEditedComment(comment)" label="Save" class="vm-p-button-sm" />
                    <Button @click="cancelEdit" label="Cancel" class="vm-p-button-sm vm-p-button-secondary" />
                  </div>
                </div>
                <div v-else class="vm-text-sm" v-html="comment.comment"></div>
              </div>
              <div v-else>
                <div>
                  <div class="vm-flex vm-items-center vm-text-sm">
                    <img src="@/assets/reply.png" style="width: 20px; height: 20px;" /> <{{ comment?.updated_at }}>
                    <span class="vm-text-lg vm-uppercase vm-font-bold">#{{ comment?.type }}</span>
                  </div>
                  <p class="vm-text-sm vm-capitalize vm-mb-2">
                    <b>Department:</b> {{ comment?.departments.join(",") }}
                  </p>
                </div>
                <Panel>
                  <template #header>
                    <span class="vm-text-lg vm-uppercase vm-font-bold">{{
                      comment?.title
                    }}</span>
                  </template>
                  <div class="vm-overflow-auto" v-html="comment?.comment"></div>
                </Panel>
              </div>
            </div>
        </div>
      </Transition>
      <Transition name="slide-up" mode="out-in">
        <div v-if="show_log">
          <div v-for="log in global.memo.logs" class="vm-mb-5 ">
                <div class="vm-flex vm-justify-center">  
                  <p class="vm-text-xs vm-font-bold"><{{ log.full_name }}></p>
                  <p class="vm-text-xs vm-ms-2">{{ log.time_at }}</p>
                </div>
                <div class="vm-text-sm">Memo Status changed to: <b>{{ log.status }}</b> </div>
        
            </div>
        </div>
      </Transition>
    </div>
    <div v-else>
      <div class="vm-border-0 vm-pb-[18px]">
        <div class="vm-grid md:vm-grid-cols-2 vm-gap-3">
          <div class="md:vm-col-span-2">
            <div class="vm-mb-3">
              <label
                class="vm-text-xs vm-font-bold vm-text-gray-600"
                for="username"
                >Memo Subject</label
              >
              <InputText
                :invalid="this.global.nameRules?.title"
                v-model="global.memo.title"
                class="vm-h-[38px] vm-w-full"
                placeholder="Title"
              />
              <small
                v-if="this.global.nameRules?.title"
                class="vm-text-[#d13333]"
                id="username-help"
                >{{ this.global.nameRules?.title?.join(",") }}</small
              >
            </div>
          </div>
          <div class="vm-mb-3">
            <p class="vm-text-xs vm-font-bold vm-text-gray-600">Type</p>
            <Select
              :invalid="global.nameRules?.type"
              placeholder=""
              v-model="global.memo.type"
              :options="global.types"
              class="vm-text-sm tw-h-[38px] vm-w-full"
            ></Select>
            <small
              v-if="global.nameRules?.type"
              class="vm-text-[#d13333]"
              id="type-help"
              >{{ global.nameRules?.type?.join(",") }}</small
            >
          </div>
          <div class="vm-mb-3">
            <p class="vm-text-xs vm-font-bold vm-text-gray-600">Department</p>
            <MultiSelect
              :invalid="global.nameRules?.department"
              :disabled="global.memo.type === 'REQUEST'"
              placeholder="Send to"
              option-label="name"
              option-value="id"
              v-model="global.memo.department_id"
              :options="global.departments"
              class="vm-text-sm tw-h-[38px] vm-w-full"
            ></MultiSelect>
            <small
              v-if="global.nameRules?.department"
              class="vm-text-[#d13333]"
              id="department-help"
              >{{ global.nameRules?.department?.join(",") }}</small
            >
          </div>
        </div>
        <div>
          <p class="vm-text-xs vm-font-bold vm-text-gray-600">
            Manage approvers
          </p>

          <!-- <Tag v-for="approver in global.memo.approvers" severity="warn" value="Warn" rounded></Tag> -->
        </div>

        <MultiSelect
          v-model="approvers"
          display="chip"
          filter
          :options="global.members"
          optionLabel="full_name"
          placeholder="Select Approvers"
          :maxSelectedLabels="3"
          class="vm-w-full vm-mb-3"
        >
          <!-- <template #header>
            <div class="vm-flex vm-justify-center vm-p-3">
              <InputText
                placeholder="Search for name"
                label=""
                class="tw-w-full tw-mt-2"
                size="small"
                @input="asyncFind"
                v-model="searchInput"
              />
            </div>
          </template> -->
        </MultiSelect>
      </div>
      
      <MemoEditor
        v-model="global.memo.content"
        :nameRules="global.nameRules"
      />
      <!-- <Card class="vm-border vm-border-gray-200 vm-shadow-none" :class="global.nameRules?.content?'vm-border vm-border-[red]':''">
        <template #content>
          <Editor
            class="memoEditor"
            @load="getInstance"
            :key="global.memo?.id"
            v-model="global.memo.content"
            editorStyle="height: 320px;border-color:#fff;font-size:16px; "
            :pt="{ toolbar: { class: 'vm-border-0 vm-border-b-2' } }"
          >
            <template v-slot:toolbar>
              <span class="ql-formats">
                <button v-tooltip.bottom="'align'" class="ql-align"></button>
                <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
                <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
                <button
                  v-tooltip.bottom="'Underline'"
                  class="ql-underline"
                ></button>
                <button v-tooltip.bottom="'link'" class="ql-link"></button>
                <button v-tooltip.bottom="'image'" class="ql-image"></button>
                <button v-tooltip.bottom="'video'" class="ql-video"></button>
              </span>
            </template>
          </Editor>
        </template>
      </Card> -->
    </div>
  </Transition>
  <Drawer
      v-model:visible="global.make_comment"
      :position="global.isMdUp ? 'right' : 'bottom'"
      @hide="global.content_to_show = 'viewer'"
      :class="global.isMdUp ? '!vm-w-[60%] !vm-h-full' : ''"
      style="height: auto"
    >
      <template #header>
          <ButtonGroup>
            <Button
              size="small"
              :loading="buttonLoading"
              label="Send Comment"
              @click="sendComment"
            />
          </ButtonGroup>
        </template>
        <MemoEditor
          :reply="true"
          v-model="global.comment"
          :nameRules="global.nameRules"
        />
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
      editedCommentContent: ''
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
    }
  },
};
</script>

<style scoped>
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
