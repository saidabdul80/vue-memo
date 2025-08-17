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
  created() {
    this.global.config = this.$memoglobals;
    console.log(this.$memoglobals,33);
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
