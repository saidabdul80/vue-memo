import Memo from './components/Memo.vue';
import { setConfig, getConfig } from './config';
import { useGlobalsStore } from './stores/globals';
//import 'primeicons/primeicons.css' // PrimeIcons

import './assets/main.css' // @apply components
function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return (
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    );
}

function adjustColor({ r, g, b }, percentage) {
    const amount = Math.round(255 * (percentage / 100));
    return {
        r: Math.min(255, Math.max(0, r + amount)),
        g: Math.min(255, Math.max(0, g + amount)),
        b: Math.min(255, Math.max(0, b + amount)),
    };
}

const VueMemo = {
    install(app, options = {}) {
        setConfig(options);
        const config = getConfig();

        if (config.colors) {
            for (const key in config.colors) {
                if (Object.hasOwnProperty.call(config.colors, key)) {
                    const colorValue = config.colors[key];
                    document.documentElement.style.setProperty(`--memo-${key}`, colorValue);
                   
                }
            }
        }

        app.component('Memo', Memo);
        app.config.globalProperties.$memoglobals = config
        useGlobalsStore().config = config
    }
};

export { Memo };
export default VueMemo;
