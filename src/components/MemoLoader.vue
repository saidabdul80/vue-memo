<template>
  <div class="memo-loader-container">
    <div class="checkbox-skeleton"></div>
    <div class="content-skeleton">
      <div class="title-skeleton"></div>
      <div class="text-skeleton"></div>
    </div>
    <div class="dots-skeleton">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.memo-loader-container {
  @apply vm-flex vm-items-center vm-w-full vm-p-2;
}
.checkbox-skeleton {
  @apply vm-w-5 vm-h-5 vm-bg-gray-300 vm-rounded vm-mr-3;
}
.content-skeleton {
  @apply vm-flex-grow;
}
.title-skeleton {
  @apply vm-w-2/5 vm-h-3 vm-bg-gray-300 vm-rounded vm-mb-2;
}
.text-skeleton {
  @apply vm-w-full vm-h-8 vm-bg-gray-300 vm-rounded;
}
.dots-skeleton {
  @apply vm-flex vm-flex-col vm-gap-1 vm-ml-3;
}
.dot {
  @apply vm-w-1 vm-h-1 vm-bg-gray-300 vm-rounded-full;
}
</style>
