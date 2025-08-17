<template>
    <Menubar
      :model="menus"
      class="vm-mb-3 vm-p-0 vm-border-0 vm-rounded-none"
      :pt="{
        rootList: { class: 'vm-w-full  !vm-flex-nowrap' },
        item: { class: 'vm-w-full vm-gap-0 vm-justify-none vm-h-[100%] vm-text-xs vm-mb-0' },
        end: { class: 'vm-ml-0' },
      }"
    >
      <template #item="{ item, props, hasSubmenu }" class="vm-w-full !vm-font-bold">
        <a
          v-ripple
          class="vm-transition-all vm-h-full vm-border-[3px] vm-font-bold vm-border-transparent"
          :class="menu.label == item.label ? 'menu-active' : ''"
          @click="selectMenu(item)"
          :target="item.target"
          v-bind="props.action"
        >
          <component :is="item.icon" size="20px"  />
          <span class="ml-2">{{ item.label }}</span>
          <PhCaretDown v-if="hasSubmenu" class="ml-2" />
        </a>
      </template>
      <template #end>
        <span class="md:vm-hidden vm-block ">{{ menu?.label }}</span>
      </template>
    </Menubar>
  </template>
  
  <script>
  import { useGlobalsStore } from "@/stores/globals";
  import Menubar from "primevue/menubar";
  import { PhFolder, PhTray, PhPaperPlaneRight, PhStar, PhCaretDown, PhCheckCircle, PhXCircle } from "@phosphor-icons/vue";
  
  export default {
    props: {
      menus: {
        type: Array,
        default: () => [
          {
            label: "All",
            icon: "PhFolder",
            name: "category",
          },
          {
            label: "INBOX",
            icon: "PhTray",
            name: "category",
          },
          {
            label: "SENT",
            icon: "PhPaperPlaneRight",
            name: "category",
          },
        ],
      },
    },
    components: {
      Menubar,
      PhFolder,
      PhTray,
      PhPaperPlaneRight,
      PhStar,
      PhCaretDown,
      PhCheckCircle,
      PhXCircle
    },
    data() {
      return {
        global: useGlobalsStore(),
        menu: {},
      };
    },
    created() {
      this.menu = this.menus[0];
    },
    methods: {
      selectMenu(item) {
        this.menu = item;
        this.global.filters.status = null;
        this.global.filters.category = null;
        this.global.filters[item.name] = item.label;
      },
    },
  };
  </script>
  
  <style scoped>
  .menu-active {
    transition: all 0.3s ease-in-out;
    color: v-bind('global.config.colors.primary');
    border-bottom: 3px solid v-bind('global.config.colors.primary');
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 5px 5px 0 0;
  }
  </style>
