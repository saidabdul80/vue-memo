<template>

    <div class=" vm-bg-white  vm-pb-4">
      <TopMenus />
      <GlobalSearch />
  </div>
  <div>
    <div class="w-full vm-relative md:w-56 vm-border vm-shadow-md vm-rounded-md vm-border-[#e2e8f0] vm-p-3 vm-h-[80vh]">
      <div class="flex items-center p-2 border-b">
        <input type="checkbox" @change="toggleAll" :checked="selectAll" class="vm-ms-2" />
      </div>
      <div v-if="global.memos.length === 0" class="vm-flex vm-justify-center vm-items-center vm-flex-col v-h-[inherit]">
        <p class="vm-text-xl vm-text-gray-400 vm-font-bold vm-capitalize">No Memo {{ global.filters.status?.toLowerCase() }}</p>
        <i class="pi pi-folder-open vm-text-8xl vm-text-gray-200"></i>
      </div>
      <div v-else class="vm-max-h-[72vh] vm-overflow-auto">
        <div v-for="memo in global.memos" :v-show="!memoLoading" :key="memo.id" :class="global.memo.id === memo.id?'vm-bg-[var(--prime-highlight-background)]' :''" class="vm-flex vm-items-center vm-justify-between vm-border-b hover:vm-bg-[var(--prime-highlight-focus-background)] vm-cursor-pointer">
          <div class=" vm-p-2">
            <input type="checkbox" v-model="global.selectedMenus" :value="memo" class="mr-2" />
          </div>
          <div @click="selectList(memo)" class="md:vm-w-[95%]  vm-p-2 vm-ms-2 vm-cursor-pointer">
            <div class="vm-flex vm-justify-between vm-items-center">
              <span class="vm-font-bold vm-text-md" :style="{ color: global.config.colors?.primary }">{{ cleanHtml(memo.title).slice(0, 20) }}</span>
              <span class="vm-font-bold vm-opacity-45 vm-text-xs vm-uppercase" :style="{ color: global.config.colors?.primary }">{{ memo.type }}</span>
              <Badge v-if="memo.is_read === 0" class="vm-text-white vm-text-xs rounded-full px-2">Unread</Badge>
            </div>
            <p class="h-[25px] overflow-hidden  text-sm" >{{ cleanHtml(memo.content).slice(0, 100) }}</p>
          </div>
          <button
            type="button"
            class="w-[5%] text-gray-600 hover:text-gray-900"
            @click="toggle('overlay_menu_', $event, memo)"
            aria-haspopup="true"
            aria-controls="overlay_menu_"
          >
            <i class="pi pi-ellipsis-v"></i>
          </button>
        </div>
        <div  v-if="memoLoading">
          <MemoLoader v-for="x in 5" class="vm-mb-3" />
        </div>
      </div>
      <Button   class="vm-absolute vm-right-4 vm-bottom-4"size="small" @click="global.compose()" icon="pi pi-pencil" label="Compose New Memo"/>
    </div>
    <Menu ref="overlay_menu_" :id="'overlay_menu_'" :model="items" :popup="true" />
  </div>
</template>

<script>
import Button from "primevue/button";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import Menu from "primevue/menu";
import Select from "primevue/select";
import Menubar from "primevue/menubar";
import { useGlobalsStore } from "@/stores/globals";

import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Badge from "primevue/badge";
import GlobalSearch from "./GlobalSearch.vue";
import TopMenus from "./TopMenus.vue";
import Skeleton from "primevue/skeleton";
import MemoLoader from "./MemoLoader.vue";

export default {
  components: {
    Select,
    InputGroup,
    InputGroupAddon,
    InputText,
    Menu,
    Button,
    Menubar,
    IconField,
    InputIcon,
    Badge,
    TopMenus,
    MemoLoader,
    GlobalSearch
  },
  data() {
    return {
      global: useGlobalsStore(),
      item: {},
      items: [
        {
          label: "Options",
          items: [
            {
              label: "Edit",
              icon: "pi pi-pen-to-square",
              command:()=>{
                this.global.content_to_show = "editor"
                this.global.drawer =true;
              }
            },
            {
              label: "Delete",
              icon: "pi pi-trash",
              command:()=>{
                this.global.memo_option_type = 'delete'
              }
            },
          ],
        },
      ],
      selectAll: false,
      memoLoading:false,
    };
  },
  watch: {
    "global.filters": {
      handler: async function (newVal) {
        this.memoLoading = true;
        await this.global.fetchMemos(this.global.config.getMemosRoute, newVal);
        this.memoLoading = false;
      },
      deep: true,
    },
    // "global.memo_option_type":function(newVal){
    //   if(newVal == 'edit'){
    //     this.global.drawer =true;
    //     this.global.memo_option_type = null;
    //   }
    // }
  },
  
  created() { 
   this.global.fetchMemos(this.global.config.getMemosRoute, this.global.filters);
  },
  methods: {
    cleanHtml(text) {
      return text.replace(/<\/?[^>]+(>|$)/g, "");
    },
    toggle(ref, event, item) {
      this.global.memo = item;
      this.$refs['overlay_menu_'].toggle(event);
    },
    toggleAll(item = null) {
      if (item == null) {
        return;
      }
      if (this.selectAll) {
        this.global.selectedMenus = [];
      } else {
        this.global.selectedMenus = this.global.memos;
      }
      this.selectAll = !this.selectAll;
    },
    selectList(data) {
        this.global.memo = data
        data.is_read = 1;
        this.global.content_to_show = "viewer";
        this.global.drawer = true;
    },
  },
};
</script>
