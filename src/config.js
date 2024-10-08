import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

function hexToRgb(hex) {
  let bigint = parseInt(hex.slice(1), 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  return { r, g, b };
}

// Function to convert RGB back to hex
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

// Function to lighten or darken color
function adjustColor({ r, g, b }, percentage) {
  const amount = Math.round(255 * (percentage / 100));
  return {
    r: Math.min(255, Math.max(0, r + amount)),
    g: Math.min(255, Math.max(0, g + amount)),
    b: Math.min(255, Math.max(0, b + amount)),
  };
}

// Function to generate shades
const generateColorShades = (baseHexColor) => {
  const baseRgb = hexToRgb(baseHexColor);
  const addBlack = (rgb) => adjustColor(rgb, -5); 
  return {
    50: rgbToHex(...Object.values(addBlack(adjustColor(baseRgb, 80)))), // Lighter by 80% then darken by 5%
    100: rgbToHex(...Object.values(addBlack(adjustColor(baseRgb, 60)))), // Lighter by 60% then darken by 5%
    200: rgbToHex(...Object.values(adjustColor(baseRgb, 40))), // Lighter by 40%
    300: rgbToHex(...Object.values(adjustColor(baseRgb, 20))), // Lighter by 20%
    400: rgbToHex(...Object.values(adjustColor(baseRgb, 10))), // Lighter by 10%
    500: baseHexColor, // Base color
    600: rgbToHex(...Object.values(adjustColor(baseRgb, -10))), // Darker by 10%
    700: rgbToHex(...Object.values(adjustColor(baseRgb, -20))), // Darker by 20%
    800: rgbToHex(...Object.values(adjustColor(baseRgb, -40))), // Darker by 40%
    900: rgbToHex(...Object.values(adjustColor(baseRgb, -60))), // Darker by 60%
    950: rgbToHex(...Object.values(adjustColor(baseRgb, -80))), // Darker by 80%
  };
};

let config = {
  baseUrl:'http://localhost:8000/api',
  colors: {
    primary: "#006033",
  },
  token: "",
  height:'80vh',
  primevue: {},
  getMembersRoute: "/memo/members",
  getBootRoute:"/memo/boot",
  getDepartmentsRoute: "/memo/departments",
  getStatusesRoute: "/memo/statuses",
  getTypesRoute: "/memo/types",
  getMemosRoute: "/memo/all",
  memosRoute: "/memo",
  approveMemoRoute: "/memo/approve",
  rejectMemoRoute: "/memo/reject",
};

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: generateColorShades(config.colors.primary),
  },
});

config.primevue = {
  override: true,
  theme: {
    preset: MyPreset,
    options: {
      prefix: "vm-prime",
      darkModeSelector: "none",
      cssLayer: false,
    },
  },
};

export const setConfig = (options) => {
  config = { ...config, ...options };
};

export const getConfig = () => config;
