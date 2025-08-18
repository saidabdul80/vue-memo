<template>
    <div 
      class="glass-card memo-editor-card"
      :class="nameRules?.content ? 'vm-border vm-border-red-500' : ''"
    >
        <div class="editor-toolbar" v-if="reply">
            <div class="vm-flex vm-items-center vm-p-3 vm-border-b vm-border-white/20">
                <div class="reply-icon vm-w-5 vm-h-5 vm-mr-2">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                    </svg>
                </div>
                <div class="vm-text-xs vm-ms-2">
                    <p class="vm-m-0 vm-font-semibold vm-text-primary">#{{ global.memo.type }}</p>
                    <span class="vm-text-text-primary">{{ global.memo?.title }}</span>
                    <span class="vm-ms-2 vm-text-text-secondary"> ({{ global.memo?.owner?.full_name }})</span>
                </div>
            </div>
        </div>
        
        <div class="editor-container">
            <div class="editor-toolbar-actions vm-p-3 vm-border-b vm-border-white/20 vm-bg-white/5">
                <div class="vm-flex vm-gap-1 vm-flex-wrap">
                    <button @click="execCommand('bold')" class="toolbar-btn" :class="{ 'active': isActive('bold') }">
                        <PhTextB :size="16" />
                    </button>
                    <button @click="execCommand('italic')" class="toolbar-btn" :class="{ 'active': isActive('italic') }">
                        <PhTextItalic :size="16" />
                    </button>
                    <button @click="execCommand('underline')" class="toolbar-btn" :class="{ 'active': isActive('underline') }">
                        <PhTextUnderline :size="16" />
                    </button>
                    <div class="vm-w-px vm-h-6 vm-bg-white/20 vm-mx-1"></div>
                    <button @click="execCommand('justifyLeft')" class="toolbar-btn">
                        <PhTextAlignLeft :size="16" />
                    </button>
                    <button @click="execCommand('justifyCenter')" class="toolbar-btn">
                        <PhTextAlignCenter :size="16" />
                    </button>
                    <button @click="execCommand('justifyRight')" class="toolbar-btn">
                        <PhTextAlignRight :size="16" />
                    </button>
                </div>
            </div>
            
            <div 
                ref="editor"
                class="rich-editor"
                contenteditable="true"
                @input="onInput"
                @blur="onBlur"
                @focus="onFocus"
                :style="{ minHeight: '320px' }"
                v-html="internalContent"
            ></div>
        </div>
    </div>
  </template>
  
  <script>
  import { useGlobalsStore } from "@/stores/globals";
  import { PhTextB, PhTextItalic, PhTextUnderline, PhTextAlignLeft, PhTextAlignCenter, PhTextAlignRight } from '@phosphor-icons/vue';
  
  export default {
    components: {
      PhTextB,
      PhTextItalic,
      PhTextUnderline,
      PhTextAlignLeft,
      PhTextAlignCenter,
      PhTextAlignRight,
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
            global: useGlobalsStore(),
            isFocused: false,
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
        onInput(event) {
            this.internalContent = event.target.innerHTML;
        },
        onFocus() {
            this.isFocused = true;
        },
        onBlur() {
            this.isFocused = false;
        },
        execCommand(command, value = null) {
            if (typeof document !== 'undefined' && document.execCommand) {
                document.execCommand(command, false, value);
                if (this.$refs.editor) {
                    this.$refs.editor.focus();
                }
            }
        },
        isActive(command) {
            if (typeof document !== 'undefined' && document.queryCommandState) {
                return document.queryCommandState(command);
            }
            return false;
        },
    },
  };
  </script>
  
  <style scoped>
  /* Glass-morphism card for modern editor */
  .glass-card {
    @apply vm-backdrop-blur-xl vm-bg-white/10 vm-border vm-border-white/20 vm-rounded-2xl vm-shadow-2xl;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    box-shadow: 
      0 8px 32px 0 rgba(31, 38, 135, 0.37),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  }

  .memo-editor-card {
    @apply vm-transition-all vm-duration-300 vm-ease-out;
  }

  .memo-editor-card:hover {
    @apply vm-shadow-3xl;
    box-shadow: 
      0 12px 40px 0 rgba(31, 38, 135, 0.45),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
  }

  .editor-container {
    @apply vm-overflow-hidden vm-rounded-2xl;
  }

  .editor-toolbar-actions {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
    backdrop-filter: var(--memo-backdrop-blur);
  }

  .toolbar-btn {
    @apply vm-p-2 vm-rounded-lg vm-text-text-secondary vm-transition-all vm-duration-200;
    @apply hover:vm-bg-white/10 hover:vm-text-primary vm-border vm-border-transparent;
  }

  .toolbar-btn:hover {
    @apply vm-shadow-lg vm-scale-105;
  }

  .toolbar-btn:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  }

  .toolbar-btn.active {
    background-color: rgba(59, 130, 246, 0.2);
    color: var(--memo-primary);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .rich-editor {
    @apply vm-p-4 vm-text-base vm-leading-relaxed vm-outline-none vm-text-text-primary;
    background-color: rgba(255, 255, 255, 0.05);
    backdrop-filter: var(--memo-backdrop-blur);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .rich-editor:focus {
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.3);
  }

  .reply-icon {
    @apply vm-text-primary vm-opacity-80;
  }

  /* Rich text content styling */
  .rich-editor p {
    @apply vm-mb-3;
  }

  .rich-editor strong {
    @apply vm-font-semibold;
  }

  .rich-editor em {
    @apply vm-italic;
  }

  .rich-editor u {
    @apply vm-underline;
  }
  </style>
  