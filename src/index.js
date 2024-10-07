import Memo from './components/Memo.vue';
import { setConfig, getConfig } from './config';
import PrimeVue from 'primevue/config';
const VueMemo = {
    install(app, options = {}) {
        // Set the configuration using the options provided by the user
        setConfig(options);

        // Access and use the config anywhere in your package
        const config = getConfig();

        // Optionally initialize PrimeVue with options from the config
        app.use(PrimeVue, {
            theme:config.primevue.theme
        });
        
        
        app.component('Memo', Memo);
        app.config.globalProperties.$memoglobals = config 
    }
};
export { Memo };
export default VueMemo;
