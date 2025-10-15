/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        primaryColors: ['#3F1F22'],
        secondaryColors: ['#F9F7F7'],
        plainColors: ['#FFFFFF'],
        
      }
    },
  },
  plugins: [],
}

