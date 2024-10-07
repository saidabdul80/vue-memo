<template>
  <Menubar
    :model="menus"
    
    class="vm-h-[38px] vm-mb-3 vm-p-0 vm-border-0"
    :pt="{
      rootList: { class: 'vm-w-full !vm-flex-nowrap' },
      item: { class: 'vm-w-full vm-h-[38px] vm-text-xs' },
      end: { class: 'vm-ml-0' },
    }"
  >
    <template #item="{ item, props, hasSubmenu }" class="vm-w-full">
      <a
        v-ripple
        :class="menu.label == item.label ? 'menu-active' : ''"
        @click="selectMenu(item)"
        :target="item.target"
        v-bind="props.action"
      >
        <span :class="item.icon" />
        <span class="ml-2">{{ item.label }}</span>
        <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
      </a>
    </template>
    <template #end>
      <span class="md:vm-hidden vm-block vm-font-thin">{{ menu?.label }}</span>
    </template>
  </Menubar>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import Menubar from "primevue/menubar";

export default {
  components: {
    Menubar,
  },
  data() {
    return {
        global: useGlobalsStore(),
        menu: {},
    }
  },
  created(){
    this.menu = this.menus[0];
  },
  computed: {
    menus() {
      const predefinedMenus = [
        {
          label: "All",
          icon: "pi pi-folder",
          my_memo: true,
          active: "menu-active",
          name: "category",
        },
        {
          label: "INBOX",
          icon: "pi pi-inbox",
          my_memo: true,
          active: "menu-active",
          name: "category",
        },
        {
          label: "SENT",
          icon: "pi pi-send",
          my_memo: true,
          active: "menu-active",
          name: "category",
        },
        {
          label: "STARRED",
          icon: "pi pi-star",
          my_memo: true,
          active: "menu-active",
          name: "category",
        },
        {
          label: "APPROVED",
          icon: "pi pi-star",
          my_memo: true,
          active: "menu-active",
          name: "status",
        },
        {
          label: "REJECTED",
          icon: "pi pi-star",
          my_memo: true,
          active: "menu-active",
          name: "status",
        },
      ];
        return predefinedMenus;

    //   const dynamicMenus = this.global.statuses.map((status) => ({
    //     label: status,
    //     icon: "pi pi-tag",
    //     my_memo: false,
    //     name: "status",
    //   }));

    //   return [...predefinedMenus, ...dynamicMenus];
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
  color: v-bind($memoglobals.colors.primary);
  border-bottom: 3px solid v-bind($memoglobals.colors.primary);
  background: #0001;
  border-radius: 5px 5px 0 0;
}
</style>
