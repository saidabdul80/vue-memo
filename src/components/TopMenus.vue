<template>
  <div class="memo-nav-container">
    <Menubar
      :model="menus"
      class="memo-nav glass"
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
          :class="{ 
            'active': menu.label === item.label,
            'scale-in': menu.label === item.label 
          }"
          @click="selectMenu(item)"
          v-bind="props.action"
        >
          <div class="nav-link-content">
            <div class="nav-icon-wrapper">
              <component :is="item.icon" class="nav-icon" />
            </div>
            <span class="nav-label">{{ item.label }}</span>
            <div v-if="item.badge" class="nav-badge pulse">{{ item.badge }}</div>
          </div>
          <PhCaretDown v-if="hasSubmenu" class="nav-caret" />
        </a>
      </template>
    </Menubar>
  </div>
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
.memo-nav-container {
  margin-bottom: var(--memo-space-lg);
  padding: 0 var(--memo-space-sm);
}

.memo-nav {
  border-radius: var(--memo-radius-xl);
  padding: var(--memo-space-sm);
  box-shadow: var(--memo-shadow-lg);
  border: 1px solid var(--memo-border-light);
  backdrop-filter: var(--memo-blur-md);
  position: relative;
  overflow: hidden;
}

.memo-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--memo-gradient-primary);
  opacity: 0.6;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: var(--memo-space-md) var(--memo-space-lg);
  text-decoration: none;
  color: var(--memo-text-secondary);
  border-radius: var(--memo-radius-lg);
  transition: var(--memo-transition);
  position: relative;
  overflow: hidden;
  min-height: 48px;
}

.nav-link-content {
  display: flex;
  align-items: center;
  gap: var(--memo-space-sm);
  position: relative;
  z-index: 2;
  flex: 1;
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--memo-radius-md);
  transition: var(--memo-transition);
}

.nav-link:hover .nav-icon-wrapper {
  background: rgba(99, 102, 241, 0.1);
  transform: scale(1.1);
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: var(--memo-transition-slow);
  z-index: 1;
}

.nav-link:hover {
  background: var(--memo-gradient-glass);
  color: var(--memo-primary-color);
  transform: translateY(-2px);
  box-shadow: var(--memo-shadow-md);
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link.active {
  background: var(--memo-gradient-primary);
  color: var(--memo-text-inverse);
  font-weight: 600;
  box-shadow: var(--memo-shadow-glow);
  position: relative;
}

.nav-link.active .nav-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: var(--memo-text-inverse);
  border-radius: var(--memo-radius-full);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.nav-icon {
  font-size: 1.25rem;
  transition: var(--memo-transition);
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-link.active .nav-icon {
  color: var(--memo-text-inverse);
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
}

.nav-label {
  font-size: 0.875rem;
  font-weight: 500;
  transition: var(--memo-transition);
  letter-spacing: 0.025em;
}

.nav-link.active .nav-label {
  font-weight: 600;
  color: var(--memo-text-inverse);
}

.nav-badge {
  background: var(--memo-gradient-accent);
  color: var(--memo-text-inverse);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--memo-radius-full);
  min-width: 20px;
  text-align: center;
  box-shadow: var(--memo-shadow-sm);
  margin-left: auto;
}

.nav-link.active .nav-badge {
  background: rgba(255, 255, 255, 0.25);
  color: var(--memo-text-inverse);
}

.nav-caret {
  margin-left: var(--memo-space-sm);
  font-size: 0.875rem;
  transition: var(--memo-transition);
}

.nav-link:hover .nav-caret {
  transform: rotate(180deg);
}

/* Responsive Design */
@media (max-width: 960px) {
  .memo-nav-container {
    padding: 0;
    margin-bottom: var(--memo-space-md);
  }
  
  .memo-nav {
    border-radius: var(--memo-radius-lg);
  }
  
  .nav-link {
    padding: var(--memo-space-sm) var(--memo-space-md);
    min-height: 44px;
  }
  
  .nav-label {
    font-size: 0.8rem;
  }
  
  .nav-icon {
    font-size: 1.1rem;
  }
}

/* Animation for active state */
@keyframes activeGlow {
  0%, 100% { box-shadow: var(--memo-shadow-glow); }
  50% { box-shadow: var(--memo-shadow-glow-hover); }
}

.nav-link.active {
  animation: activeGlow 2s ease-in-out infinite;
}
</style>