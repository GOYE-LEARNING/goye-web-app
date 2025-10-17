/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        primaryColors: ['#3F1F22'], // brown colour
        secondaryColors: ['#F9F7F7'], // greyish colour
        plainColors: ['#FFFFFF'], //white colour
        nearTextColors: ['#41415A'] // near gray
      }
    },
  },
  plugins: [],
}

