/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pr: {
          yellow: '#FDD238',
          'yellow-alt': '#FBD232',
          'yellow-accent': '#FED330',
          'yellow-orange': '#F29F05',
          black: '#14142B',
          'true-black': '#000000',
          white: '#FFFFFF',
          'text-secondary': '#4E4B66',
          'text-muted': '#A0A3BD',
          'text-dark': '#040707',
          outline: '#D9DBE9',
          'surface-light': '#F5F7FB',
          'surface-warm': '#F9F9F9',
          success: '#26B76E',
          'success-alt': '#10C89B',
          danger: '#FF4757',
          link: '#006CFF',
        },
      },
      fontFamily: {
        display: ['Gilroy', 'Bebas Neue', 'sans-serif'],
        sans: ['Eudoxus Sans', 'Barlow', 'system-ui', 'sans-serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        sidebar: '14px',
      },
      width: {
        sidebar: '256px',
        'sidebar-collapsed': '64px',
      },
    },
  },
  plugins: [],
};
