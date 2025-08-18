<template>
  <div class="memo-loader glass">
    <div class="loader-content">
      <div class="checkbox-skeleton shimmer"></div>
      
      <div class="memo-skeleton">
        <div class="title-skeleton shimmer"></div>
        <div class="content-skeleton shimmer"></div>
        <div class="meta-skeleton">
          <div class="type-skeleton shimmer"></div>
          <div class="time-skeleton shimmer"></div>
        </div>
      </div>
      
      <div class="actions-skeleton">
        <div class="dots-skeleton shimmer"></div>
      </div>
    </div>
    
    <!-- Floating animation elements -->
    <div class="loader-sparkle" style="--delay: 0s; --duration: 2s;"></div>
    <div class="loader-sparkle" style="--delay: 0.7s; --duration: 2.3s;"></div>
    <div class="loader-sparkle" style="--delay: 1.2s; --duration: 1.8s;"></div>
  </div>
</template>

<script>
import Skeleton from 'primevue/skeleton';

    export default {
        components: {
        },    
    }
</script>

<style scoped>
.memo-loader {
  border-radius: var(--memo-radius-xl);
  padding: var(--memo-space-lg);
  margin-bottom: var(--memo-space-md);
  backdrop-filter: var(--memo-blur-sm);
  border: 1px solid var(--memo-border-light);
  position: relative;
  overflow: hidden;
  animation: pulse-loader 2s ease-in-out infinite;
}

.loader-content {
  display: flex;
  align-items: center;
  gap: var(--memo-space-md);
  position: relative;
  z-index: 2;
}

.checkbox-skeleton {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: var(--memo-radius-sm);
  background: linear-gradient(90deg, 
    rgba(148, 163, 184, 0.2) 25%, 
    rgba(148, 163, 184, 0.4) 50%, 
    rgba(148, 163, 184, 0.2) 75%);
  background-size: 200% 100%;
}

.memo-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--memo-space-sm);
}

.title-skeleton {
  height: 1.2rem;
  width: 70%;
  border-radius: var(--memo-radius-md);
  background: linear-gradient(90deg, 
    rgba(99, 102, 241, 0.1) 25%, 
    rgba(99, 102, 241, 0.3) 50%, 
    rgba(99, 102, 241, 0.1) 75%);
  background-size: 200% 100%;
}

.content-skeleton {
  height: 3rem;
  width: 100%;
  border-radius: var(--memo-radius-md);
  background: linear-gradient(90deg, 
    rgba(148, 163, 184, 0.1) 25%, 
    rgba(148, 163, 184, 0.25) 50%, 
    rgba(148, 163, 184, 0.1) 75%);
  background-size: 200% 100%;
}

.meta-skeleton {
  display: flex;
  justify-content: space-between;
  gap: var(--memo-space-md);
}

.type-skeleton {
  height: 0.8rem;
  width: 4rem;
  border-radius: var(--memo-radius-sm);
  background: linear-gradient(90deg, 
    rgba(6, 182, 212, 0.2) 25%, 
    rgba(6, 182, 212, 0.4) 50%, 
    rgba(6, 182, 212, 0.2) 75%);
  background-size: 200% 100%;
}

.time-skeleton {
  height: 0.8rem;
  width: 3rem;
  border-radius: var(--memo-radius-sm);
  background: linear-gradient(90deg, 
    rgba(148, 163, 184, 0.2) 25%, 
    rgba(148, 163, 184, 0.4) 50%, 
    rgba(148, 163, 184, 0.2) 75%);
  background-size: 200% 100%;
}

.actions-skeleton {
  display: flex;
  align-items: center;
}

.dots-skeleton {
  width: 2rem;
  height: 2rem;
  border-radius: var(--memo-radius-full);
  background: linear-gradient(90deg, 
    rgba(148, 163, 184, 0.2) 25%, 
    rgba(148, 163, 184, 0.4) 50%, 
    rgba(148, 163, 184, 0.2) 75%);
  background-size: 200% 100%;
}

/* Shimmer animation */
.shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Pulse animation for the entire loader */
@keyframes pulse-loader {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.005);
  }
}

/* Floating sparkles */
.loader-sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--memo-gradient-primary);
  border-radius: 50%;
  animation: sparkle var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
}

.loader-sparkle:nth-child(2) {
  top: 20%;
  right: 15%;
}

.loader-sparkle:nth-child(3) {
  top: 60%;
  left: 10%;
}

.loader-sparkle:nth-child(4) {
  top: 80%;
  right: 40%;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .memo-loader {
    padding: var(--memo-space-md);
  }
  
  .loader-content {
    gap: var(--memo-space-sm);
  }
  
  .title-skeleton {
    width: 60%;
  }
  
  .content-skeleton {
    height: 2.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .checkbox-skeleton {
    background: linear-gradient(90deg, 
      rgba(71, 85, 105, 0.3) 25%, 
      rgba(71, 85, 105, 0.5) 50%, 
      rgba(71, 85, 105, 0.3) 75%);
    background-size: 200% 100%;
  }
  
  .title-skeleton {
    background: linear-gradient(90deg, 
      rgba(99, 102, 241, 0.2) 25%, 
      rgba(99, 102, 241, 0.4) 50%, 
      rgba(99, 102, 241, 0.2) 75%);
    background-size: 200% 100%;
  }
  
  .content-skeleton {
    background: linear-gradient(90deg, 
      rgba(71, 85, 105, 0.2) 25%, 
      rgba(71, 85, 105, 0.4) 50%, 
      rgba(71, 85, 105, 0.2) 75%);
    background-size: 200% 100%;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .memo-loader {
    border: 2px solid var(--memo-border);
  }
  
  .shimmer {
    animation: none;
    background: var(--memo-border) !important;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .shimmer,
  .memo-loader,
  .loader-sparkle {
    animation: none !important;
  }
}
</style>