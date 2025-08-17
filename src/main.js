import { createApp } from 'vue'
import App from './App.vue'
import 'primeicons/primeicons.css'
import { createPinia } from 'pinia'


const app = createApp(App);
import "./assets/main.css"
import VueMemo from '.';
const pinia = createPinia()

app.use(VueMemo, {
    // The token should be passed dynamically from the host application
    // token: "YOUR_AUTH_TOKEN"
});

app.use(pinia);
app.mount('#memo-app-vm')
