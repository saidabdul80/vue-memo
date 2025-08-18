module.exports = {
  prefix: 'vm-',
  content: [
    './*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
    "./node_modules/vue-memo-fe/**/*.{vue,js,ts,jsx,tsx}", 
    
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--memo-primary-color)',
        'primary-hover': 'var(--memo-primary-hover)',
        secondary: 'var(--memo-secondary-color)',
        background: 'var(--memo-background)',
        surface: 'var(--memo-surface)',
        'text-primary': 'var(--memo-text-primary)',
        'text-secondary': 'var(--memo-text-secondary)',
        error: 'var(--memo-error)',
        success: 'var(--memo-success)',
        warning: 'var(--memo-warning)',
        info: 'var(--memo-info)',
        'unread-bg': 'var(--memo-unread-bg)',
      },
      borderColor: {
        DEFAULT: 'var(--memo-border)',
      },
      borderRadius: {
        sm: 'var(--memo-radius-sm)',
        md: 'var(--memo-radius-md)',
        lg: 'var(--memo-radius-lg)',
      },
      boxShadow: {
        sm: 'var(--memo-shadow-sm)',
        md: 'var(--memo-shadow-md)',
        lg: 'var(--memo-shadow-lg)',
      },
    },
    screens: {
      'md': '961px',
      'sm': '768px',
    },
  },
  important: true,
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
