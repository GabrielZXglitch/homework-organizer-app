/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: '#4F46E5',
        'primary-hover': '#4338CA',
        'primary-container': '#4F46E5',
        'on-primary': '#FFFFFF',
        secondary: '#10B981',
        'success-active': '#059669',
        'secondary-container': '#10B981',
        'on-secondary-container': '#059669',
        tertiary: '#F59E0B',
        surface: '#F8FAFC',
        'surface-container-low': '#F1F5F9',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-high': '#E2E8F0',
        'on-surface': '#0F172A',
        'on-surface-variant': '#64748B',
        outline: '#94A3B8',
        'outline-variant': '#E2E8F0',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        'full': '9999px',
      },
      spacing: {
        'touch-target-min': '2.75rem',
        'screen-margin-mobile': '1rem',
        'card-padding-md': '1rem',
        'card-padding-lg': '1.5rem',
        'gap-xs': '0.25rem',
        'gap-sm': '0.5rem',
        'gap-md': '0.75rem',
        'gap-lg': '1rem',
        'gap-xl': '1.5rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'slide-up-delay-1': 'slide-up 0.6s ease-out 0.2s forwards',
        'slide-up-delay-2': 'slide-up 0.6s ease-out 0.4s forwards',
      }
    },
  },
  plugins: [],
}
