<template>
  <Menubar
    :model="menus"
    class="memo-nav"
    :pt="{
      root: { class: 'nav-root' },
      menu: { class: 'nav-menu' },
      menuitem: { class: 'nav-item' },
      action: { class: 'nav-link' },
      icon: { class: 'nav-icon' },
      label: { class: 'nav-label' }
    }"
  >
    <template #item="{ item, props, hasSubmenu }">
      <a
        v-ripple
        class="nav-link"
        :class="{ 'active': menu.label === item.label }"
        @click="selectMenu(item)"
        v-bind="props.action"
      >
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
        <PhCaretDown v-if="hasSubmenu" class="nav-caret" />
      </a>
    </template>
  </Menubar>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import Menubar from "primevue/menubar";
import { 
  PhFolder, 
  PhTray, 
  PhPaperPlaneRight, 
  PhStar, 
  PhCaretDown 
} from "@phosphor-icons/vue";

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
    PhCaretDown
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
.memo-nav {
  background-color: var(--memo-surface);
  border-radius: var(--memo-radius-md);
  padding: 0.5rem;
  box-shadow: var(--memo-shadow-sm);
  border: 1px solid var(--memo-border);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--memo-text-secondary);
  border-radius: var(--memo-radius-sm);
  transition: var(--memo-transition);
  position: relative;
}

.nav-link:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--memo-primary-color);
}

.nav-link.active {
  color: var(--memo-primary-color);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background-color: var(--memo-primary-color);
}

.nav-icon {
  font-size: 1.25rem;
}

.nav-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.nav-caret {
  margin-left: 0.5rem;
  font-size: 0.875rem;
}
</style>