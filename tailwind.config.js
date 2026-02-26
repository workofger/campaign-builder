/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pr: {
          yellow: '#FDD238',
          black: '#000000',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
