/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
        },
        success: {
          DEFAULT: '#10B981',
          active: '#059669',
          light: '#ECFDF5',
        },
        urgent: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#F8FAFC',
        },
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-muted': '#94A3B8',
      },
    },
  },
  plugins: [],
}
