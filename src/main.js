import { createApp } from 'vue'
import App from './App.vue'
import 'primeicons/primeicons.css'
import { createPinia } from 'pinia'


const app = createApp(App);
const pinia = createPinia()

app.use(pinia);

import "./assets/main.css"
import VueMemo from '.';

app.use(VueMemo, {
    token: "demo-token",
    baseUrl: "https://jsonplaceholder.typicode.com",
    colors: {
        primary: '#3b82f6'
    }
});
app.mount('#memo-app-vm')
