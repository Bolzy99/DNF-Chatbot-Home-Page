/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#fbbf24',
          dark: '#0a0a0c',
          panel: '#121215',
        }
      }
    },
  },
  plugins: [],
}