<template>
  <div class="search-container glass">
    <div class="search-wrapper">
      <IconField class="search-field">
        <div class="search-icon-wrapper">
          <PhMagnifyingGlass class="search-icon" />
        </div>
        <InputText 
          v-model="global.filters.search" 
          class="search-input" 
          placeholder="Search memos, content, authors..." 
          @focus="onFocus"
          @blur="onBlur"
          @input="onInput"
        />
        <Transition name="fade">
          <button 
            v-if="global.filters.search" 
            @click="clearSearch"
            class="clear-btn"
            type="button"
            aria-label="Clear search"
          >
            <PhXCircle class="clear-icon" />
          </button>
        </Transition>
      </IconField>
      <div class="search-indicator" :class="{ 'active': isSearching }"></div>
    </div>
  </div>
</template>

<script>
import { useGlobalsStore } from '@/stores/globals';
import { PhMagnifyingGlass, PhXCircle } from '@phosphor-icons/vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';

    export default {
        components: {
            IconField,
            InputIcon,
            InputText,
            PhMagnifyingGlass,
            PhXCircle
        },
        data() {
            return {
                global: useGlobalsStore(),
                isSearching: false,
                searchTimeout: null
            }
        },
        methods: {
            onFocus() {
                this.isSearching = true;
            },
            onBlur() {
                setTimeout(() => {
                    this.isSearching = false;
                }, 200);
            },
            onInput() {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    // Trigger search functionality here if needed
                    console.log('Searching for:', this.global.filters.search);
                }, 300);
            },
            clearSearch() {
                this.global.filters.search = '';
                this.$refs.searchInput?.focus();
            }
        }
    }
</script>

<style scoped>
.search-container {
  margin: var(--memo-space-lg) 0;
  padding: var(--memo-space-sm);
  border-radius: var(--memo-radius-xl);
  backdrop-filter: var(--memo-blur-md);
  border: 1px solid var(--memo-border-light);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-field {
  width: 100%;
  position: relative;
}

.search-icon-wrapper {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--memo-radius-md);
  background: var(--memo-gradient-primary);
  transition: var(--memo-transition);
}

.search-icon {
  font-size: 1.1rem;
  color: var(--memo-text-inverse);
  transition: var(--memo-transition);
}

.search-input {
  width: 100%;
  height: 3.5rem;
  padding: 0 4rem 0 4rem;
  border: 2px solid transparent;
  border-radius: var(--memo-radius-xl);
  background: var(--memo-surface-glass);
  backdrop-filter: var(--memo-blur-sm);
  color: var(--memo-text-primary);
  font-size: 1rem;
  font-weight: 500;
  transition: var(--memo-transition);
  outline: none;
  box-shadow: var(--memo-shadow-sm);
}

.search-input::placeholder {
  color: var(--memo-text-tertiary);
  font-weight: 400;
}

.search-input:focus {
  border-color: var(--memo-primary-color);
  background: var(--memo-surface);
  box-shadow: var(--memo-shadow-glow);
  transform: scale(1.02);
}

.search-input:focus + .search-indicator {
  transform: scaleX(1);
}

.clear-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--memo-text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--memo-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--memo-transition);
  z-index: 10;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--memo-error);
  transform: translateY(-50%) scale(1.1);
}

.clear-icon {
  font-size: 1.25rem;
}

.search-indicator {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 80%;
  height: 3px;
  background: var(--memo-gradient-primary);
  border-radius: var(--memo-radius-full);
  transition: var(--memo-transition);
  opacity: 0.8;
}

.search-indicator.active {
  transform: translateX(-50%) scaleX(1);
}

/* Focus animations */
.search-input:focus ~ .search-icon-wrapper {
  background: var(--memo-gradient-accent);
  transform: translateY(-50%) scale(1.1);
  box-shadow: var(--memo-shadow-glow);
}

.search-input:focus ~ .search-icon-wrapper .search-icon {
  transform: rotate(360deg);
}

/* Responsive design */
@media (max-width: 768px) {
  .search-container {
    margin: var(--memo-space-md) var(--memo-space-sm);
    max-width: none;
  }
  
  .search-input {
    height: 3rem;
    font-size: 0.9rem;
    padding: 0 3.5rem 0 3.5rem;
  }
  
  .search-icon-wrapper {
    width: 1.75rem;
    height: 1.75rem;
    left: 0.75rem;
  }
  
  .search-icon {
    font-size: 1rem;
  }
  
  .clear-btn {
    right: 0.75rem;
  }
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.8);
}

/* Loading state */
.search-input.loading {
  background-image: linear-gradient(90deg, transparent 25%, rgba(99, 102, 241, 0.1) 50%, transparent 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .search-input {
    background: rgba(30, 41, 59, 0.8);
    color: var(--memo-text-inverse);
  }
  
  .search-input::placeholder {
    color: rgba(148, 163, 184, 0.7);
  }
  
  .search-input:focus {
    background: rgba(30, 41, 59, 0.95);
  }
}
</style>
