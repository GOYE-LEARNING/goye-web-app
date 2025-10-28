/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryColors: ["#3F1F22"], // brown colour
        secondaryColors: ["#F9F7F7"], // greyish colour
        shadyColor: ["#FAF8F8"], // shady brown colour
        boldShadyColor: ["#EBE5E7"], //more shady colour
        textSlightDark: ["#1F2130"], //text dark
        primaryYellow: ["#FBB041"], //yellow
        shadyYellow: ["#FE99000D"],
        textGrey: ["#71748C"],
        shadyBlue: ["#2C7FFF0D"],
        boldBlue: ["#2C7FFF"],
        shadyGrreen: ["#30A46F0D"],
        boldGreen: ["#30A46F"],
        plainColors: ["#FFFFFF"], //white colour
        nearTextColors: ["#41415A"], // near gray
      },
    },
  },
  plugins: [],
};
