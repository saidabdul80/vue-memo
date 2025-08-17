import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { handleError } from '@/helpers/error-handling';
import { useGlobalsStore } from "./globals";

export const useClient = defineStore("client", () => {

  
  async function http(config = { method: 'get', path: '', data: {}, fullPath: false }) {
    let url = useGlobalsStore().config.baseUrl + config?.path.replace('//', '/');

    const token = useGlobalsStore().config.token
    if (config?.fullPath) {
      url = config?.path;
    }
    if (config.method.toLowerCase() === 'get' && config?.data != undefined) {
      const urlParams = new URLSearchParams(config.data).toString();
      if (config.fullPath) {
        url += '&' + urlParams;
      } else {
        url += '?' + urlParams;
      }
    }

    const headers = {};
    const withCredentials = useGlobalsStore().config.auth_type === 'session';

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (config?.data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    try {
      const response = await axios({
        method: config?.method,
        url: url,
        data: config?.data,
        headers: headers,
        responseType: config?.responseType,
        withCredentials,
      });
      useGlobalsStore().nameRules = ref({})
      useGlobalsStore().isOnlineStatus =true
      return response.data;
    } catch (error) {
      const errors = error?.response?.data?.errors;
      
      if (errors) {
        useGlobalsStore().updateNameRules(errors);
      }
      if (error?.response?.status === 401) {
        const route = window.currentRoute;
        if (route.meta.requiresAuth) {
          let userRootPath = '';
          /* console.log(useRoute()) */
          userRootPath = window.currentRoute.matched[0]?.path?.replace('/', '') || '';
          useGlobalsStore().logout(userRootPath)
          /* if(userRootPath != ''){
          }else{
            router.push({ path: `/` }); // Redirect to login or home page
          } */
        }
      }
      if(!error?.response){
        useGlobalsStore().isOnlineStatus =false
      }else{
        useGlobalsStore().isOnlineStatus =true
      }
      handleError(error);
      return false
    }
  }

  return { http };
});
