<template>
  <div class="memo-loader-container">
    <div class="glass-loader-card">
      <div class="loader-content">
        <div class="checkbox-skeleton shimmer-element"></div>
        <div class="content-skeleton">
          <div class="title-skeleton shimmer-element"></div>
          <div class="text-skeleton shimmer-element"></div>
          <div class="text-skeleton-short shimmer-element"></div>
        </div>
        <div class="action-skeleton">
          <div class="badge-skeleton shimmer-element"></div>
          <div class="dots-skeleton">
            <div class="dot shimmer-element floating" :style="{ animationDelay: '0s' }"></div>
            <div class="dot shimmer-element floating" :style="{ animationDelay: '0.5s' }"></div>
            <div class="dot shimmer-element floating" :style="{ animationDelay: '1s' }"></div>
          </div>
        </div>
      </div>
      
      <!-- Floating sparkles -->
      <div class="sparkle sparkle-1"></div>
      <div class="sparkle sparkle-2"></div>
      <div class="sparkle sparkle-3"></div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.memo-loader-container {
  @apply vm-w-full vm-p-1;
}

.glass-loader-card {
  @apply vm-relative vm-p-4 vm-rounded-2xl vm-backdrop-blur-lg;
  @apply vm-transition-all vm-duration-300 vm-overflow-hidden;
  background: var(--memo-glass-secondary);
  border: 1px solid var(--memo-glass-border);
  box-shadow: var(--memo-shadow-glass);
}

.glass-loader-card:hover {
  @apply vm-scale-[1.01];
  background: rgba(255, 255, 255, 0.1);
}

.loader-content {
  @apply vm-flex vm-items-center vm-w-full vm-relative vm-z-10;
}

.checkbox-skeleton {
  @apply vm-w-5 vm-h-5 vm-rounded-lg vm-mr-4 vm-flex-shrink-0;
}

.content-skeleton {
  @apply vm-flex-grow vm-space-y-3;
}

.title-skeleton {
  @apply vm-w-3/5 vm-h-4 vm-rounded-lg;
}

.text-skeleton {
  @apply vm-w-full vm-h-3 vm-rounded-lg;
}

.text-skeleton-short {
  @apply vm-w-4/5 vm-h-3 vm-rounded-lg;
}

.action-skeleton {
  @apply vm-flex vm-flex-col vm-items-end vm-gap-2 vm-ml-4;
}

.badge-skeleton {
  @apply vm-w-16 vm-h-6 vm-rounded-full;
}

.dots-skeleton {
  @apply vm-flex vm-gap-1;
}

.dot {
  @apply vm-w-1 vm-h-1 vm-rounded-full;
}

/* Enhanced shimmer effect */
.shimmer-element {
  @apply vm-relative vm-overflow-hidden;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.shimmer-element::before {
  content: '';
  @apply vm-absolute vm-inset-0 vm-rounded-lg;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer-overlay 2s infinite;
}

/* Floating sparkles */
.sparkle {
  @apply vm-absolute vm-w-1 vm-h-1 vm-rounded-full vm-pointer-events-none;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%);
  animation: sparkle 3s ease-in-out infinite;
}

.sparkle-1 {
  @apply vm-top-2 vm-left-4;
  animation-delay: 0s;
}

.sparkle-2 {
  @apply vm-top-8 vm-right-8;
  animation-delay: 1s;
}

.sparkle-3 {
  @apply vm-bottom-4 vm-left-1/3;
  animation-delay: 2s;
}

/* Floating animation for dots */
.floating {
  animation: floating 2s ease-in-out infinite;
}

/* Keyframes */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes shimmer-overlay {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes floating {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
  50% { transform: translateY(-8px) scale(1.2); opacity: 1; }
}

@keyframes sparkle {
  0%, 100% { 
    opacity: 0; 
    transform: translateY(0px) scale(0.5); 
  }
  50% { 
    opacity: 1; 
    transform: translateY(-10px) scale(1); 
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .glass-loader-card {
    @apply vm-p-3;
  }
  
  .checkbox-skeleton {
    @apply vm-w-4 vm-h-4;
  }
  
  .title-skeleton {
    @apply vm-h-3;
  }
  
  .text-skeleton, .text-skeleton-short {
    @apply vm-h-2;
  }
}
</style>
