import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import { useClient } from "./client";
import { useNotificationStore } from "@/stores/notification";

export const useGlobalsStore = defineStore('memo-globals', {
  state: () => ({
    content_to_show:'viewer',
    drawer:false,
    config: {
    },
    members: [],
    statuses: [],
    departments: [],
    types: [],
    buttonLoading:[],
    memos: [
      {
        id:1,
        read: 0,
        title: "Memo Title 1",
        department: "department",
        type: "Circular",
        content:
          "Interdum iaculis pharetra quam montes vitae volutpat tristique. Lorem ipsum dolor sit amet consectetur. Ultrices quis quis maecenas nunc duis. Cursus turpis maecenas porttitor ph",
      },
      {
        id:2,
        read: 0,
        title: "Memo Title 2",
        department: "department",
        type: "Request",
        content:
          "Interdum iaculis pharetra quam montes vitae volutpat tristique. Lorem ipsum dolor sit amet consectetur. Ultrices quis quis maecenas nunc duis. Cursus turpis maecenas porttitor ph",
      },
      {
        id:3,
        read: 0,
        title: "Memo Title 3",
        department: "department",
        type: "Circular",
        content:
          "Interdum iaculis pharetra quam montes vitae volutpat tristique. Lorem ipsum dolor sit amet consectetur. Ultrices quis quis maecenas nunc duis. Cursus turpis maecenas porttitor ph",
      },
      {
        id:4,
        read: 0,
        title: "Memo Title 4",
        department: "department",
        type: "Circular",
        content:
          "Interdum iaculis pharetra quam montes vitae volutpat tristique. Lorem ipsum dolor sit amet consectetur. Ultrices quis quis maecenas nunc duis. Cursus turpis maecenas porttitor ph",
      },
    ],
    user:{},
    next_page_url:null,
    prev_page_url:null,
    memo_option_type:null,
    pageLoading: false,
    nameRules: ref({}),
    currentPageName: {},
    abilities: ref([]),
    filters: reactive({
      search: null,
      paginate: null,
      status: "SUBMITTED",
      my_memo:null,
    }),
    memo:ref({}),
    refresh: false,
    alert: {
      show: false,
      text: '',
      title: '',
      imgpath: null,
      cancelBtnText: '',
      confirmBtnText: '',
      loading: false,
    },
    alertPromiseResolve: null,
    isOnlineStatus: false,
  }),
  actions: {
    setToken(token){
      this.config.token = token
    },
    setBaseUrl(baseUrl){
      this.config.baseUrl = baseUrl
    },
    setStatuses(statuses){
      this.statuses = statuses
    },
    setTypes(types){
      this.types = types
    },
    setMembers(members) {
      this.members = members.map(member => {
          return{
            full_name: member?.full_name,
            approver_id: member.approver_id,
            approver_type: member.approver_type
          }
      });
    },  
    updateNameRules(nameRules) {
      this.nameRules = nameRules;
      const msg = 'error';
    },
    setDepartments(d){
      this.departments = d
    },
    toCurrency(amount, symbol = true, shorten = true) {
      if (amount == null || isNaN(amount)) {
        return symbol ? '₦0' : '0';
      }

      let formattedAmount;
      const currencySymbol = '₦';
      amount = Number(amount)
      if (shorten && amount >= 1000000) {
        formattedAmount = (amount / 1000000).toFixed(1) + 'M';
      } else if (shorten && amount >= 100000) {
        formattedAmount = (amount / 1000).toFixed(1) + 'K';
      } else {
        formattedAmount = amount.toFixed(0);
        formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      if (symbol) {
        formattedAmount = `${currencySymbol}${formattedAmount}`;
      }

      return formattedAmount;
    },
    async fetchData() {
    
      const s = await useClient().http({ method: 'get', path: this.config.getStatusesRoute });
      if(s){
        this.setStatuses(s);
      }
      const t = await useClient().http({ method: 'get', path: this.config.getTypesRoute });
      if(t){
        this.setTypes(t);
      }
      const d = await useClient().http({ method: 'get', path: this.config.getDepartmentsRoute });
      if(d){
        this.setDepartments(d);
      }
      
    },
    setMemos(memos) {
      this.memos = memos.map(memo => {
          memo.approvers = memo.approvers.map(ap =>{
            return {
              ...ap,
              key:{
                full_name:ap?.full_name,
                approver_id:ap.approver_id,
                approver_type: ap.approver_type
              }
            }
          })
          return memo
      });
    },
    async fetchMemos(path=null, data = {}, fullPath = false){
      if(path == null){
        path = this.config.getMemosRoute;
      }
      const m = await useClient().http({ method: 'get', path, data,fullPath });
      
      if(m){
        this.setMemos(m.data)
        this.next_page_url =  m.meta.next_page_url
        this.prev_page_url =  m.meta.prev_page_url
      }
    },
    async fetchMembers(path=null, data = {}, fullPath = false){
      if(path == null){
        path = this.config.getMembersRoute;
      }
      const m = await useClient().http({ method: 'get', path, data,fullPath });
      if(m){
        this.setMembers(m)
      }
    },
    async boot(){
      console.log(this.config.getBootRoute)
      const m = await useClient().http({ method: 'get', path:this.config.getBootRoute});
      if(m){
        this.user = m.user
      }
    },
    isMyMemo(memo){
      return this.user?.id == memo?.owner_id && this.user?.user_type == memo?.owner_type
    },
    compose(){
      this.content_to_show = 'editor'
      this.memo = {}
      this.drawer = true
    },
    alert({ text, title, cancelBtnText, confirmBtnText,icon=null, loading = false, callback = () => { }, imgpath = null }) {
      return new Promise((resolve) => {
        this.alert = {
          show: true,
          text,
          title,
          imgpath,
          icon,
          cancelBtnText,
          confirmBtnText,
          callback,
          loading,
        };

        this.alertPromiseResolve = { callback, resolve };
      });
    },
    async handleAlertResponse(response) {
      if (this.alertPromiseResolve) {
        if (response) {
          this.alert.loading = true;
          await this.alertPromiseResolve.callback(response)
          this.alert.loading = false;
        }
        setTimeout(() => {
          this.alertPromiseResolve?.resolve(response);
          this.alertPromiseResolve = null;
          this.alert.show = false;
        }, 200)
      }
    },
    objectToFormData(obj, form = new FormData(), namespace = '') {
        for (let property in obj) {
            if (!obj.hasOwnProperty(property) || obj[property] === undefined) continue;
            const formKey = namespace ? `${namespace}[${property}]` : property;
            
            if (obj[property] instanceof Date) {
                form.append(formKey, obj[property].toISOString());
            } else if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
                this.objectToFormData(obj[property], form, formKey);
            } else {
                form.append(formKey, obj[property]);
            }
        }
        return form;
    }
    
  }
});