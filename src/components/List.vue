<template>

  <div class=" vm-bg-gray-200  vm-pb-4">
      <TopMenus />
      <GlobalSearch />
  </div>
  <div>
    <div class="w-full vm-relative vm-pb-4 md:w-56 vm-border vm-shadow-md vm-rounded-b-md vm-border-[#e2e8f0] vm-py-3" :style="'min-height:'+global.config.height">
      <div class="flex items-center p-2 border-b">
        <input type="checkbox" @change="toggleAll" :checked="selectAll" class="vm-ms-2" />
      </div>
      
      <div v-if="global.memos.length === 0" class="vm-flex vm-justify-center vm-items-center vm-flex-col vm-h-[inherit]">
        
        <p class="vm-text-2xl vm-text-gray-400 vm-mt-20 vm-font-bold vm-capitalize">No Memo {{ global.filters.status?.toLowerCase() }}</p>
        <PhFolderOpen class=" vm-text-8xl vm-text-gray-200"/>
      </div>
      <div v-else class="vm-overflow-auto vm-w-full " ref="containerDiv" :style="'max-height:'+ (parseInt(global.config.height)-3)+'vh'" >
      
        <div  v-if="!memoLoading" class="vm-pb-[6rem] md:vm-pb-0">
        <div v-for="memo in global.memos"  
            :key="memo.id" :class="global.memo.id === memo.id?'vm-bg-[var(--prime-highlight-background)]' :''" 
            class="vm-flex sm:vm-w-full vm-w-[86%] vm-items-center last:vm-border-b-0 vm-justify-between vm-border-b hover:vm-bg-[var(--prime-highlight-focus-background)] vm-cursor-pointer">
          <div class="vm-p-2">
            <input type="checkbox" v-model="global.selectedMenus" :value="memo" class="mr-2" />
          </div>
          <div class="vm-flex vm-justify-between vm-w-full" >
          <div @click="selectList(memo)" :style="'width:'+widespace+'px'" class="vm-p-2 md:vm-ms-2 vm-cursor-pointer">
            <div class="vm-flex vm-w-full vm-justify-between vm-items-center ">
              <span class="vm-font-bold vm-text-md vm-truncate" :style="{ color: global.config.colors?.primary }">{{ cleanHtml(memo.title).slice(0, 20) }}</span>
              <Badge v-if="memo.is_read === 0" class="vm-text-white vm-text-xs rounded-full px-2">Unread</Badge>
              <div>
              
              </div>
            </div>
            <div class="vm-flex vm-justify-between vm-w-full">
              <p class="vm-h-[25px] vm-truncate  overflow-hidden md:vm-text-[16px] vm-text-sm vm-w-[85%]" >{{ global.isMdUp? cleanHtml(memo.content).slice(0, 100): cleanHtml(memo.content).slice(0, 100) }}</p>
            </div>
          </div>
          <div :style="'width:'+smallspace+'px'" class=" vm-items-center vm-flex">
            <div>
              <p class="vm-font-bold vm-opacity-45 vm-text-xs vm-uppercase" :style="{ color: global.config.colors?.primary }">{{ memo.type }}</p>
              <p class="vm-font-bold vm-opacity-90 vm-text-[9px] md:vm-text-xs md:vm-ms-0 vm-ms-2 vm-whitespace-nowrap vm-w-[15%] vm-capitalize" style="flex-basis: max-content;" :style="{ color: global.config.colors?.primary }">{{ memo.time_at }}</p>
            </div>
            <button
              type="button"
              class=" text-gray-600 vm-pe-2 hover:text-gray-900"
              @click="toggle('overlay_menu_', $event, memo)"
              aria-haspopup="true"
              aria-controls="overlay_menu_"
            >
            <PhDotsThreeOutlineVertical weight="fill" />
            </button>

          </div>
           </div>
        </div>
        </div>
        <div  v-if="memoLoading">
          <MemoLoader v-for="x in 5" class="vm-mb-3" />
        </div>
      </div>
      
      <div class=" vm-absolute vm-bottom-0 md:vm-p-4 vm-p-2 vm-flex vm-flex-col md:vm-flex-row vm-gap-2 vm-items-center vm-justify-between vm-bg-white vm-w-full vm-border-t-2">
        <Pagination />
        <Button  size="small" @click="global.compose()" label="Compose New Memo">
          <template #icon>
              <PhPencil />
            </template>
            </Button>
      </div>
    </div>
    <Menu ref="overlay_menu_" :id="'overlay_menu_'" :model="items" :popup="true" >
      <template #item="{ item, props }">
        <a  v-ripple v-bind="props.action">
            <component :is="item.icon"  />
            <span class="tvm-ml-2">{{ item.label }}</span>
        </a>
    </template>
      </Menu>
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
import Pagination from "./Pagination.vue";
import { PhDotsThreeOutlineVertical, PhFolderOpen, PhPencil, PhTrash } from "@phosphor-icons/vue";

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
    Pagination,
    GlobalSearch,
    PhFolderOpen,
    PhPencil,
    PhDotsThreeOutlineVertical,
    PhTrash,
    PhPencil
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
              icon: PhPencil,
              command:()=>{
                this.global.content_to_show = "editor"
                this.global.drawer =true;
              }
            },
            {
              label: "Delete",
              icon: 'PhTrash',
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
  computed:{
    widespace(){
      console.log(this.global.currentSize)
      return this.getDivWidthPx(95)
    },
    smallspace(){
      console.log(this.global.currentSize)
      return this.getDivWidthPx(5)
    } , 
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateScreenSize);
  },
  created() { 
    this.updateScreenSize();
    window.addEventListener("resize", this.updateScreenSize);
   this.global.fetchMemos(this.global.config.getMemosRoute, this.global.filters);
  },
  methods: {
    updateScreenSize() {
      this.global.currentSize = window.innerWidth;
    },
    getDivWidthPx(percentage) {
      const div =  this.$refs.containerDiv;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      // Ensure the div exists
      
      if (!div) return 0;

      // Get the div's width
      const divWidth = div.clientWidth;
      // Calculate the pixel value
      const pxValue = (percentage / 100) * divWidth;

      return Math.round(pxValue) -100; // Return the rounded pixel value
    },
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
  mounted(){
    setTimeout(()=>{
      this.global.currentSize = 5
    },1000)
  }
};
</script>
