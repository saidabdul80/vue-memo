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
          <component :is="item.icon" />
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
    computed: {
      menus() {
        const predefinedMenus = [
          {
            label: "All",
            icon: "PhFolder",
            my_memo: true,
            active: "menu-active",
            name: "category",
          },
          {
            label: "INBOX",
            icon: "PhTray",
            my_memo: true,
            active: "menu-active",
            name: "category",
          },
          {
            label: "SENT",
            icon: "PhPaperPlaneRight",
            my_memo: true,
            active: "menu-active",
            name: "category",
          },
          {
            label: "STARRED",
            icon: "PhStar",
            my_memo: true,
            active: "menu-active",
            name: "category",
          },
          {
            label: "APPROVED",
            icon: "PhCheckCircle",
            my_memo: true,
            active: "menu-active",
            name: "status",
          },
          {
            label: "REJECTED",
            icon: "PhXCircle",
            my_memo: true,
            active: "menu-active",
            name: "status",
          },
        ];
        return predefinedMenus;
      },
    },
    methods: {
      selectMenu(item) {
        this.menus.forEach((menu) => {
          menu.active = "";
        });
        item.active = "menu-active";
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
    transform: translateX(40deg);
    transition: all .5s !important;
    color: v-bind($memoglobals.colors.primary);
    border-bottom: 3px solid v-bind($memoglobals.colors.primary) !important;
    background: #0001;
    border-radius: 5px 5px 0 0;
  }
  </style>
  