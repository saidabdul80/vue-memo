
module.exports = {
  prefix: 'vm-',
  content: [
    './*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
    "./node_modules/vue-memo-fe/**/*.{vue,js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
    screens: {
      'md': '961px',
    },
  },
  important: true,
  plugins: [],
}  