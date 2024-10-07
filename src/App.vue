<template>
  <div class=" vm-p-3 " :style="[`border-color:${global.config.colors?.primary}`]">
  <Memo />
  </div>
</template>

<script>
import { useGlobalsStore } from './stores/globals';

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      global:useGlobalsStore()
    
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  
}
</style>
