<template>
  <div>
    <div class="vm-flex vm-justify-between vm-w-full ">
      <div>
        <p :style="[`color:${store.config.colors?.primary}`,]">MEMO</p>
      </div>
      <div>
        <Button @click="compose" icon="pi pi-pencil" label="Compose New Memo"/>
      </div>
    </div>
    <div class="vm-grid vm-grid-cols-10 vm-gap-4">
      <div class="vm-col-span-10 md:vm-col-span-4 xl:vm-col-span-3">
        <List />
      </div>
      <div
        class="vm-hidden md:vm-block vm-col-span-10 md:vm-col-span-6 xl:vm-col-span-7"
      >
        <Content />
      </div>
    </div>
    <div class="md:!vm-hidden vm-block ">
    <Drawer v-if="!isMdUp"
      v-model:visible="store.drawer"
      :header="store?.memo?.type"
      position="bottom"
      style="height: auto">
      <Content />
    </Drawer>
    </div>
  </div>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import Content from "./Content.vue";
import List from "./List.vue";
import Drawer from "primevue/drawer";
import Button from "primevue/button";
import { $dt } from '@primevue/themes';

export default {
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    Content,
    Drawer,
    List,
    Button
  },
  data() {
    return {
      store: useGlobalsStore(),
      isMdUp: false,
    };

  },
  created() {
    this.store.config = this.$memoglobals
    console.log(this.store.config)
    this.updateScreenSize();
    window.addEventListener('resize', this.updateScreenSize);
    
    this.store.fetchData();
    this.store.fetchMembers();
    $dt('primary.color').value.light.value = this.store.config.colors.primary
  //   this.primaryColor =  {
  //       name: '--primary-color',
  //       variable: 'var(--p-primary-color)',
  //       value: {
  //       light: {
  //           value: this.store.config.colors.primary,
  //           paths: {
  //               name: 'semantic.primary.color',
  //               binding: {
  //                   name: 'primitive.emerald.500'
  //               }
  //           }
  //       },
  //       dark: {
  //           value: this.store.config.colors.primary,
  //           paths: {
  //               name: 'semantic.primary.color',
  //               binding: {
  //                   name: 'primitive.emerald.400'
  //               }
  //           }
  //       }
  //   }
  // }
},
  watch: {
    config: {
      handler(c) {
        const config = this.deepMerge(this.store.config, c);
        this.store.config = config;
      },
      deep: true,
    },
  },
  methods: {
    compose(){
      this.store.content_to_show = 'editor'
      this.store.drawer = true
    },
    deepMerge(target, source) {
      for (const key in source) {
        if (source[key] instanceof Object && key in target) {
          Object.assign(source[key], this.deepMerge(target[key], source[key]));
        }
      }
      return { ...target, ...source };
    },
    updateScreenSize() {
      this.isMdUp = window.innerWidth >= 961; 
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateScreenSize);
  },
};
</script>

<style>
:root{
  
  --prime-button-primary-background: v-bind(store.config.colors.primary);
}

</style>
