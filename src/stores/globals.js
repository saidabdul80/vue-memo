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
    compose:false,
    pageLoading: false,
    nameRules: ref({}),
    currentPageName: {},
    abilities: ref([]),
    filters: reactive({
      search: null,
      paginate: null,
      status: "SUBMITTED",
      my_memo:true,
    }),
    memo:{},
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
      this.config.statuses = statuses
    },
    setTypes(types){
      this.config.types = types
    },
    setMembers(members){
      this.config.members = members
    },
    updateNameRules(nameRules) {
      this.nameRules = nameRules;
      const msg = 'error';
    },
    setDepartments(d){
      this.config.departments = d
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
    async fetchMembers(path=null, data = {}, fullPath = false){
      if(path == null){
        path = this.config.getMembersRoute;
      }
      const m = await useClient().http({ method: 'get', path, data,fullPath });
      
      if(m){
        this.setMembers(m.data)
        this.config.next_page_url =  m.meta.next_page_url
        this.config.prev_page_url =  m.meta.prev_page_url
      }
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