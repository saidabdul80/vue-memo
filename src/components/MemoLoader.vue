<template>
  <div class="vm-w-full vm-items-center vm-flex vm-ms-2">
    <div class="w-[5%] text-center vm-me-2">
    <Skeleton shape="rectangle" size="20px" />
    </div>
    <div class=" vm-mb-2 vm-w-[95%]">
      <!-- Title Skeleton -->
      <Skeleton shape="rectangle" width="40%" height="10px" class="vm-mb-1" />
      <Skeleton shape="rectangle" width="99%" height="30px" />
    </div>
    <div class="vm-flex vm-flex-col vm-justify-center vm-gap-1">
        <Skeleton shape="circle" size="5px" />
        <Skeleton shape="circle" size="5px" />
        <Skeleton shape="circle" size="5px" />
    </div>
  </div>
</template>

<script>
import Skeleton from 'primevue/skeleton';

    export default {
        components: {
            Skeleton,
        },    
    }
</script>

<style lang="scss" scoped>

</style>