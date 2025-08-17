<template>
    <Card
      class="vm-border vm-border-gray-200 vm-shadow-none"
      :class="nameRules?.content ? 'vm-border vm-border-[red]' : ''"
    >
    <template #content>
          
        <Editor
          class="memoEditor"
          @load="getInstance"
          v-model="internalContent"
          editorStyle="height: 320px; border-color: #fff; font-size: 16px;"
          :pt="{ toolbar: { class: 'vm-border-0 vm-border-b-2' } }"
        >
          <template v-slot:toolbar>
            <div v-if="reply" class="vm-flex vm-items-center">
                <img src="@/assets/reply.png" width="20px" height="20px" />
                <div  class="vm-text-xs vm-ms-2">
                    <p class="vm-m-0">#{{ global.memo.type }}</p>
                    <span>{{ global.memo?.title }}</span>
                    <span class="vm-ms-2"> ({{ global.memo?.owner.full_name }})</span>
                </div>
            </div>
            <span class="ql-formats">
              <button v-tooltip.bottom="'align'" class="ql-align"></button>
              <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
              <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
              <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
              <button v-tooltip.bottom="'link'" class="ql-link"></button>
              <button v-tooltip.bottom="'image'" class="ql-image"></button>
              <button v-tooltip.bottom="'video'" class="ql-video"></button>
            </span>
          </template>
        </Editor>
      </template>
    </Card>
  </template>
  
  <script>
  import { useGlobalsStore } from "@/stores/globals";
import Card from "primevue/card";
  import Editor from "primevue/editor";
  
  export default {
    components: {
      Card,
      Editor,
    },
    props: {
        modelValue: { 
            type: String,
            required: true,
        },
        nameRules: {
            type: Object,
            required: false,
        },
        reply: {
            type: Boolean,
            required: false,
        },
    },
    data(){
        return {
            instance: null,
            global:useGlobalsStore()
        }
    },
    computed: {
        internalContent: {
        get() {
            return this.modelValue
        },
        set(newValue) {
            this.$emit('update:modelValue', newValue); 
        },
        },
    },
    methods: {
      getInstance(editor) {
        const instance = editor.instance;
        instance.setContents(
          instance.clipboard.convert({
            html: this.modelValue,
          })
        );
      },
    },
    watch: {
      content(newContent) {
        this.$emit('update:content', newContent);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add any specific styles for MemoEditor here */
  </style>
  