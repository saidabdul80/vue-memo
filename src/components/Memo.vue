<template>
  <div>
    <div class="vm-grid vm-grid-cols-1 vm-gap-4">
      <div>
       
      </div>
      
      <!-- <div class="vm-grid vm-grid-cols-10 vm-gap-4"> -->
      <div class=" xl:vm-col-span-3 ">
        <!-- <div class="vm-col-span-10 md:vm-col-span-4 xl:vm-col-span-3"> -->
        <List />
      </div>
      <!-- <div
        class="vm-hidden md:vm-block vm-col-span-10 md:vm-col-span-6 xl:vm-col-span-7"
      >
      <div v-if="store.content_to_show == 'editor'" class="vm-mb-3 vm-mt-12">
        <Button size="small" class="vm-mr-1" :loading="store.loading" @click="sendMemo" label="Send" />
        <Button size="small" outlined="" class="vm-mx-1" :loading="store.loading" @click="sendMemo" label="Save as Draft" />
      </div>
        <Content />
      </div> -->
    </div>
    <div class="md:!vm-hidden vm-block ">
    <Drawer
      v-model:visible="store.drawer"
      
      :position="isMdUp?'right':'bottom'"
      @hide="store.content_to_show = 'viewer'"
      :class="isMdUp?'!vm-w-[60%] !vm-h-full':''"
      style="height: auto">
      <template #header>
        <div v-if="store.content_to_show == 'editor'" class="vm-mb-3  vm-mt-4">
          <ButtonGroup>
            <Button size="small"  :loading="buttonLoading.includes('SUBMITTED')" @click="sendMemo('SUBMITTED')" :label="store.memo?.id == null?'Send Memo':'Update Memo'" :severity="store.memo?.id == null?'primary':'warn'" />
            <Button size="small" v-if="store.memo?.id == null" :loading="buttonLoading.includes('DRAFT')" @click="sendMemo('DRAFT')" label="Save as Draft" severity="secondary" />
          </ButtonGroup>
        </div> 
        <div  v-else>
          <ButtonGroup>
            <Button size="small" severity="secondary" @click="store.compose" icon="pi pi-pencil" label="Compose New Memo"/>
            <Button v-if="!store.isMyMemo(store.memo) && store.memo.type == 'REQUEST'" :disabled="approver.status == 'APPROVED'" size="small" severity="primary" :loading="buttonLoading.includes('APPROVED')" icon="pi pi-check" @click="sendMemo('APPROVED')" label="Approve" />
            <Button v-if="!store.isMyMemo(store.memo) && store.memo.type == 'REQUEST'" :disabled="approver.status == 'REJECTED'" size="small" severity="danger"   :loading="buttonLoading.includes('REJECTED')" icon="pi pi-times" @click="sendMemo('REJECTED')" label="Reject" />
          </ButtonGroup>
        </div>
      </template>
      <Content />
    </Drawer>
    </div>

  </div>
  <NotificationRoot />
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import Content from "./Content.vue";
import List from "./List.vue";
import Drawer from "primevue/drawer";
import Button from "primevue/button";
import { $dt } from '@primevue/themes';
import { useClient } from "@/stores/client";
import InputText from "primevue/inputtext";
import ButtonGroup from "primevue/buttongroup";
import NotificationRoot from "./notifications/NotificationRoot.vue";

export default {
  props: {
    user: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    Content,
    Drawer,
    List,
    Button,
    InputText,
    ButtonGroup,
    NotificationRoot
  },
  data() {
    return {
      store: useGlobalsStore(),
      isMdUp: false,
      buttonLoading:[]
    };

  },
  created() {

    
    this.store.config = this.$memoglobals
    console.log(this.store.config)
    this.updateScreenSize();
    window.addEventListener('resize', this.updateScreenSize);
    this.store.boot();
    this.store.fetchData();
    this.store.fetchMembers();
   
   
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
  computed:{
    approver(){
      return this.store.memo.approvers.find(approver=>approver.approver_id == this.store.user.id && approver.approver_type == this.store.user.user_type)
    },
  },
  methods: {
    async sendMemo(status = "SUBMITTED"){
      this.buttonLoading.push(status)
      const memo =  {...this.store.memo};
      if(!this.store.isMyMemo(this.store.memo)){
        const ap =  {...this.approver}
        ap.status = status;
        memo.approvers = [ap];
      }else{
        memo.status = status;
      }

      const res = await useClient().http({method:'post', path:this.store.config.memosRoute,data:memo});
      if(res){
        this.store.fetchMemos();
        this.store.drawer = false
        this.store.memo = res
      }
      const index = this.buttonLoading.indexOf(status);
        if (index !== -1) {
            this.buttonLoading.splice(index, 1);
        }
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
