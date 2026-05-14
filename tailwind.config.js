/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lightPrimaryColor: ["#3F1F22"], // brown for light mode
        lightFadedBrown: ["#EDE8E8"], // faded brown for light mode
        lightWhite: ["#f8f8f8"], // white for light mode
        lightSecondaryColor: ["#F5F5F5"], // light background
        lightBoldText: ["#1F2130"],
        primaryColors: ["#FFA500"], // brand orange
        secondaryColors: ["#121318"], // app background
        shadyColor: ["#1a1d26"], // elevated surface
        boldShadyColor: ["#252830"], // stronger surface
        textSlightDark: ["#E8EAEF"], // primary text on dark UI
        primaryYellow: ["#FBB041"], //yellow
        shadyYellow: ["#FE99000D"],
        textGrey: ["#9CA3B0"],
        shadyBlue: ["#2C7FFF0D"],
        boldBlue: ["#2C7FFF"],
        shadyGrreen: ["#30A46F0D"],
        boldGreen: ["#30A46F"],
        plainColors: ["#FFFFFF"], // text on orange / high contrast
        nearTextColors: ["#B8BCC8"], // secondary text on dark UI
      },
    },
  },
  plugins: [],
};
