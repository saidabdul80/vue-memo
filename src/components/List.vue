<template>
  <div>
    <Menubar
      :model="menus"
      class="vm-h-[38px] vm-mb-3 vm-p-0 vm-border-0"
      :pt="{
        rootList: { class: 'vm-w-full !vm-flex-nowrap' },
        item: { class: 'vm-w-full vm-h-[38px]' },
        end:{class:'vm-ml-0'}
      }"
    >
      <template #item="{ item, props, hasSubmenu }" class="vm-w-full">
        <a
          v-ripple
          :class="item.active"
          @click="selectMenu(item)"
          :target="item.target"
          v-bind="props.action"
        >
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
        </a>
      </template>
      <template #end>
        <span class="md:vm-hidden vm-block vm-font-thin">{{ menu?.label }}</span>
      </template>
    </Menubar>
    <InputGroup class="vm-h-[38px] vm-mb-3">
      <InputGroupAddon class="vm-h-[38px] vm-bg-gray-200">
        <Select
          v-model="global.filters.status"
          :options="global.config.statuses"
          class="vm-border-0 vm-shadow-none vm-text-sm tw-h-[38px] vm-bg-gray-200"
        />
      </InputGroupAddon>
      <InputText class="vm-h-[38px]" placeholder="Search" />
    </InputGroup>
  </div>
  <div>
    <Listbox @change="selectList" filter optionLabel="title" v-model="global.memo" :options="global.config.memos"  class="w-full md:w-56" listStyle="max-height:72vh">
        <template #option="slotProps">
            <div class="items-center">
                <div>
                    <div class="vm-flex vm-justify-between">
                        <div  class="vm-font-bold vm-text-md" :style="[`color:${global.config.colors?.primary}`,]">{{ slotProps.option.title.slice(0,20) }}</div>
                        <Badge v-if="slotProps.option?.read == 0" value="Unread" size="small"/>
                    </div>
                    <p class="vm-h-[25px] vm-overflow-hidden vm-text-sm" v-html="slotProps.option.content"></p>
                </div>
            </div>
        </template>
    </Listbox>

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
import Listbox from "primevue/listbox";
import Badge from "primevue/badge";

export default {
  components: {
    Select,
    InputGroup,
    InputGroupAddon,
    InputText,
    Menu,
    Button,
    Menubar,
    Listbox,
    Badge
  },
  data() {
    return {
      global:useGlobalsStore(),
      menu:{},
      menus: [
        {
          label: "My Memos",
          icon: "pi pi-list-check",
          my_memo:true,
          active:'menu-active'
        },
        {
          label: "Send to Me",
          icon: "pi pi-verified",
          my_memo:false
        },
      ],
    };
  },
  watch:{
    'global.filters':{
      handler:function(newVal){
          this.global.fetchMembers(this.global.config.getMemosRoute, newVal)
      },
      deep:true
    }
  },
  created(){
    this.menu = this.menus[0]
    this.global.fetchMembers(this.global.config.getMemosRoute, this.global.filters)
  },
  methods:{
    selectMenu(item){
        this.menus.forEach(item=>{
            item.active = ''
        })
        item.active ='menu-active'
        this.menu = item
        this.global.filters.my_memo = item.my_memo
    },
    selectList(data){
        try{

            data.value.read = 1
            this.global.content_to_show = 'viewer'
            this.global.drawer = true
        }catch(e){
            
        }
    }

  }
};
</script>

<style scoped>
.menu-active{
    color: v-bind(global.config.colors.primary);
    border-bottom: 3px solid v-bind(global.config.colors.primary);
}

</style>
