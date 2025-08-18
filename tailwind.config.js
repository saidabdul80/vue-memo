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
        // Glass-morphism colors
        'glass-primary': 'var(--memo-glass-primary)',
        'glass-secondary': 'var(--memo-glass-secondary)',
        'glass-border': 'var(--memo-glass-border)',
      },
      borderColor: {
        DEFAULT: 'var(--memo-border)',
      },
      borderRadius: {
        sm: 'var(--memo-radius-sm)',
        md: 'var(--memo-radius-md)',
        lg: 'var(--memo-radius-lg)',
        modern: 'var(--memo-radius-modern)',
        xl: 'var(--memo-radius-xl)',
      },
      boxShadow: {
        sm: 'var(--memo-shadow-sm)',
        md: 'var(--memo-shadow-md)',
        lg: 'var(--memo-shadow-lg)',
        glass: 'var(--memo-shadow-glass)',
        glow: 'var(--memo-shadow-glow)',
        floating: 'var(--memo-shadow-floating)',
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'floating': 'floating 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floating: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          'from': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          'to': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { transform: 'translateY(10px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
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
