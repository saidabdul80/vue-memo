import { createApp } from 'vue'
import App from './App.vue'
import 'primeicons/primeicons.css'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import "./assets/main.css"

// 🟢 Import your components/plugins FIRST
import Memo from './components/Memo.vue'
import VueMemo from '.'  // assuming this is your plugin entry point

// 🟢 Define routes AFTER Memo is imported
const routes = [
  {
    path: '/',
    name: 'Memo',
    component: Memo
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// 🟢 Use your custom plugin
app.use(VueMemo, {
    // token: "YOUR_AUTH_TOKEN" // pass dynamically if needed
})

app.use(router)
app.mount('#memo-app-vm')
