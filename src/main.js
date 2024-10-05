import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css'
import { createPinia } from 'pinia'


const app = createApp(App);
import "./assets/main.css"
import VueMemo from '.';
const pinia = createPinia()

// app.use(PrimeVue, {
//     theme: {
//         preset: Aura,
//         options: {
//           prefix: 'prime',
//           darkModeSelector: 'none',
//           cssLayer: false
//         }
//       }
// });
app.use(VueMemo, {
    
});

app.use(pinia);
app.mount('#memo-app-vm')
