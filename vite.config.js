import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import path from 'path';
export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  build: {
    lib: {
      entry: './src/index.js',
      name: 'VueMemo',
      fileName: (format) => `vue-memo.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'primeicons', 'pinia','quill','tailwindcss'],
      output: {
        globals: {
          vue: 'Vue',
          primeicons:'primeicons',
          pinia: 'pinia',
          quill:'quill',
          tailwindcss:'tailwindcss'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
  
});
